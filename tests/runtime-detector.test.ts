import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectRuntime } from '../dist/runtime-detector.js';

afterEach(() => vi.unstubAllGlobals());

describe('runtime detection', () => {
  it('defaults to Node', () => {
    vi.stubGlobal('Deno', undefined);
    vi.stubGlobal('Bun', undefined);
    expect(detectRuntime()).toBe('node');
  });
  it('detects Bun', () => {
    vi.stubGlobal('Deno', undefined);
    vi.stubGlobal('Bun', {});
    expect(detectRuntime()).toBe('bun');
  });
  it('detects Deno ahead of compatibility globals', () => {
    vi.stubGlobal('Deno', {});
    vi.stubGlobal('Bun', {});
    expect(detectRuntime()).toBe('deno');
  });
});
