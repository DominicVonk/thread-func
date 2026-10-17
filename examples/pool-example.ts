// Example: Worker pool for parallel processing
import { processItem } from './pool-example-worker.ts';

// Main code
async function main() {
  console.log('[Main] Processing multiple items in parallel...');

  const items = [
    'apple',
    'banana',
    'cherry',
    'date',
    'elderberry',
    'fig',
    'grape',
    'honeydew',
  ];

  const results = await Promise.all(items.map((item) => processItem(item)));

  console.log('[Main] Results:', results);
}

main().catch(console.error);
