// Example: Basic usage with Node.js or Bun
import { heavyComputation } from './basic-example-worker.ts';

// Main code
async function main() {
  console.log('[Main] Starting computation...');

  const numbers = Array.from({ length: 1000000 }, (_, i) => i + 1);
  const result = await heavyComputation(numbers);

  console.log('[Main] Result:', result);
}

main().catch(console.error);
