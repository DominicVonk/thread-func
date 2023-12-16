# Thread Func

## Description
This is a TypeScript library that provides a simple way to run functions in separate threads.

## Installation
You can install this library using npm:
```bash
npm install thread-func
```

## Usage
```typescript
import { threadFunc } from 'thread-func';

export const method = threadFunc(async (input: number) => {
    // Some code
    return input * 42;
});
```


### Signature
```typescript
threadFunc<T, R>(func: (input: T) => Promise<R>, options): (input: T) => Promise<R>;
```

### Options
```typescript
{
    maxThreads: number = Infinity; // Maximum number of threads to run in parallel.
    variant: 'child_process' | 'worker_threads' = 'worker_threads'; // The type of thread to use.
}
```

## License
This library is licensed under the MIT license.
