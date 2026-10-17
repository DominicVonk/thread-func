import { threadFunc } from 'thread-func';

// Define a function that will run in a separate thread
export const heavyComputation = threadFunc(async (numbers: number[]) => {
  console.log('[Worker] Processing', numbers.length, 'numbers');

  // Simulate heavy computation
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const average = sum / numbers.length;

  return { sum, average, count: numbers.length };
});
