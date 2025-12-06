# Examples

This directory contains example files demonstrating how to use thread-func with different runtimes.

## Running the Examples

### Node.js
```bash
# First, build the project
npm run build

# Then run examples with Node.js
node --loader ts-node/esm examples/basic-example.ts
# or if you have tsx installed:
npx tsx examples/basic-example.ts
```

### Bun
```bash
bun run examples/basic-example.ts
```

### Deno
```bash
# For Deno, you would typically import from npm:
deno run --allow-all examples/basic-example.ts
```

## Available Examples

- **basic-example.ts** - Simple example of running a function in a separate thread
- **pool-example.ts** - Using a worker pool for parallel processing
- **child-process-example.ts** - Using child_process variant (Node.js/Bun only)
