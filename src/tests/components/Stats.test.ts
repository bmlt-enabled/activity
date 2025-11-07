import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Stats from '../../components/Stats.svelte';
import type { ChangeTypeStats } from '../../lib/types';

describe('Stats component', () => {
  test('renders all stat cards', () => {
    const changeTypes: ChangeTypeStats = {
      comdef_change_type_change: 10,
      comdef_change_type_new: 5,
      comdef_change_type_delete: 2
    };

    render(Stats, {
      props: {
        totalChanges: 17,
        activeUsers: 8,
        changeTypes
      }
    });

    expect(screen.getByText('Total Changes')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Edits')).toBeInTheDocument();
    expect(screen.getByText('New Meetings')).toBeInTheDocument();
    expect(screen.getByText('Deletions')).toBeInTheDocument();
  });

  test('displays correct stat values', () => {
    const changeTypes: ChangeTypeStats = {
      comdef_change_type_change: 25,
      comdef_change_type_new: 10,
      comdef_change_type_delete: 3
    };

    render(Stats, {
      props: {
        totalChanges: 38,
        activeUsers: 12,
        changeTypes
      }
    });

    expect(screen.getByText('38')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('formats large numbers with commas', () => {
    const changeTypes: ChangeTypeStats = {
      comdef_change_type_change: 500,
      comdef_change_type_new: 200,
      comdef_change_type_delete: 50
    };

    render(Stats, {
      props: {
        totalChanges: 1234,
        activeUsers: 45,
        changeTypes
      }
    });

    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  test('handles missing change types with zero', () => {
    const changeTypes: ChangeTypeStats = {};

    render(Stats, {
      props: {
        totalChanges: 0,
        activeUsers: 0,
        changeTypes
      }
    });

    // Should display 0 for missing change types
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(3); // At least edits, new, deletions
  });

  test('handles partial change type data', () => {
    const changeTypes: ChangeTypeStats = {
      comdef_change_type_change: 15
      // Missing new and delete
    };

    render(Stats, {
      props: {
        totalChanges: 15,
        activeUsers: 5,
        changeTypes
      }
    });

    // Both total changes and edits show 15
    const fifteens = screen.getAllByText('15');
    expect(fifteens.length).toBeGreaterThanOrEqual(1);

    // Should show 0 for missing types
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(2); // new and delete
  });
});
