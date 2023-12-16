import { serializeError } from 'serialize-error';
import { parentPort, workerData } from 'worker_threads';
import { WithIdentifier } from '../types/with-identifier.js';

export function handleWorkerThreads<
  Arg,
  Result,
  Method extends (arg: Arg) => Promise<Result>,
>(identifier: string, fn: Method) {
  if (workerData) {
    handleThread<Arg, Result, typeof fn>(identifier, fn);
  } else {
    handleThreadPool<Arg, Result, typeof fn>(identifier, fn);
  }
}

function handleThreadPool<
  Arg,
  Result,
  Method extends (arg: Arg) => Promise<Result>,
>(identifier: string, fn: Method) {
  parentPort?.on('message', async (message: WithIdentifier<Arg>) => {
    try {
      if (message.identifier !== identifier) {
        return;
      }
      const output = await fn(message.data);
      parentPort?.postMessage(
        JSON.stringify({
          identifier: message.identifier,
          callIdentifier: message.callIdentifier,
          data: output,
        }),
      );
    } catch (e: unknown) {
      parentPort?.postMessage(
        JSON.stringify({
          identifier: message.identifier,
          callIdentifier: message.callIdentifier,
          error: serializeError(e),
        }),
      );
    }
  });
}

function handleThread<
  Arg,
  Result,
  Method extends (arg: Arg) => Promise<Result>,
>(identifier: string, fn: Method) {
  if (workerData && workerData.identifier === identifier) {
    (async () => {
      try {
        const output = await fn(workerData.data);
        parentPort?.postMessage(
          JSON.stringify({
            identifier,
            callIdentifier: undefined,
            data: output,
          }),
        );
        return;
      } catch (e: unknown) {
        parentPort?.postMessage(
          JSON.stringify({
            identifier,
            callIdentifier: undefined,
            error: serializeError(e),
          }),
        );
        return;
      }
    })();
  }
}
