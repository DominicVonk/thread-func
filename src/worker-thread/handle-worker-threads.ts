import { serializeError } from 'serialize-error';
import { parentPort, workerData } from 'worker_threads';
import { WithIdentifier } from '../types/with-identifier.js';

export function handleWorkerThreads<
  Method extends (...args: Parameters<Method>) => Promise<Result>,
  Result,
>(identifier: string, fn: Method) {
  if (workerData) {
    handleThread<typeof fn, Result>(identifier, fn);
  } else {
    handleThreadPool<typeof fn, Result>(identifier, fn);
  }
}

function handleThreadPool<
  Method extends (...args: Parameters<Method>) => Promise<Result>,
  Result,
>(identifier: string, fn: Method) {
  parentPort?.on(
    'message',
    async (message: WithIdentifier<Parameters<Method>>) => {
      try {
        if (message.identifier !== identifier) {
          return;
        }
        const output = await fn(...message.data);
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
    },
  );
}

function handleThread<
  Method extends (...args: Parameters<Method>) => Promise<Result>,
  Result,
>(identifier: string, fn: Method) {
  if (workerData && workerData.identifier === identifier) {
    (async () => {
      try {
        const output = await fn(...workerData.data);
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
