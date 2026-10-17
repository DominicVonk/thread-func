import { threadFunc } from '../../dist/thread-func.js';
import { threadId } from 'node:worker_threads';

type Value = number | boolean | string | null;
export const echo = threadFunc(async (value: Value) => value);
export const voidResult = threadFunc(async () => undefined);
export const fail = threadFunc(async () => {
  throw new TypeError('expected failure');
});
export const pooled = threadFunc(async (value: Value) => value, {
  poolSize: 2,
});
export const identity = threadFunc(async () => ({
  threadId,
  pid: process.pid,
}));
export const child = threadFunc(async (value: Value) => value, {
  variant: 'child_process',
});
export const childVoid = threadFunc(async () => undefined, {
  variant: 'child_process',
});

export const poolIdentity = threadFunc(
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 25));
    return threadId;
  },
  { poolSize: 2 },
);
export const childPoolIdentity = threadFunc(
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 25));
    return process.pid;
  },
  { poolSize: 2, variant: 'child_process' },
);
export const pooledFail = threadFunc(
  async (value: number) => {
    if (value === 0) throw new Error('pool failure');
    return value;
  },
  { poolSize: 2 },
);
