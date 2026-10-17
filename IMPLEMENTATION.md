# Multi-Runtime Support Implementation

This document explains the changes made to support Deno and Bun in addition to Node.js.

## Architecture Changes

### 1. Runtime Detection (`src/runtime-detector.ts`)
- Detects the current JavaScript runtime (Node.js, Deno, or Bun)
- Checks for runtime-specific global objects (`Deno`, `Bun`, or defaults to Node.js)

### 2. Safe Worker Threads Import (`src/safe-worker-threads.ts`)
- Dynamically imports `worker_threads` module with top-level await
- Gracefully handles cases where `worker_threads` is not available (Deno)
- Exports `isMainThread`, `workerData`, and `parentPort` with safe defaults

### 3. Deno Worker Implementation (`src/deno-worker/`)
Three new files implement Deno-specific worker functionality:
- `handle-deno-worker.ts` - Handles incoming messages in Deno workers
- `import-deno-worker-func.ts` - Creates single Deno worker instances
- `import-deno-worker-pool-func.ts` - Manages a pool of Deno workers

### 4. Updated Main Entry Point (`src/thread-func.ts`)
- Imports from `safe-worker-threads.ts` instead of directly from `node:worker_threads`
- Adds runtime detection to choose appropriate worker implementation
- Handles file path resolution differently for each runtime
- Routes to Deno workers when `runtime === 'deno'`

## Key Technical Decisions

### Why Top-Level Await in safe-worker-threads.ts?
- Allows dynamic import of `worker_threads` without breaking in Deno
- TypeScript/Node.js ESM supports top-level await when `type: "module"` is set
- The module is only imported once per process, so the async nature doesn't impact performance

### Why Separate Deno Worker Files?
- Deno uses Web Workers API (similar to browsers) instead of Node.js `worker_threads`
- Message passing works differently (uses `MessageEvent` and `postMessage` directly)
- Keeps the code modular and maintainable

### File Path Handling
- **Node.js/Bun**: Uses `import.meta.resolve()` to get absolute paths
- **Deno**: Uses file URLs directly from the stack trace

## Runtime-Specific Behavior

### Node.js
- Uses `worker_threads` module (default)
- Supports both `worker_threads` and `child_process` variants
- Full backward compatibility maintained

### Bun
- Uses Node.js-compatible APIs (`worker_threads` and `child_process`)
- Works identically to Node.js
- No special handling required beyond runtime detection

### Deno
- Uses Web Workers API
- Does not support `child_process` variant
- Requires `npm:` prefix when importing published package

## Testing

Manual testing confirmed:
- ✅ Node.js: Both single workers and worker pools function correctly
- ✅ Bun: Full compatibility with Node.js features
- ⚠️  Deno: Implementation complete but requires package publication for full testing

## Future Improvements

1. Add automated tests for all three runtimes
2. Consider JSR (Deno's package registry) publication
3. Add performance benchmarks comparing runtimes
4. Document any runtime-specific limitations
