import { threadFunc } from 'thread-func';

// Use child_process instead of worker_threads
export const isolatedTask = threadFunc(
  async (data: { value: number }) => {
    console.log('[Child Process] Processing:', data.value);
    return data.value * 2;
  },
  { variant: 'child_process' },
);
