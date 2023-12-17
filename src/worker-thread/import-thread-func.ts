import { deserializeError } from 'serialize-error';
import { Worker } from 'worker_threads';

export function importThreadFunc<
  Method extends (...arg: Parameters<Method>) => Promise<Result>,
  Result,
>(file: string, identifier: string): Method {
  return ((...args: Parameters<Method>): Promise<Result> => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(file, {
        workerData: { data: args, identifier },
      });
      worker.once('message', (message: string) => {
        const { data, error } = JSON.parse(message);
        if (data) {
          resolve(data);
        }
        if (error) {
          reject(deserializeError(error));
        }
        worker.terminate();
      });
      worker.once('error', reject);
    });
  }) as Method;
}
