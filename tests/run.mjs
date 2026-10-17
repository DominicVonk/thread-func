import assert from 'node:assert/strict';
import { echo, other, fail, voidResult } from './functions.mjs';

// Deno pools keep workers alive. Exit explicitly after assertions; a deadline
// turns unresolved calls into failures rather than leaving the test hanging.
const deadline = setTimeout(() => {
  console.error('FAIL: a worker call did not settle');
  process.exit(1);
}, 10000);

try {
  for (const value of [42, 0, false, '', null]) {
    assert.deepEqual(await echo(value), value);
  }
  assert.equal(await voidResult(), undefined);
  assert.deepEqual(
    await Promise.all([echo(0), other('a'), voidResult(), other('b'), echo(5)]),
    [0, 'other:a', undefined, 'other:b', 5],
  );
  await assert.rejects(fail(), { message: 'expected failure' });
  assert.equal(await echo('after error'), 'after error');
  console.log(
    'PASS',
    process.env.TEST_VARIANT || 'worker_threads',
    process.env.TEST_POOL ? 'pool' : 'single',
  );
  clearTimeout(deadline);
  process.exit(0);
} catch (error) {
  console.error(error);
  process.exit(1);
}
