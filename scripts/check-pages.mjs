import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

const base = '/file-island-echoes/';
const root = resolve('dist');
const html = readFileSync(join(root, 'index.html'), 'utf8');
assert.match(html, /<meta\s+name="robots"\s+content="noindex, nofollow, noarchive, nosnippet"\s*\/?\s*>/);
assert.equal(readFileSync(join(root, 'robots.txt'), 'utf8').trim(), 'User-agent: *\nDisallow: /');
assert.doesNotMatch(html, /application\/ld\+json|property=["']og:|name=["']twitter:|rel=["']canonical/i);

const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
assert(refs.some(ref => ref.endsWith('.js')), 'Built entry script is missing');
for (const ref of refs) {
  assert(ref.startsWith(base), `Resource is outside the project path: ${ref}`);
  assert(statSync(join(root, ref.slice(base.length))).isFile(), `Missing built resource: ${ref}`);
}

let checked = 0;
function inspect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    assert(!entry.isSymbolicLink(), 'Pages output must not contain symlinks');
    if (entry.isDirectory()) { inspect(file); continue; }
    assert(!/^(?:\.env(?:\.|$)|sitemap)|\.(?:map|pem|key)$/i.test(entry.name), 'Unexpected deployment file');
    const text = readFileSync(file, 'utf8');
    assert.doesNotMatch(text, /[A-Z]:[\\/]|\/(?:Users|home)\//, 'Personal filesystem path in output');
    assert.doesNotMatch(text, /gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-[A-Za-z0-9_-]{32,}|-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'Credential-like value in output');
    checked++;
  }
}
inspect(root);
console.log(`Pages checks passed: ${checked} files; project paths, crawler directives and common credential/path patterns.`);
