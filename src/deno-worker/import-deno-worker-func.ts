export function importDenoWorkerFunc<
  Method extends (...arg: Parameters<Method>) => Promise<Result>,
  Result,
>(file: string, identifier: string): Method {
  return ((...args: Parameters<Method>): Promise<Result> => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(file, {
        type: 'module',
        name: 'worker',
      });
      
      // Send the task to the worker
      worker.postMessage({
        data: args,
        identifier,
        callIdentifier: undefined,
      });
      
      worker.onmessage = (event: MessageEvent) => {
        const { data, error } = event.data;
        if (data !== undefined) {
          resolve(data);
        } else if (error) {
          reject(new Error(error.message || 'Worker error'));
        }
        worker.terminate();
      };
      
      worker.onerror = (error) => {
        reject(error);
        worker.terminate();
      };
    });
  }) as Method;
}
