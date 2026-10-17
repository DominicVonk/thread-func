import { threadFunc } from 'thread-func';

// Create a worker pool with 4 workers
export const processItem = threadFunc(
  async (item: string) => {
    console.log('[Worker] Processing:', item);

    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 100));

    return item.toUpperCase();
  },
  { poolSize: 4 },
);
