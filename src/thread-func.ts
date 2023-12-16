import { isMainThread } from 'node:worker_threads';
import { handleChildProcess } from './child-process/handle-child-process.js';
import { importChildProcessFunc } from './child-process/import-child-process-func.js';
import { importChildProcessPoolFunc } from './child-process/import-child-process-pool-func.js';
import { handleWorkerThreads } from './worker-thread/handle-worker-threads.js';
import { importThreadFunc } from './worker-thread/import-thread-func.js';
import { importThreadPoolFunc } from './worker-thread/import-thread-pool-func.js';

export function threadFunc<
  Method extends (arg: Arg) => Promise<Result>,
  Arg = Parameters<Method>[0],
  Result = Awaited<ReturnType<Method>>,
>(
  fn: Method,
  options: {
    poolSize?: number;
    variant?: 'worker_threads' | 'child_process';
  } = {},
): Method {
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

  if (isMainThread && !process.env.IS_WORKER_THREAD) {
    // determine file where this function is called

    const stackLineArr = stackLine.split(' ');
    if (!stackLineArr[stackLineArr.length - 1]) {
      throw new Error('Could not determine file');
    }
    const fileComplete = stackLineArr[stackLineArr.length - 1]!;
    const fileURL = fileComplete.substring(0, fileComplete.indexOf(':', 6));
    const file = new URL(import.meta.resolve(new URL(fileURL).pathname))
      .pathname;

    if (options?.variant === 'child_process') {
      if (options?.poolSize) {
        const output = importChildProcessPoolFunc<Arg, Result, typeof fn>(
          file,
          stackLine,
          options?.poolSize,
        );
        return output;
      } else {
        const output = importChildProcessFunc<Arg, Result, typeof fn>(
          file,
          stackLine,
        );
        return output;
      }
    }

    if (options?.poolSize) {
      const output = importThreadPoolFunc<Arg, Result, typeof fn>(
        file,
        stackLine,
        options?.poolSize,
      );
      return output;
    } else {
      const output = importThreadFunc<Arg, Result, typeof fn>(file, stackLine);
      return output;
    }
  }

  if (options?.variant === 'child_process') {
    handleChildProcess<Arg, Result, typeof fn>(stackLine, fn);
    return undefined as unknown as Method; // only used for type checking
  } else {
    handleWorkerThreads<Arg, Result, typeof fn>(stackLine, fn);
    return undefined as unknown as Method; // only used for type checking
  }
}
