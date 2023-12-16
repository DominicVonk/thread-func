import { deserializeError } from 'serialize-error';
import { Worker } from 'worker_threads';

export function importThreadFunc<
  Arg,
  Result,
  Method extends (arg: Arg) => Promise<Result>,
>(file: string, identifier: string): Method {
  return ((data: Arg): Promise<Result> | Result => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(file, {
        workerData: { data, identifier },
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
