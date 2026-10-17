// Example: Using child_process variant (Node.js/Bun only)
import { isolatedTask } from './child-process-example-worker.ts';

// Main code
async function main() {
  console.log('[Main] Running isolated task in child process...');

  const result = await isolatedTask({ value: 42 });

  console.log('[Main] Result:', result); // 84
}

main().catch(console.error);
