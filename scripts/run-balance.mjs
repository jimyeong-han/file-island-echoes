import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
await mkdir('test-results', { recursive: true });
await build({ entryPoints: ['scripts/balance-simulation.ts'], outfile: 'test-results/balance.mjs', bundle: true, platform: 'node', format: 'esm' });
const { balanceReport } = await import('../test-results/balance.mjs');
console.table(balanceReport());
