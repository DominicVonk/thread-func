// Safe wrapper for worker_threads that works in all runtimes
// This module uses dynamic import to avoid errors when worker_threads is not available
// 
// Note: We use top-level await here to dynamically import worker_threads.
// This is necessary because:
// 1. Static imports of 'node:worker_threads' fail in Deno
// 2. The detection must happen at module load time to work correctly with Worker construction
// 3. Top-level await is well-supported in Node.js 14.8+, Deno, and Bun with ESM
// 4. This module is only imported once per process, so the async nature doesn't impact performance

let isMainThread = true;
let workerData: unknown = undefined;
let parentPort: unknown = undefined;
let workerThreadsAvailable = false;

// Use import.meta to check if we can import worker_threads
const loadWorkerThreads = async () => {
  try {
    const wt = await import('node:worker_threads');
    isMainThread = wt.isMainThread;
    workerData = wt.workerData;
    parentPort = wt.parentPort;
    workerThreadsAvailable = true;
  } catch {
    // Not available (Deno or other runtime) - use defaults
    workerThreadsAvailable = false;
  }
};

// Call it immediately
await loadWorkerThreads();

export { isMainThread, workerData, parentPort, workerThreadsAvailable };
