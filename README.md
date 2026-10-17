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

Define wrapped functions in a separate module from the code that calls them.
Workers reload the defining module, so top-level application code there also runs
in each worker. See `examples/` for the entry point and worker module pattern.

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

`worker.ts`:

```typescript
import { threadFunc } from 'thread-func';

export const heavyComputation = threadFunc(async (data: number[]) => {
  // This runs in a separate thread
  return data.reduce((sum, val) => sum + val, 0);
});
```

`main.ts`:

```typescript
import { heavyComputation } from './worker.ts';

const result = await heavyComputation([1, 2, 3, 4, 5]);
console.log(result); // 15
```

#### With Worker Pool

`pool-worker.ts`:

```typescript
import { threadFunc } from 'thread-func';

export const processItem = threadFunc(
  async (item: string) => {
    // Process item in worker thread
    return item.toUpperCase();
  },
  { poolSize: 4 }, // Use a pool of 4 workers
);
```

`main.ts`:

```typescript
import { processItem } from './pool-worker.ts';

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
  { variant: 'child_process' },
);
```

## Runtime Support

- **Node.js**: Full support with `worker_threads` and `child_process`
- **Deno**: Uses Web Workers API
- **Bun**: Uses Node.js compatible `worker_threads` and `child_process` APIs

The library automatically detects the runtime and uses the appropriate threading mechanism.

Without `poolSize`, each call creates a new worker (or child process). Node.js and
Bun pools reuse up to `poolSize` workers across overlapping calls, then terminate
them when their pending calls finish. Deno pools stay alive for reuse.

## Verification

Build first with `npm run build`, then run the regression suite with the runtime
you want to check:

```bash
npm test
bun tests/test.mjs
deno task test
```

`npm test` builds the library, type-checks the tests, runs Vitest with both its
thread and process pools, and runs the standalone Node runtime checks. CI runs
this on Node 22 and 24. The Vitest development tooling requires Node 22.12+ or
24; this does not change the library's runtime dependencies.

The suites check single workers, pool reuse and size, multiple functions in one
module, falsy and undefined results, concurrent calls, error rejection and actual
worker identity. Node.js and Bun also check both child-process variants.

### Using with Vitest

Keep worker definitions in a separate module and import them into your tests.
Workers use the runtime's native module loader, so compile TypeScript worker
modules first and keep them out of Vite's transformations:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    server: { deps: { external: [/worker-dist\//] } },
  },
});
```

See `tests/fixtures/workers.ts`, `tsconfig.fixtures.json` and `vitest.config.ts`
for a working setup. Both Vitest `threads` and `forks` pools are supported.
Mocks, aliases and transforms from Vitest do not propagate to native workers;
worker modules must be loadable by Node independently.

## License

This library is licensed under the MIT license.
