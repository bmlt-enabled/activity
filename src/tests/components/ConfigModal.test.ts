import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ConfigModal from '../../components/ConfigModal.svelte';
import type { BmltServer, ServiceBody } from '../../lib/types';

const mockServers: BmltServer[] = [
  { id: '1', name: 'Test Server 1', url: 'https://test1.com' },
  { id: '2', name: 'Test Server 2', url: 'https://test2.com' }
];

const mockServiceBodies: ServiceBody[] = [
  { id: '1', name: 'Regional Service', type: 'RS' },
  { id: '2', name: 'Area Service', type: 'AS' },
  { id: '3', name: 'Group', type: 'GR' }
];

// Mock the services
vi.mock('../../lib/services/serverList', () => ({
  fetchServerList: vi.fn(),
  fetchServiceBodies: vi.fn()
}));

describe('ConfigModal component', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();

    const { fetchServerList, fetchServiceBodies } = await import('../../lib/services/serverList');
    vi.mocked(fetchServerList).mockResolvedValue(mockServers);
    vi.mocked(fetchServiceBodies).mockResolvedValue(mockServiceBodies);
  });

  test('renders modal when open', () => {
    render(ConfigModal, {
      props: {
        open: true,
        onsubmit: () => {}
      }
    });

    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  test('shows loading spinner initially', () => {
    render(ConfigModal, {
      props: {
        open: true,
        onsubmit: () => {}
      }
    });

    expect(screen.getByText('Loading servers...')).toBeInTheDocument();
  });

  test('displays form fields after loading', async () => {
    render(ConfigModal, {
      props: {
        open: true,
        onsubmit: () => {}
      }
    });

    // Wait for loading to finish
    expect(await screen.findByLabelText('BMLT Server')).toBeInTheDocument();
    expect(await screen.findByLabelText('Days to Look Back')).toBeInTheDocument();
  });

  test('loads and displays servers in dropdown', async () => {
    render(ConfigModal, {
      props: {
        open: true,
        onsubmit: () => {}
      }
    });

    await screen.findByLabelText('BMLT Server');

    const { fetchServerList } = await import('../../lib/services/serverList');
    expect(fetchServerList).toHaveBeenCalledTimes(1);
  });

  test('loads service bodies when server is selected', async () => {
    const user = userEvent.setup();
    render(ConfigModal, {
      props: {
        open: true,
        onsubmit: () => {}
      }
    });

    const serverSelect = await screen.findByLabelText('BMLT Server');
    await user.selectOptions(serverSelect, 'https://test1.com');

    const { fetchServiceBodies } = await import('../../lib/services/serverList');
    await waitFor(() => {
      expect(fetchServiceBodies).toHaveBeenCalled();
    });
  });

  test('shows service bodies field after server selection', async () => {
    const user = userEvent.setup();
    render(ConfigModal, {
      props: {
        open: true,
        onsubmit: () => {}
      }
    });

    const serverSelect = await screen.findByLabelText('BMLT Server');
    await user.selectOptions(serverSelect, 'https://test1.com');

    await waitFor(() => {
      expect(screen.getByText('Service Bodies')).toBeInTheDocument();
    });
  });

  test('shows error when server list fails to load', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { fetchServerList } = await import('../../lib/services/serverList');
    vi.mocked(fetchServerList).mockRejectedValue(new Error('Failed to fetch'));

    render(ConfigModal, {
      props: {
        open: true,
        onsubmit: () => {}
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  test('shows error when service bodies fail to load', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    const { fetchServiceBodies } = await import('../../lib/services/serverList');
    vi.mocked(fetchServiceBodies).mockRejectedValue(new Error('Service body error'));

    render(ConfigModal, {
      props: {
        open: true,
        onsubmit: () => {}
      }
    });

    const serverSelect = await screen.findByLabelText('BMLT Server');
    await user.selectOptions(serverSelect, 'https://test1.com');

    await waitFor(() => {
      expect(screen.getByText('Service body error')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  test('validates that at least one service body is required', async () => {
    const user = userEvent.setup();
    const onsubmit = vi.fn();

    render(ConfigModal, {
      props: {
        open: true,
        onsubmit
      }
    });

    const serverSelect = await screen.findByLabelText('BMLT Server');
    await user.selectOptions(serverSelect, 'https://test1.com');

    await waitFor(() => {
      expect(screen.getByText('Service Bodies')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Apply & Reload');
    expect(submitButton).toBeDisabled();
  });

  test('cancel button resets form and closes modal', async () => {
    const user = userEvent.setup();
    let isOpen = true;

    render(ConfigModal, {
      props: {
        get open() {
          return isOpen;
        },
        set open(value: boolean) {
          isOpen = value;
        },
        onsubmit: () => {}
      }
    });

    await screen.findByLabelText('BMLT Server');

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(isOpen).toBe(false);
  });

  test('displays days to look back input with min and max', async () => {
    render(ConfigModal, {
      props: {
        open: true,
        onsubmit: () => {}
      }
    });

    const daysInput = (await screen.findByLabelText('Days to Look Back')) as HTMLInputElement;
    expect(daysInput.type).toBe('number');
    expect(daysInput.min).toBe('1');
    expect(daysInput.max).toBe('365');
  });

  test('shows loading indicator while fetching service bodies', async () => {
    const user = userEvent.setup();
    const { fetchServiceBodies } = await import('../../lib/services/serverList');
    vi.mocked(fetchServiceBodies).mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(mockServiceBodies), 100)));

    render(ConfigModal, {
      props: {
        open: true,
        onsubmit: () => {}
      }
    });

    const serverSelect = await screen.findByLabelText('BMLT Server');
    await user.selectOptions(serverSelect, 'https://test1.com');

    await waitFor(() => {
      expect(screen.getByText('Loading service bodies...')).toBeInTheDocument();
    });
  });

  test('displays no service bodies message when list is empty', async () => {
    const user = userEvent.setup();
    const { fetchServiceBodies } = await import('../../lib/services/serverList');
    vi.mocked(fetchServiceBodies).mockResolvedValue([]);

    render(ConfigModal, {
      props: {
        open: true,
        onsubmit: () => {}
      }
    });

    const serverSelect = await screen.findByLabelText('BMLT Server');
    await user.selectOptions(serverSelect, 'https://test1.com');

    await waitFor(() => {
      expect(screen.getByText('No service bodies found for this server')).toBeInTheDocument();
    });
  });

  test('displays help text for each field', async () => {
    render(ConfigModal, {
      props: {
        open: true,
        onsubmit: () => {}
      }
    });

    await screen.findByLabelText('BMLT Server');

    expect(screen.getByText('Select the BMLT root server to query')).toBeInTheDocument();
    expect(screen.getByText('Number of days of history to fetch (1-365)')).toBeInTheDocument();
  });
});
