import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

globalThis.window.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
}));

// Mock HTMLDialogElement methods for flowbite-svelte Modal component
HTMLDialogElement.prototype.showModal = vi.fn(function mock(this: HTMLDialogElement) {
  this.open = true;
});

HTMLDialogElement.prototype.show = vi.fn(function mock(this: HTMLDialogElement) {
  this.open = true;
  this.dispatchEvent(new Event('toggle', { bubbles: true }));
});

HTMLDialogElement.prototype.close = vi.fn(function mock(this: HTMLDialogElement) {
  this.open = false;
  this.dispatchEvent(new Event('toggle', { bubbles: true }));
});

// Mock Element.animate for Svelte transitions
Element.prototype.animate = vi.fn(() => ({
  cancel: vi.fn(),
  finish: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  reverse: vi.fn(),
  onfinish: null,
  oncancel: null
})) as any;
