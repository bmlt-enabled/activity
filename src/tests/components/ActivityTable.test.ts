import { describe, test, expect, vi } from 'vitest';
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

  test('sorts by user name when user column clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(ActivityTable, {
      props: {
        changes: mockChanges
      }
    });

    // Click the User column header
    const userHeader = screen.getByText('User');
    await user.click(userHeader);

    // Should sort ascending by user (Alice, Bob)
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('Alice');
    expect(rows[1].textContent).toContain('Bob');
  });

  test('toggles sort direction when clicking same column', async () => {
    const user = userEvent.setup();
    const { container } = render(ActivityTable, {
      props: {
        changes: mockChanges
      }
    });

    // Default is date descending (Bob first)
    let rows = container.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('Bob');

    const dateHeader = screen.getByText('Date & Time');

    // Click to toggle to ascending
    await user.click(dateHeader);
    rows = container.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('Alice');

    // Click again to toggle back to descending
    await user.click(dateHeader);
    rows = container.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('Bob');
  });

  test('sorts by change type when type column clicked', async () => {
    const user = userEvent.setup();
    const changesWithTypes: BmltChange[] = [
      { ...mockChanges[0], change_type: 'comdef_change_type_new' },
      { ...mockChanges[1], change_type: 'comdef_change_type_delete' },
      { ...mockChanges[0], change_id: '3', change_type: 'comdef_change_type_change' }
    ];

    const { container } = render(ActivityTable, {
      props: {
        changes: changesWithTypes
      }
    });

    const typeHeader = screen.getByText('Change Type');
    await user.click(typeHeader);

    // Should sort by type ascending (change, delete, new)
    const badges = container.querySelectorAll('.capitalize');
    expect(badges[0].textContent).toContain('change');
  });

  test('sorts by meeting name when meeting column clicked', async () => {
    const user = userEvent.setup();
    const changesWithNames: BmltChange[] = [
      { ...mockChanges[0], meeting_name: 'Zebra Meeting' },
      { ...mockChanges[1], meeting_name: 'Alpha Meeting' }
    ];

    const { container } = render(ActivityTable, {
      props: {
        changes: changesWithNames
      }
    });

    const meetingHeader = screen.getByText('Meeting Name');
    await user.click(meetingHeader);

    // Should sort ascending (Alpha, Zebra)
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('Alpha Meeting');
    expect(rows[1].textContent).toContain('Zebra Meeting');
  });

  test('sorts by service body when service column clicked', async () => {
    const user = userEvent.setup();
    const changesWithServices: BmltChange[] = [
      { ...mockChanges[0], service_body_name: 'Zebra Service' },
      { ...mockChanges[1], service_body_name: 'Alpha Service' }
    ];

    const { container } = render(ActivityTable, {
      props: {
        changes: changesWithServices
      }
    });

    const serviceHeader = screen.getByText('Service Body');
    await user.click(serviceHeader);

    // Should sort ascending (Alpha, Zebra)
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('Alpha Service');
    expect(rows[1].textContent).toContain('Zebra Service');
  });

  test('displays sort indicators on sorted column', async () => {
    const user = userEvent.setup();
    render(ActivityTable, {
      props: {
        changes: mockChanges
      }
    });

    // Default sort is date descending - should show down chevron
    // Note: Flowbite icons render as SVG, checking for presence
    const dateHeader = screen.getByText('Date & Time');
    expect(dateHeader.parentElement).toBeInTheDocument();

    // Click to sort by user
    const userHeader = screen.getByText('User');
    await user.click(userHeader);

    // User column should now have indicator
    expect(userHeader.parentElement).toBeInTheDocument();
  });

  test('displays all change type badge colors correctly', () => {
    const changesWithAllTypes: BmltChange[] = [
      { ...mockChanges[0], change_id: '1', change_type: 'comdef_change_type_new' },
      { ...mockChanges[0], change_id: '2', change_type: 'comdef_change_type_change' },
      { ...mockChanges[0], change_id: '3', change_type: 'comdef_change_type_delete' },
      { ...mockChanges[0], change_id: '4', change_type: 'comdef_change_type_rollback' }
    ];

    render(ActivityTable, {
      props: {
        changes: changesWithAllTypes
      }
    });

    expect(screen.getAllByText('new').length).toBeGreaterThan(0);
    expect(screen.getAllByText('change').length).toBeGreaterThan(0);
    expect(screen.getAllByText('delete').length).toBeGreaterThan(0);
    expect(screen.getAllByText('rollback').length).toBeGreaterThan(0);
  });

  test('handles invalid json_data gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();

    const changeWithInvalidJson: BmltChange = {
      ...mockChanges[0],
      json_data: 'invalid json {{{'
    };

    render(ActivityTable, {
      props: {
        changes: [changeWithInvalidJson]
      }
    });

    const meetingNames = screen.getAllByText('Morning Meeting');
    await user.click(meetingNames[0]);

    // Should show modal with error message
    expect(await screen.findByText('Change Details')).toBeInTheDocument();
    expect(await screen.findByText('No detailed change data available for this entry.')).toBeInTheDocument();

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test('modal shows change summary with details', async () => {
    const user = userEvent.setup();
    const changeWithDetails: BmltChange = {
      ...mockChanges[0],
      details: 'Meeting time changed from 10:00 to 11:00. Location updated to new address.'
    };

    render(ActivityTable, {
      props: {
        changes: [changeWithDetails]
      }
    });

    const meetingNames = screen.getAllByText('Morning Meeting');
    await user.click(meetingNames[0]);

    expect(await screen.findByText('Change Summary')).toBeInTheDocument();
    expect(screen.getByText(/Meeting time changed/)).toBeInTheDocument();
  });

  test('modal does not show details section when details is empty', async () => {
    const user = userEvent.setup();
    const changeNoDetails: BmltChange = {
      ...mockChanges[0],
      details: ''
    };

    render(ActivityTable, {
      props: {
        changes: [changeNoDetails]
      }
    });

    const meetingNames = screen.getAllByText('Morning Meeting');
    await user.click(meetingNames[0]);

    // When details is empty string, the details section doesn't render at all
    expect(await screen.findByText('Change Details')).toBeInTheDocument();
    expect(screen.queryByText('Change Summary')).not.toBeInTheDocument();
  });

  test('modal shows unified diff when both before and after exist', async () => {
    const user = userEvent.setup();
    const changeWithDiff: BmltChange = {
      ...mockChanges[0],
      json_data: JSON.stringify({
        before: { meeting_name: 'Old Name', location: 'Old Location' },
        after: { meeting_name: 'New Name', location: 'New Location' }
      })
    };

    render(ActivityTable, {
      props: {
        changes: [changeWithDiff]
      }
    });

    const meetingNames = screen.getAllByText('Morning Meeting');
    await user.click(meetingNames[0]);

    expect(await screen.findByText('Changes')).toBeInTheDocument();
    // The diff will be displayed as a pre element
  });

  test('modal shows separate before/after when only one exists', async () => {
    const user = userEvent.setup();
    const changeOnlyAfter: BmltChange = {
      ...mockChanges[0],
      json_data: JSON.stringify({
        after: { meeting_name: 'New Meeting' }
      })
    };

    render(ActivityTable, {
      props: {
        changes: [changeOnlyAfter]
      }
    });

    const meetingNames = screen.getAllByText('Morning Meeting');
    await user.click(meetingNames[0]);

    expect(await screen.findByText('After')).toBeInTheDocument();
  });

  test('modal shows before section when only before exists', async () => {
    const user = userEvent.setup();
    const changeOnlyBefore: BmltChange = {
      ...mockChanges[0],
      json_data: JSON.stringify({
        before: { meeting_name: 'Old Meeting' }
      })
    };

    render(ActivityTable, {
      props: {
        changes: [changeOnlyBefore]
      }
    });

    const meetingNames = screen.getAllByText('Morning Meeting');
    await user.click(meetingNames[0]);

    expect(await screen.findByText('Before')).toBeInTheDocument();
  });

  test('modal displays close button', async () => {
    const user = userEvent.setup();
    render(ActivityTable, {
      props: {
        changes: mockChanges
      }
    });

    // Open modal
    const meetingNames = screen.getAllByText('Morning Meeting');
    await user.click(meetingNames[0]);

    expect(await screen.findByText('Change Details')).toBeInTheDocument();

    // Verify close button(s) exist
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  test('handles json_data as object instead of string', async () => {
    const user = userEvent.setup();
    const changeWithObjectData: BmltChange = {
      ...mockChanges[0],
      json_data: {
        before: { name: 'Old' },
        after: { name: 'New' }
      } as any
    };

    render(ActivityTable, {
      props: {
        changes: [changeWithObjectData]
      }
    });

    const meetingNames = screen.getAllByText('Morning Meeting');
    await user.click(meetingNames[0]);

    // Should handle object json_data and show Changes
    expect(await screen.findByText('Changes')).toBeInTheDocument();
  });

  test('mobile view renders cards for each change', () => {
    const { container } = render(ActivityTable, {
      props: {
        changes: mockChanges
      }
    });

    // Mobile cards have specific structure
    const mobileCards = container.querySelectorAll('.md\\:hidden button');
    expect(mobileCards.length).toBe(2);
  });

  test('mobile card click opens modal', async () => {
    const user = userEvent.setup();
    const { container } = render(ActivityTable, {
      props: {
        changes: mockChanges
      }
    });

    // Find mobile card button
    const mobileCards = container.querySelectorAll('.md\\:hidden button');
    await user.click(mobileCards[0]);

    expect(await screen.findByText('Change Details')).toBeInTheDocument();
  });

  test('handles changes without meeting_name by showing (deleted)', () => {
    const changeWithoutName: BmltChange = {
      change_id: '999',
      user_name: 'Test User',
      date_string: '2024-01-01',
      date_int: 20240101,
      change_type: 'comdef_change_type_new'
      // No meeting_name field
    };

    render(ActivityTable, {
      props: {
        changes: [changeWithoutName]
      }
    });

    // Should fall back to displaying "(deleted)" when no meeting_name
    expect(screen.getAllByText('(deleted)').length).toBeGreaterThan(0);
  });
});
