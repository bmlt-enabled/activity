import { describe, test, expect, vi, beforeEach } from 'vitest';
import { fetchBmltChanges } from '../lib/services/bmltApi';
import { fetchServerList, fetchServiceBodies } from '../lib/services/serverList';

// Mock bmlt-query-client
vi.mock('bmlt-query-client', () => ({
  BmltClient: vi.fn(function (this: any) {
    this.getChanges = vi.fn();
    this.getServiceBodies = vi.fn();
  })
}));

describe('bmltApi service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchBmltChanges', () => {
    test('fetches changes for single service body', async () => {
      const { BmltClient } = await import('bmlt-query-client');
      const mockGetChanges = vi.fn().mockResolvedValue([
        {
          change_id: '1',
          user_name: 'Test User',
          date_string: '2024-01-01',
          date_int: 20240101,
          change_type: 'comdef_change_type_new'
        }
      ]);

      (BmltClient as any).mockImplementation(function (this: any) {
        this.getChanges = mockGetChanges;
      });

      const changes = await fetchBmltChanges('https://test.com', ['123'], 7);

      expect(changes).toHaveLength(1);
      expect(changes[0].change_id).toBe('1');
      expect(mockGetChanges).toHaveBeenCalledTimes(1);
      expect(mockGetChanges).toHaveBeenCalledWith(
        expect.objectContaining({
          service_body_id: 123
        })
      );
    });

    test('fetches changes for multiple service bodies', async () => {
      const { BmltClient } = await import('bmlt-query-client');
      const mockGetChanges = vi
        .fn()
        .mockResolvedValueOnce([{ change_id: '1' }])
        .mockResolvedValueOnce([{ change_id: '2' }]);

      (BmltClient as any).mockImplementation(function (this: any) {
        this.getChanges = mockGetChanges;
      });

      const changes = await fetchBmltChanges('https://test.com', ['123', '456'], 7);

      expect(changes).toHaveLength(2);
      expect(mockGetChanges).toHaveBeenCalledTimes(2);
    });

    test('uses correct date range based on daysPassed', async () => {
      const { BmltClient } = await import('bmlt-query-client');
      const mockGetChanges = vi.fn().mockResolvedValue([]);

      (BmltClient as any).mockImplementation(function (this: any) {
        this.getChanges = mockGetChanges;
      });

      await fetchBmltChanges('https://test.com', ['123'], 30);

      const call = mockGetChanges.mock.calls[0][0];
      expect(call).toHaveProperty('start_date');
      expect(call).toHaveProperty('end_date');

      // Verify date format is YYYY-MM-DD
      expect(call.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(call.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('throws error on API failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { BmltClient } = await import('bmlt-query-client');
      const mockGetChanges = vi.fn().mockRejectedValue(new Error('API Error'));

      (BmltClient as any).mockImplementation(function (this: any) {
        this.getChanges = mockGetChanges;
      });

      await expect(fetchBmltChanges('https://test.com', ['123'], 7)).rejects.toThrow('API Error');
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    test('parses service body IDs as integers', async () => {
      const { BmltClient } = await import('bmlt-query-client');
      const mockGetChanges = vi.fn().mockResolvedValue([]);

      (BmltClient as any).mockImplementation(function (this: any) {
        this.getChanges = mockGetChanges;
      });

      await fetchBmltChanges('https://test.com', ['123'], 7);

      expect(mockGetChanges).toHaveBeenCalledWith(
        expect.objectContaining({
          service_body_id: 123
        })
      );
    });
  });
});

describe('serverList service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  describe('fetchServerList', () => {
    test('fetches and returns server list', async () => {
      const mockServers = [
        { id: '1', name: 'Server 1', url: 'https://server1.com' },
        { id: '2', name: 'Server 2', url: 'https://server2.com' }
      ];

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockServers
      } as Response);

      const servers = await fetchServerList();

      expect(servers).toEqual(mockServers);
      expect(fetch).toHaveBeenCalledWith('https://raw.githubusercontent.com/bmlt-enabled/aggregator/refs/heads/main/serverList.json');
    });

    test('throws error on HTTP failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404
      } as Response);

      await expect(fetchServerList()).rejects.toThrow('HTTP error! status: 404');
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    test('throws error on network failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      await expect(fetchServerList()).rejects.toThrow('Network error');
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('fetchServiceBodies', () => {
    test('fetches service bodies for a server', async () => {
      const { BmltClient } = await import('bmlt-query-client');
      const mockServiceBodies = [
        { id: '1', name: 'Area 1', type: 'AS' },
        { id: '2', name: 'Region 1', type: 'RS' }
      ];

      const mockGetServiceBodies = vi.fn().mockResolvedValue(mockServiceBodies);

      (BmltClient as any).mockImplementation(function (this: any) {
        this.getServiceBodies = mockGetServiceBodies;
      });

      const bodies = await fetchServiceBodies('https://test.com');

      expect(bodies).toEqual(mockServiceBodies);
      expect(mockGetServiceBodies).toHaveBeenCalledTimes(1);
    });

    test('throws error on API failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { BmltClient } = await import('bmlt-query-client');
      const mockGetServiceBodies = vi.fn().mockRejectedValue(new Error('Service body fetch failed'));

      (BmltClient as any).mockImplementation(function (this: any) {
        this.getServiceBodies = mockGetServiceBodies;
      });

      await expect(fetchServiceBodies('https://test.com')).rejects.toThrow('Service body fetch failed');
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    test('initializes BmltClient with correct URL', async () => {
      const { BmltClient } = await import('bmlt-query-client');
      const mockGetServiceBodies = vi.fn().mockResolvedValue([]);

      (BmltClient as any).mockImplementation(function (this: any) {
        this.getServiceBodies = mockGetServiceBodies;
      });

      await fetchServiceBodies('https://custom-server.com');

      expect(BmltClient).toHaveBeenCalledWith({
        rootServerURL: 'https://custom-server.com'
      });
    });
  });
});
