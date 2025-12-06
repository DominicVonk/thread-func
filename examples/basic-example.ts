// Example: Basic usage with Node.js or Bun
import { threadFunc } from 'thread-func';

// Define a function that will run in a separate thread
export const heavyComputation = threadFunc(async (numbers: number[]) => {
    console.log('[Worker] Processing', numbers.length, 'numbers');
    
    // Simulate heavy computation
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const average = sum / numbers.length;
    
    return { sum, average, count: numbers.length };
});

// Main code
async function main() {
    console.log('[Main] Starting computation...');
    
    const numbers = Array.from({ length: 1000000 }, (_, i) => i + 1);
    const result = await heavyComputation(numbers);
    
    console.log('[Main] Result:', result);
}

main().catch(console.error);
