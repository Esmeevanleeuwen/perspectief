import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Only this allowlist is imported from Olympus. App code never enters Meridian.
const files = ['package.json', 'model.ts', 'sidebar.tsx', 'access.tsx', 'styles.css'];
const repository = 'Esmeevanleeuwen/olympus';
const destination = path.resolve('vendor/olympus-workspace-ui');
const requestedRef = process.argv.find(argument => argument.startsWith('--ref='))?.slice(6) || 'main';
const localSource = process.argv.find(argument => argument.startsWith('--local='))?.slice(8);
const headers = { Accept: 'application/vnd.github+json', ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) };
async function remote(url, json = false) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Source fetch failed (${response.status}). Existing package has not been replaced.`);
  return json ? response.json() : response.text();
}
const commit = localSource ? requestedRef : (await remote(`https://api.github.com/repos/${repository}/commits/${encodeURIComponent(requestedRef)}`, true)).sha;
if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('An immutable source commit is required.');
const sources = await Promise.all(files.map(async file => [file, localSource
  ? await readFile(path.join(localSource, file), 'utf8')
  : await remote(`https://raw.githubusercontent.com/${repository}/${commit}/packages/workspace-ui/${file}`)]));
const manifest = JSON.parse(sources.find(([name]) => name === 'package.json')[1]);
if (manifest.name !== '@olympus/workspace-ui' || !/^1\./.test(manifest.version) || manifest.scripts || manifest.dependencies) {
  throw new Error('The shared package contract changed. Review the major version or dependency changes before updating.');
}
const hashes = Object.fromEntries(sources.map(([name, content]) => [name, createHash('sha256').update(content).digest('hex')]));
let previous;
try { previous = JSON.parse(await readFile(path.join(destination, 'SOURCE.json'), 'utf8')); } catch { /* Initial install. */ }
if (JSON.stringify(previous?.files) === JSON.stringify(hashes)) {
  console.log('Shared workspace is already up to date.');
} else {
  await mkdir(destination, { recursive: true });
  for (const [name, content] of sources) await writeFile(path.join(destination, name), content);
  await writeFile(path.join(destination, 'SOURCE.json'), JSON.stringify({ repository, commit, version: manifest.version, files: hashes }, null, 2) + '\n');
  console.log(`Shared workspace updated from ${repository}@${commit}.`);
}
