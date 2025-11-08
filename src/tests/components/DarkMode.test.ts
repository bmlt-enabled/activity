import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import DarkMode from '../../components/DarkMode.svelte';

describe('DarkMode component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Remove dark class from document
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  test('renders toggle button', () => {
    render(DarkMode, { props: { class: '' } });
    const button = screen.getByRole('button', { name: /dark mode/i });
    expect(button).toBeInTheDocument();
  });

  test('displays dark mode icon initially (light mode active)', () => {
    render(DarkMode, { props: { class: '' } });
    const darkIcon = screen.getByRole('img', { name: 'Dark mode' });
    expect(darkIcon).toBeInTheDocument();
  });

  test('toggles dark class on document when clicked', async () => {
    const user = userEvent.setup();
    render(DarkMode, { props: { class: '' } });

    const button = screen.getByRole('button', { name: /dark mode/i });

    // Initially no dark class
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Click to enable dark mode
    await user.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Click again to disable dark mode
    await user.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  test('saves dark mode preference to localStorage', async () => {
    const user = userEvent.setup();
    render(DarkMode, { props: { class: '' } });

    const button = screen.getByRole('button', { name: /dark mode/i });

    // Click to enable dark mode
    await user.click(button);
    expect(localStorage.getItem('color-theme')).toBe('dark');

    // Click to disable dark mode
    await user.click(button);
    expect(localStorage.getItem('color-theme')).toBe('light');
  });

  test('accepts custom size prop', () => {
    render(DarkMode, { props: { class: '', size: 'lg' } });
    const button = screen.getByRole('button', { name: /dark mode/i });
    expect(button).toBeInTheDocument();
  });

  test('accepts custom class prop', () => {
    render(DarkMode, { props: { class: 'custom-class' } });
    const button = screen.getByRole('button', { name: /dark mode/i });
    expect(button.classList.contains('custom-class')).toBe(true);
  });

  test('accepts custom aria label', () => {
    render(DarkMode, { props: { class: '', ariaLabel: 'Toggle theme' } });
    const button = screen.getByRole('button', { name: 'Toggle theme' });
    expect(button).toBeInTheDocument();
  });

  test('displays light mode icon when dark mode is active', async () => {
    const user = userEvent.setup();
    render(DarkMode, { props: { class: '' } });

    const button = screen.getByRole('button', { name: /dark mode/i });

    // Click to enable dark mode
    await user.click(button);

    // Should now show light mode icon
    const lightIcon = screen.getByRole('img', { name: 'Light mode' });
    expect(lightIcon).toBeInTheDocument();
  });
});
