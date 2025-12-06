import { serializeError } from 'serialize-error';
import { WithIdentifier } from '../types/with-identifier.js';

export function handleDenoWorker<
  Method extends (...args: Parameters<Method>) => Promise<Result>,
  Result,
>(identifier: string, fn: Method) {
  // Check if we're in a Deno worker context
  if (typeof self !== 'undefined' && self.name === 'worker') {
    self.onmessage = async (event: MessageEvent) => {
      const message = event.data as WithIdentifier<Parameters<Method>>;
      
      if (message.identifier !== identifier) {
        return;
      }
      
      try {
        const output = await fn(...message.data);
        self.postMessage({
          identifier: message.identifier,
          callIdentifier: message.callIdentifier,
          data: output,
        });
      } catch (e: unknown) {
        self.postMessage({
          identifier: message.identifier,
          callIdentifier: message.callIdentifier,
          error: serializeError(e),
        });
      }
    };
  }
}
