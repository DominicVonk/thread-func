import { threadFunc } from '../dist/thread-func.js';

const options = {
  ...(process.env.TEST_POOL ? { poolSize: 2 } : {}),
  variant: process.env.TEST_VARIANT || 'worker_threads',
};

export const echo = threadFunc(async (value) => value, options);
export const voidResult = threadFunc(async () => undefined, options);
export const other = threadFunc(async (value) => `other:${value}`, options);
export const fail = threadFunc(async () => {
  throw new TypeError('expected failure');
}, options);
