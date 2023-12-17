import { randomUUID } from 'crypto';
import { deserializeError } from 'serialize-error';
import { Worker } from 'worker_threads';

export function importThreadPoolFunc<
  Method extends (...args: Parameters<Method>) => Promise<Result>,
  Result,
>(file: string, identifier: string, maxWorkers = 2): Method {
  const workerPool: Worker[] = [];
  return ((...args: Parameters<Method>): Promise<Result> => {
    const data = args;
    let worker: Worker;
    if (workerPool.length < maxWorkers) {
      worker = new Worker(file);
      worker.setMaxListeners(0);
      workerPool.push(worker);
    } else {
      worker = workerPool.reduce((prev, curr) =>
        prev.listenerCount('message') < curr.listenerCount('message')
          ? prev
          : curr,
      );
    }

    const currentCallIdentifier = randomUUID();
    worker.postMessage({
      data,
      identifier,
      callIdentifier: currentCallIdentifier,
    });
    return new Promise((resolve, reject) => {
      worker.once('message', function event(message: string) {
        const { callIdentifier, data, error } = JSON.parse(message);
        if (callIdentifier === currentCallIdentifier) {
          if (data) {
            resolve(data);
          }
          if (error) {
            reject(deserializeError(error));
          }
          if (worker.listenerCount('message') === 0) {
            workerPool.splice(workerPool.indexOf(worker), 1);
            worker.terminate();
          }
        } else {
          worker.once('message', event);
        }
      });
    });
  }) as Method;
}
