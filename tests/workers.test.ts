import { describe, expect, it } from 'vitest';
import { threadId } from 'node:worker_threads';
import {
  echo,
  voidResult,
  fail,
  pooled,
  identity,
  child,
  childVoid,
  poolIdentity,
  childPoolIdentity,
  pooledFail,
} from './fixtures-dist/workers.js';

describe('real workers from Vitest', () => {
  it.each([42, 0, false, '', null])('returns %j', async (value) => {
    expect(await echo(value)).toEqual(value);
  });
  it('returns undefined', async () => {
    expect(await voidResult()).toBeUndefined();
  });
  it('rejects errors', async () => {
    await expect(fail()).rejects.toThrow('expected failure');
  });
  it('runs outside the Vitest worker and creates a fresh thread per call', async () => {
    const first = await identity();
    const second = await identity();
    expect(first.pid).toBe(process.pid);
    expect(first.threadId).not.toBe(threadId);
    expect(second.threadId).not.toBe(first.threadId);
  });
  it('handles concurrent pooled calls', async () => {
    expect(await Promise.all([0, false, '', null, 5].map(pooled))).toEqual([
      0,
      false,
      '',
      null,
      5,
    ]);
  });
  it('shares at most two worker threads across overlapping calls', async () => {
    const ids = await Promise.all(
      Array.from({ length: 8 }, () => poolIdentity()),
    );
    expect(new Set(ids).size).toBe(2);
    expect(ids).not.toContain(threadId);
  });
  it('shares at most two child processes across overlapping calls', async () => {
    const ids = await Promise.all(
      Array.from({ length: 8 }, () => childPoolIdentity()),
    );
    expect(new Set(ids).size).toBe(2);
    expect(ids).not.toContain(process.pid);
  });
  it('isolates a pooled call rejection from other calls', async () => {
    const results = await Promise.allSettled([1, 0, 2].map(pooledFail));
    expect(results[0]).toEqual({ status: 'fulfilled', value: 1 });
    expect(results[1]).toMatchObject({ status: 'rejected' });
    expect(results[2]).toEqual({ status: 'fulfilled', value: 2 });
  });
  it('supports child processes', async () => {
    expect(await child(false)).toBe(false);
    expect(await childVoid()).toBeUndefined();
  });
});
