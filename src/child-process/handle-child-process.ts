import { serializeError } from 'serialize-error';
import { WithIdentifier } from '../types/with-identifier.js';

export function handleChildProcess<
  Method extends (...arg: Parameters<Method>) => Promise<Result>,
  Result,
>(identifier: string, fn: Method) {
  process?.on(
    'message',
    async (message: WithIdentifier<Parameters<Method>>) => {
      try {
        if (message.identifier !== identifier) {
          return;
        }
        const output = await fn(...message.data);
        process?.send?.(
          JSON.stringify({
            identifier: message.identifier,
            callIdentifier: message.callIdentifier,
            data: output,
          }),
        );
      } catch (e: unknown) {
        process?.send?.(
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
