import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const source = readFileSync(
  new URL("../src/lib/auth/paths.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const exports = {};
new Function("exports", "process", compiled)(exports, process);
for (const input of [
  "https://evil.test",
  "//evil.test",
  "/\\evil.test",
  "/\nevil.test",
  "/auth/callback?next=//evil.test",
  "/login",
  "/registreren",
  null,
])
  assert.equal(exports.safeNext(input), "/account");
for (const input of [
  "/account/bibliotheek/voorbeeld",
  "/admin/ledencontent?status=draft",
  "/artikelen/test#lees",
])
  assert.equal(exports.safeNext(input), input);
assert.equal(exports.safeNext("/%2F%2Fevil.test"), "/%2F%2Fevil.test");
console.log(
  "PASS: return paths remain on the current origin, including encoded paths.",
);
