import { spawnSync } from 'node:child_process';

let failed = false;
const deno = Boolean(process.versions.deno);
for (const variant of deno
  ? ['worker_threads']
  : ['worker_threads', 'child_process']) {
  for (const pool of ['', '1']) {
    const result = spawnSync(
      process.execPath,
      [...(deno ? ['run', '-A'] : []), 'tests/run.mjs'],
      {
        env: { ...process.env, TEST_POOL: pool, TEST_VARIANT: variant },
        stdio: 'inherit',
        timeout: 15000,
      },
    );
    if (result.error) console.error(result.error);
    if (result.status !== 0) failed = true;
  }
}
process.exitCode = failed ? 1 : 0;
