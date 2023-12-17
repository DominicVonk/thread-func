import { ChildProcess, fork } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { deserializeError } from 'serialize-error';

export function importChildProcessPoolFunc<
  Method extends (...args: Parameters<Method>) => Promise<Result>,
  Result,
>(file: string, identifier: string, maxWorkers = 2): Method {
  return ((...args: Parameters<Method>): Promise<Result> => {
    const childProcessPool: ChildProcess[] = [];
    const data = args;
    return new Promise((resolve, reject) => {
      let childProcess: ChildProcess;
      if (childProcessPool.length < maxWorkers) {
        childProcess = fork(file, {
          stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
          env: {
            ...process.env,
            IS_WORKER_THREAD: 'true',
          },
        });
        childProcess.setMaxListeners(0);
        childProcessPool.push(childProcess);
      } else {
        childProcess = childProcessPool.reduce((prev, curr) =>
          prev.listenerCount('message') < curr.listenerCount('message')
            ? prev
            : curr,
        );
      }

      const currentCallIdentifier = randomUUID();
      childProcess.send({
        data,
        identifier,
        callIdentifier: currentCallIdentifier,
      });
      childProcess.once('message', function event(message: string) {
        const { data, error, callIdentifier } = JSON.parse(message);
        if (callIdentifier === currentCallIdentifier) {
          if (data) {
            resolve(data);
          }
          if (error) {
            reject(deserializeError(error));
          }
          childProcess.kill();
        } else {
          childProcess.once('message', event);
        }
      });
      childProcess.once('error', reject);
    });
  }) as Method;
}
