import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('src/lib/admin/article-image.ts', 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod = {exports:{}};
new Function('module','exports',source)(mod,mod.exports);
const {imageFormat,imageDimensions,prepareArticleImage,MAX_UPLOAD_BYTES} = mod.exports;
test('detects JPEG bytes independently of uppercase extensions or missing MIME', () => {
  assert.deepEqual(imageFormat(new Uint8Array([255,216,255,224])),{mime:'image/jpeg',extension:'jpg'});
});
test('detects PNG and WebP but rejects SVG, text, truncated and renamed executables', () => {
  assert.equal(imageFormat(new Uint8Array([137,80,78,71,13,10,26,10])).extension,'png');
  assert.equal(imageFormat(new TextEncoder().encode('RIFF0000WEBP')).extension,'webp');
  for(const bytes of [[],[255,216],[77,90],Array.from(new TextEncoder().encode('<svg/>'))]) assert.equal(imageFormat(new Uint8Array(bytes)),null);
});
test('fits portrait and landscape images without upscaling', () => {
  assert.deepEqual(imageDimensions(6000,4000),{width:2400,height:1600});
  assert.deepEqual(imageDimensions(3000,6000),{width:1200,height:2400});
  assert.deepEqual(imageDimensions(800,600),{width:800,height:600});
  assert.throws(()=>imageDimensions(0,1));assert.throws(()=>imageDimensions(10000,10000));assert.throws(()=>imageDimensions(NaN,1));
});
test('rejects empty, oversized and fake images before browser decoding', async () => {
  await assert.rejects(prepareArticleImage(new File([], 'empty.jpg')),/20 MB/);
  await assert.rejects(prepareArticleImage({size:21*1024*1024}),/20 MB/);
  await assert.rejects(prepareArticleImage(new File(['not an image'],'renamed.jpg',{type:'image/jpeg'})),/geen ondersteunde/);
  assert.equal(MAX_UPLOAD_BYTES,6291456);
});
test('storage migration grants only editorial inserts and never weakens private buckets', () => {
  const sql=fs.readFileSync('supabase/migrations/20260921150000_article_images.sql','utf8');
  assert.match(sql,/public\.is_editorial\(\)/);assert.match(sql,/storage\.foldername\(name\)/);
  assert.match(sql,/for insert to authenticated/);assert.doesNotMatch(sql,/create policy[^;]+for (?:update|delete|all)/is);
  assert.doesNotMatch(sql,/update storage\.buckets/i);
});
