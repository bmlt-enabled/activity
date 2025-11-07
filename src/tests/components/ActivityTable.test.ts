import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ActivityTable from '../../components/ActivityTable.svelte';
import type { BmltChange } from '../../lib/types';

describe('ActivityTable component', () => {
  const mockChanges: BmltChange[] = [
    {
      change_id: '1',
      user_name: 'Alice',
      date_string: '2024-01-01 10:00:00',
      date_int: 20240101,
      change_type: 'comdef_change_type_new',
      meeting_name: 'Morning Meeting',
      service_body_name: 'Central Service'
    },
    {
      change_id: '2',
      user_name: 'Bob',
      date_string: '2024-01-02 14:30:00',
      date_int: 20240102,
      change_type: 'comdef_change_type_change',
      meeting_name: 'Evening Meeting',
      service_body_name: 'Area Service'
    }
  ];

  test('shows empty state when no changes', () => {
    render(ActivityTable, {
      props: {
        changes: []
      }
    });

    expect(screen.getByText('No changes found for the specified date range.')).toBeInTheDocument();
  });

  test('renders table with changes', () => {
    render(ActivityTable, {
      props: {
        changes: mockChanges
      }
    });

    expect(screen.getAllByText('Morning Meeting').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Evening Meeting').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Bob').length).toBeGreaterThan(0);
  });

  test('displays change type badges', () => {
    render(ActivityTable, {
      props: {
        changes: mockChanges
      }
    });

    expect(screen.getAllByText('new').length).toBeGreaterThan(0);
    expect(screen.getAllByText('change').length).toBeGreaterThan(0);
  });

  test('displays service body names', () => {
    render(ActivityTable, {
      props: {
        changes: mockChanges
      }
    });

    expect(screen.getAllByText('Central Service').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Area Service').length).toBeGreaterThan(0);
  });

  test('displays date strings', () => {
    render(ActivityTable, {
      props: {
        changes: mockChanges
      }
    });

    expect(screen.getAllByText('2024-01-01 10:00:00').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2024-01-02 14:30:00').length).toBeGreaterThan(0);
  });

  test('displays change IDs', () => {
    render(ActivityTable, {
      props: {
        changes: mockChanges
      }
    });

    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
  });

  test('shows sortable column headers', () => {
    render(ActivityTable, {
      props: {
        changes: mockChanges
      }
    });

    expect(screen.getByText('Date & Time')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Change Type')).toBeInTheDocument();
    expect(screen.getByText('Meeting Name')).toBeInTheDocument();
    expect(screen.getByText('Service Body')).toBeInTheDocument();
    expect(screen.getByText('Change ID')).toBeInTheDocument();
  });

  test('opens modal when row is clicked', async () => {
    const user = userEvent.setup();
    render(ActivityTable, {
      props: {
        changes: mockChanges
      }
    });

    // Click on a table row (clicking the first occurrence of meeting name)
    const meetingNames = screen.getAllByText('Morning Meeting');
    await user.click(meetingNames[0]);

    // Modal should open with "Change Details" title
    expect(await screen.findByText('Change Details')).toBeInTheDocument();
  });

  test('modal displays change information', async () => {
    const user = userEvent.setup();
    const changeWithDetails: BmltChange = {
      ...mockChanges[0],
      details: 'Meeting name changed. Location updated.'
    };

    render(ActivityTable, {
      props: {
        changes: [changeWithDetails]
      }
    });

    const meetingNames = screen.getAllByText('Morning Meeting');
    await user.click(meetingNames[0]);

    // Check modal content
    expect(await screen.findByText('Change Details')).toBeInTheDocument();
    expect(screen.getAllByText('Morning Meeting').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
  });

  test('handles missing service body name', () => {
    const changeWithoutServiceBody: BmltChange = {
      ...mockChanges[0],
      service_body_name: undefined
    };

    render(ActivityTable, {
      props: {
        changes: [changeWithoutServiceBody]
      }
    });

    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
  });

  test('sorts by date by default (descending)', () => {
    const { container } = render(ActivityTable, {
      props: {
        changes: mockChanges
      }
    });

    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);

    // First row should be the newer change (Bob's)
    expect(rows[0].textContent).toContain('Bob');
  });

  test('handles changes with json_data', async () => {
    const user = userEvent.setup();
    const changeWithJsonData: BmltChange = {
      ...mockChanges[0],
      json_data: JSON.stringify({
        before: { meeting_name: 'Old Name' },
        after: { meeting_name: 'New Name' }
      })
    };

    render(ActivityTable, {
      props: {
        changes: [changeWithJsonData]
      }
    });

    const meetingNames = screen.getAllByText('Morning Meeting');
    await user.click(meetingNames[0]);

    // Should show the modal
    expect(await screen.findByText('Change Details')).toBeInTheDocument();
  });
});
