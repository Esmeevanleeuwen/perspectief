const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const ts = require('typescript');
const vm = require('node:vm');
const base = 'vendor/olympus-workspace-ui/';
test('the installed source matches the recorded Olympus package', () => {
  const provenance = JSON.parse(fs.readFileSync(base+'SOURCE.json','utf8'));
  assert.match(provenance.commit,/^[a-f0-9]{40}$/);
  assert.equal(provenance.repository,'Esmeevanleeuwen/olympus');
  for (const [file,hash] of Object.entries(provenance.files)) {
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(base+file)).digest('hex'),hash,`${file} drifted from Olympus`);
  }
});
test('Meridian access stays isolated and disabled preferences do not affect layout', () => {
  const context={exports:{}};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(base+'model.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,context);
  const {flagsFor,effectivePreferences}=context.exports;
  const flags=flagsFor([{platform_id:'olympus',feature_id:'sidebar.customize',enabled:true}],'meridian');
  assert.equal(flags['sidebar.customize'],false);
  const effective=effectivePreferences({width:'wide',shortcuts:['/admin']},flags);
  assert.equal(effective.width,'compact');
  assert.equal(effective.shortcuts.length,0);
});
