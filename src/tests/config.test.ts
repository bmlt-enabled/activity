import { describe, test, expect, beforeEach, vi } from 'vitest';

describe('config store', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('initializes with default values', async () => {
    const { config } = await import('../lib/stores/config.svelte');

    expect(config.bmltServer).toBe('');
    expect(config.serviceBodyIds).toEqual([]);
    expect(config.daysPassed).toBe(30);
    expect(config.timezone).toBe('America/New_York');
  });

  test('saves to localStorage when bmltServer is set', async () => {
    const { config } = await import('../lib/stores/config.svelte');

    config.bmltServer = 'https://example.com';

    const stored = localStorage.getItem('bmlt-activity-report-config');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored!);
    expect(parsed.bmltServer).toBe('https://example.com');
  });

  test('saves to localStorage when serviceBodyIds are set', async () => {
    const { config } = await import('../lib/stores/config.svelte');

    config.serviceBodyIds = ['1', '2', '3'];

    const stored = localStorage.getItem('bmlt-activity-report-config');
    const parsed = JSON.parse(stored!);
    expect(parsed.serviceBodyIds).toEqual(['1', '2', '3']);
  });

  test('saves to localStorage when daysPassed is set', async () => {
    const { config } = await import('../lib/stores/config.svelte');

    config.daysPassed = 90;

    const stored = localStorage.getItem('bmlt-activity-report-config');
    const parsed = JSON.parse(stored!);
    expect(parsed.daysPassed).toBe(90);
  });

  test('saves to localStorage when timezone is set', async () => {
    const { config } = await import('../lib/stores/config.svelte');

    config.timezone = 'America/Los_Angeles';

    const stored = localStorage.getItem('bmlt-activity-report-config');
    const parsed = JSON.parse(stored!);
    expect(parsed.timezone).toBe('America/Los_Angeles');
  });

  test('loads from localStorage on initialization', async () => {
    // Set up localStorage before importing
    localStorage.setItem(
      'bmlt-activity-report-config',
      JSON.stringify({
        bmltServer: 'https://loaded.com',
        serviceBodyIds: ['10', '20'],
        daysPassed: 30,
        timezone: 'Europe/London'
      })
    );

    // Clear module cache and reimport to trigger constructor
    vi.resetModules();
    const { config } = await import('../lib/stores/config.svelte');

    expect(config.bmltServer).toBe('https://loaded.com');
    expect(config.serviceBodyIds).toEqual(['10', '20']);
    expect(config.daysPassed).toBe(30);
    expect(config.timezone).toBe('Europe/London');
  });

  test('handles corrupt localStorage data gracefully', async () => {
    // Set corrupt data
    localStorage.setItem('bmlt-activity-report-config', 'invalid json{');

    // Mock console.error to suppress expected error output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Should not throw, should use defaults
    vi.resetModules();
    const { config } = await import('../lib/stores/config.svelte');

    expect(config.bmltServer).toBe('');
    expect(config.daysPassed).toBe(30);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load config from localStorage:', expect.any(SyntaxError));

    consoleErrorSpy.mockRestore();
  });

  test('updates all fields and saves atomically', async () => {
    const { config } = await import('../lib/stores/config.svelte');

    config.bmltServer = 'https://server.com';
    config.serviceBodyIds = ['5'];
    config.daysPassed = 60;
    config.timezone = 'Asia/Tokyo';

    const stored = localStorage.getItem('bmlt-activity-report-config');
    const parsed = JSON.parse(stored!);

    expect(parsed).toEqual({
      bmltServer: 'https://server.com',
      serviceBodyIds: ['5'],
      daysPassed: 60,
      timezone: 'Asia/Tokyo'
    });
  });
});
