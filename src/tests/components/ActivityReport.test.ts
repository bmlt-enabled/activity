import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ActivityReport from '../../components/ActivityReport.svelte';
import type { BmltChange } from '../../lib/types';

// Mock the services
vi.mock('../../lib/services/bmltApi', () => ({
  fetchBmltChanges: vi.fn()
}));

vi.mock('../../lib/services/serverList', () => ({
  fetchServerList: vi.fn().mockResolvedValue([{ id: '1', name: 'Test Server', url: 'https://test.com' }]),
  fetchServiceBodies: vi.fn().mockResolvedValue([{ id: '1', name: 'Test Service Body', type: 'AS' }])
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockChanges: BmltChange[] = [
  {
    change_id: '1',
    user_name: 'Alice',
    date_string: '2024-01-01',
    date_int: 20240101,
    change_type: 'comdef_change_type_new',
    meeting_name: 'Test Meeting 1',
    service_body_name: 'Test Area'
  },
  {
    change_id: '2',
    user_name: 'Bob',
    date_string: '2024-01-02',
    date_int: 20240102,
    change_type: 'comdef_change_type_change',
    meeting_name: 'Test Meeting 2',
    service_body_name: 'Test Area'
  }
];

describe('ActivityReport component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  test('renders without crashing', () => {
    const { container } = render(ActivityReport);
    expect(container).toBeTruthy();
  });

  test('renders with gradient background', () => {
    const { container } = render(ActivityReport);

    const wrapper = container.querySelector('.min-h-screen');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.classList.contains('bg-gradient-to-br')).toBe(true);
  });

  test('shows welcome screen when not configured', async () => {
    render(ActivityReport);

    await waitFor(() => {
      expect(screen.getByText('Welcome to BMLT Activity Report')).toBeInTheDocument();
    });

    expect(screen.getByText('Please configure your server and service body settings to get started.')).toBeInTheDocument();
  });

  test('renders header with title', () => {
    render(ActivityReport);

    // Header is always visible
    expect(screen.getByText('BMLT Change Activity Report')).toBeInTheDocument();
  });

  test('renders configure button', () => {
    render(ActivityReport);

    expect(screen.getByText('Configure')).toBeInTheDocument();
  });

  test('opens config modal when configure button clicked', async () => {
    const user = userEvent.setup();

    render(ActivityReport);

    const configButton = screen.getByText('Configure');
    await user.click(configButton);

    await waitFor(() => {
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });
  });

  test('renders welcome screen configuration button', async () => {
    render(ActivityReport);

    await waitFor(() => {
      expect(screen.getByText('Open Configuration')).toBeInTheDocument();
    });
  });
});
