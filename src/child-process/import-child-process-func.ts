import { fork } from 'node:child_process';
import { deserializeError } from 'serialize-error';

export function importChildProcessFunc<
  Arg,
  Result,
  Method extends (arg: Arg) => Promise<Result>,
>(file: string, identifier: string): Method {
  return ((data: Arg): Promise<Result> => {
    return new Promise((resolve, reject) => {
      const worker = fork(file, {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        env: {
          ...process.env,
          IS_WORKER_THREAD: 'true',
        },
      });
      worker.send({ data, identifier });
      worker.once('message', (message: string) => {
        const { data, error } = JSON.parse(message);
        if (data) {
          resolve(data);
        }
        if (error) {
          reject(deserializeError(error));
        }
        worker.kill();
      });
      worker.once('error', reject);
    });
  }) as Method;
}
