// Example: Worker pool for parallel processing
import { threadFunc } from 'thread-func';

// Create a worker pool with 4 workers
export const processItem = threadFunc(
    async (item: string) => {
        console.log('[Worker] Processing:', item);
        
        // Simulate some work
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return item.toUpperCase();
    },
    { poolSize: 4 }
);

// Main code
async function main() {
    console.log('[Main] Processing multiple items in parallel...');
    
    const items = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew'];
    
    const results = await Promise.all(items.map(item => processItem(item)));
    
    console.log('[Main] Results:', results);
}

main().catch(console.error);
