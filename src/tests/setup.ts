// Test Setup Configuration - Vitest
import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Suppress noisy React warnings in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && (args[0].includes('Warning:') || args[0].includes('React does not recognize'))) return;
    originalError.call(console, ...args);
  };
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('componentWillReceiveProps')) return;
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn(),
}));

// Mock localStorage / sessionStorage
const storageMock = () => {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((k: string) => store[k] ?? null),
    setItem: vi.fn((k: string, v: string) => { store[k] = v; }),
    removeItem: vi.fn((k: string) => { delete store[k]; }),
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
  };
};
Object.defineProperty(global, 'localStorage', { value: storageMock(), writable: true });
Object.defineProperty(global, 'sessionStorage', { value: storageMock(), writable: true });

// Mock fetch
global.fetch = vi.fn();

// Mock URL object methods
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

// Mock canvas
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(), clearRect: vi.fn(), getImageData: vi.fn(() => ({ data: new Array(4) })),
  putImageData: vi.fn(), createImageData: vi.fn(() => ({ data: new Array(4) })),
  setTransform: vi.fn(), drawImage: vi.fn(), save: vi.fn(), fillText: vi.fn(),
  restore: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
  closePath: vi.fn(), stroke: vi.fn(), translate: vi.fn(), scale: vi.fn(),
  rotate: vi.fn(), arc: vi.fn(), fill: vi.fn(), measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(), rect: vi.fn(), clip: vi.fn(),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;

HTMLElement.prototype.scrollIntoView = vi.fn();

beforeEach(() => { vi.clearAllMocks(); });
afterEach(() => { vi.useRealTimers(); });

export {};
