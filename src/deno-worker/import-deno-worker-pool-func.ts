function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function importDenoWorkerPoolFunc<
  Method extends (...arg: Parameters<Method>) => Promise<Result>,
  Result,
>(file: string, identifier: string, poolSize: number): Method {
  const workers: Worker[] = [];
  const workerBusy: boolean[] = [];
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
      workerIndex: number;
    }
  >();
  
  // Initialize worker pool
  for (let i = 0; i < poolSize; i++) {
    const worker = new Worker(file, {
      type: 'module',
      name: 'worker',
    });
    
    workerBusy[i] = false;
    
    worker.onmessage = (event: MessageEvent) => {
      const { data, error, callIdentifier } = event.data;
      const task = activeTasks.get(callIdentifier);
      
      if (task) {
        activeTasks.delete(callIdentifier);
        workerBusy[task.workerIndex] = false;
        
        if (data !== undefined) {
          task.resolve(data);
        } else if (error) {
          task.reject(new Error(error.message || 'Worker error'));
        }
        
        // Process next pending task if any
        const nextTask = pendingTasks.shift();
        if (nextTask) {
          workerBusy[task.workerIndex] = true;
          activeTasks.set(nextTask.callIdentifier, {
            resolve: nextTask.resolve,
            reject: nextTask.reject,
            workerIndex: task.workerIndex,
          });
          worker.postMessage({
            data: nextTask.args,
            identifier,
            callIdentifier: nextTask.callIdentifier,
          });
        }
      }
    };
    
    worker.onerror = (error) => {
      // Reject only tasks assigned to this worker
      for (const [callId, task] of activeTasks.entries()) {
        if (task.workerIndex === i) {
          task.reject(error);
          activeTasks.delete(callId);
          workerBusy[i] = false;
        }
      }
    };
    
    workers.push(worker);
  }
  
  return ((...args: Parameters<Method>): Promise<Result> => {
    return new Promise((resolve, reject) => {
      const callIdentifier = generateId();
      
      // Find an available worker
      const availableWorkerIndex = workerBusy.findIndex(busy => !busy);
      
      if (availableWorkerIndex !== -1) {
        workerBusy[availableWorkerIndex] = true;
        activeTasks.set(callIdentifier, { 
          resolve, 
          reject, 
          workerIndex: availableWorkerIndex 
        });
        workers[availableWorkerIndex]!.postMessage({
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
