# Thread Func

## Description
This is a TypeScript library that provides a simple way to run functions in separate threads. It supports **Node.js**, **Deno**, and **Bun** runtimes.

## Installation

### Node.js
You can install this library using npm:
```bash
npm install thread-func
```

### Deno
Import directly from npm:
```typescript
import { threadFunc } from 'npm:thread-func';
```

Or add to your `deno.json`:
```json
{
  "imports": {
    "thread-func": "npm:thread-func"
  }
}
```

### Bun
```bash
bun add thread-func
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
    poolSize?: number; // Optional: Create a worker pool with specified size
    variant?: 'child_process' | 'worker_threads'; // The type of thread to use (Node.js/Bun only)
}
```

### Examples

#### Basic Usage (All Runtimes)
```typescript
import { threadFunc } from 'thread-func';

export const heavyComputation = threadFunc(async (data: number[]) => {
    // This runs in a separate thread
    return data.reduce((sum, val) => sum + val, 0);
});

// Use it like a normal function
const result = await heavyComputation([1, 2, 3, 4, 5]);
console.log(result); // 15
```

#### With Worker Pool
```typescript
import { threadFunc } from 'thread-func';

export const processItem = threadFunc(
    async (item: string) => {
        // Process item in worker thread
        return item.toUpperCase();
    },
    { poolSize: 4 } // Use a pool of 4 workers
);

const items = ['a', 'b', 'c', 'd', 'e'];
const results = await Promise.all(items.map(processItem));
console.log(results); // ['A', 'B', 'C', 'D', 'E']
```

#### Node.js/Bun with Child Process (Alternative)
```typescript
import { threadFunc } from 'thread-func';

export const isolatedTask = threadFunc(
    async (input: number) => {
        return input * 2;
    },
    { variant: 'child_process' }
);
```

## Runtime Support

- **Node.js**: Full support with `worker_threads` and `child_process`
- **Deno**: Uses Web Workers API
- **Bun**: Uses Node.js compatible `worker_threads` and `child_process` APIs

The library automatically detects the runtime and uses the appropriate threading mechanism.

## License
This library is licensed under the MIT license.
