export type Runtime = 'node' | 'deno' | 'bun';

declare global {
  // Deno global
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  } | undefined;
  
  // Bun global  
  const Bun: unknown | undefined;
}

export function detectRuntime(): Runtime {
  // Check for Deno
  if (typeof Deno !== 'undefined') {
    return 'deno';
  }
  
  // Check for Bun
  if (typeof Bun !== 'undefined') {
    return 'bun';
  }
  
  // Default to Node.js
  return 'node';
}
