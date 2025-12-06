function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function importDenoWorkerPoolFunc<
  Method extends (...arg: Parameters<Method>) => Promise<Result>,
  Result,
>(file: string, identifier: string, poolSize: number): Method {
  const workers: Worker[] = [];
  const pendingTasks: Array<{
    args: Parameters<Method>;
    resolve: (value: Result) => void;
    reject: (error: unknown) => void;
    callIdentifier: string;
  }> = [];
  const activeTasks = new Map<
    string,
    {
      resolve: (value: Result) => void;
      reject: (error: unknown) => void;
    }
  >();
  
  // Initialize worker pool
  for (let i = 0; i < poolSize; i++) {
    const worker = new Worker(file, {
      type: 'module',
      name: 'worker',
    });
    
    worker.onmessage = (event: MessageEvent) => {
      const { data, error, callIdentifier } = event.data;
      const task = activeTasks.get(callIdentifier);
      
      if (task) {
        activeTasks.delete(callIdentifier);
        if (data !== undefined) {
          task.resolve(data);
        } else if (error) {
          task.reject(new Error(error.message || 'Worker error'));
        }
      }
      
      // Process next pending task if any
      const nextTask = pendingTasks.shift();
      if (nextTask) {
        activeTasks.set(nextTask.callIdentifier, {
          resolve: nextTask.resolve,
          reject: nextTask.reject,
        });
        worker.postMessage({
          data: nextTask.args,
          identifier,
          callIdentifier: nextTask.callIdentifier,
        });
      }
    };
    
    worker.onerror = (error) => {
      // Reject all active tasks assigned to this worker
      for (const [callId, task] of activeTasks.entries()) {
        task.reject(error);
        activeTasks.delete(callId);
      }
    };
    
    workers.push(worker);
  }
  
  return ((...args: Parameters<Method>): Promise<Result> => {
    return new Promise((resolve, reject) => {
      const callIdentifier = generateId();
      
      // Find an available worker
      const availableWorker = workers.find(
        (w) => activeTasks.size < poolSize,
      );
      
      if (availableWorker && activeTasks.size < poolSize) {
        activeTasks.set(callIdentifier, { resolve, reject });
        availableWorker.postMessage({
          data: args,
          identifier,
          callIdentifier,
        });
      } else {
        // Queue the task
        pendingTasks.push({ args, resolve, reject, callIdentifier });
      }
    });
  }) as Method;
}
