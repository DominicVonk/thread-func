//  Example: Using child_process variant (Node.js/Bun only)
import { threadFunc } from 'thread-func';

// Use child_process instead of worker_threads
export const isolatedTask = threadFunc(
    async (data: { value: number }) => {
        console.log('[Child Process] Processing:', data.value);
        return data.value * 2;
    },
    { variant: 'child_process' }
);

// Main code
async function main() {
    console.log('[Main] Running isolated task in child process...');
    
    const result = await isolatedTask({ value: 42 });
    
    console.log('[Main] Result:', result); // 84
}

main().catch(console.error);
