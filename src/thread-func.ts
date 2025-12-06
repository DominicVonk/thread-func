import { detectRuntime } from './runtime-detector.js';
import { isMainThread } from './safe-worker-threads.js';
import { handleChildProcess } from './child-process/handle-child-process.js';
import { importChildProcessFunc } from './child-process/import-child-process-func.js';
import { importChildProcessPoolFunc } from './child-process/import-child-process-pool-func.js';
import { handleWorkerThreads } from './worker-thread/handle-worker-threads.js';
import { importThreadFunc } from './worker-thread/import-thread-func.js';
import { importThreadPoolFunc } from './worker-thread/import-thread-pool-func.js';
import { handleDenoWorker } from './deno-worker/handle-deno-worker.js';
import { importDenoWorkerFunc } from './deno-worker/import-deno-worker-func.js';
import { importDenoWorkerPoolFunc } from './deno-worker/import-deno-worker-pool-func.js';

function isDenoWorkerContext(): boolean {
  return (
    typeof self !== 'undefined' &&
    'name' in self &&
    (self as { name?: string }).name === 'worker'
  );
}

export function threadFunc<
  Method extends (...arg: Parameters<Method>) => Promise<Result>,
  Result = Awaited<ReturnType<Method>>,
>(
  fn: Method,
  options: {
    poolSize?: number;
    variant?: 'worker_threads' | 'child_process';
  } = {},
): Method {
  const runtime = detectRuntime();
  const defaultOptions: typeof options = {
    variant: 'worker_threads',
  };
  options = { ...defaultOptions, ...options };

  const stack = new Error().stack;
  if (!stack) {
    throw new Error('Could not determine file');
  }
  const stackArr = stack.split('\n');
  const stackLine = stackArr[2]!.trim();

  if (!stackLine) {
    throw new Error('Could not determine file');
  }

  // Check if we're in main thread/process
  let isInMainContext = false;
  if (runtime === 'deno') {
    // In Deno, check if we're NOT in a worker
    isInMainContext = !isDenoWorkerContext();
  } else {
    // For Node.js/Bun
    const envVar = typeof process !== 'undefined' ? process.env.IS_WORKER_THREAD : undefined;
    isInMainContext = isMainThread && envVar !== 'true';
  }

  if (isInMainContext) {
    // Main thread/process - determine file where this function is called
    const stackLineArr = stackLine.split(' ');
    if (!stackLineArr[stackLineArr.length - 1]) {
      throw new Error('Could not determine file');
    }
    const fileComplete = stackLineArr[stackLineArr.length - 1]!;
    const fileURL = fileComplete.substring(0, fileComplete.indexOf(':', 6));
    
    let file: string;
    if (runtime === 'deno') {
      // For Deno, use the file URL directly
      file = fileURL;
    } else {
      // For Node.js and Bun
      // Handle both file:// URLs and absolute paths
      if (fileURL.startsWith('file://')) {
        // Convert file:// URL to path, handling Windows paths correctly
        const url = new URL(fileURL);
        file = url.pathname;
        // On Windows, pathname starts with / (e.g., /C:/path), remove leading slash
        if (process.platform === 'win32' && /^\/[a-zA-Z]:/.test(file)) {
          file = file.substring(1);
        }
      } else {
        // If it's already a path, use it directly
        file = fileURL;
      }
    }

    // Handle Deno
    if (runtime === 'deno') {
      if (options?.poolSize) {
        return importDenoWorkerPoolFunc<typeof fn, Result>(
          file,
          stackLine,
          options?.poolSize,
        );
      } else {
        return importDenoWorkerFunc<typeof fn, Result>(file, stackLine);
      }
    }

    // Handle Node.js/Bun
    if (options?.variant === 'child_process') {
      if (options?.poolSize) {
        return importChildProcessPoolFunc<typeof fn, Result>(
          file,
          stackLine,
          options?.poolSize,
        );
      } else {
        return importChildProcessFunc<typeof fn, Result>(file, stackLine);
      }
    }

    if (options?.poolSize) {
      return importThreadPoolFunc<typeof fn, Result>(
        file,
        stackLine,
        options?.poolSize,
      );
    } else {
      return importThreadFunc<typeof fn, Result>(file, stackLine);
    }
  }

  // Worker/child process context - setup message handlers
  if (runtime === 'deno') {
    handleDenoWorker<typeof fn, Result>(stackLine, fn);
    return undefined as unknown as Method;
  }

  if (options?.variant === 'child_process') {
    handleChildProcess<typeof fn, Result>(stackLine, fn);
    return undefined as unknown as Method;
  } else {
    handleWorkerThreads<typeof fn, Result>(stackLine, fn);
    return undefined as unknown as Method;
  }
}
