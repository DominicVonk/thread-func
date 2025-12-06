// Safe wrapper for worker_threads that works in all runtimes
// This module uses dynamic import to avoid errors when worker_threads is not available

let isMainThread = true;
let workerData: any = undefined;
let parentPort: any = undefined;
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
