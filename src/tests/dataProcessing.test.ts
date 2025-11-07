import { describe, test, expect } from 'vitest';
import { getUsersFromChanges, getChangesByUser, flattenChanges, formatChangeType, getChangeTypeStats, countActiveUsers, getMeetingName } from '../lib/utils/dataProcessing';
import type { BmltChange, ChangesByUser } from '../lib/types';

describe('dataProcessing utilities', () => {
  const mockChanges: BmltChange[] = [
    {
      change_id: '1',
      user_name: 'Alice',
      date_string: '2024-01-01',
      date_int: 20240101,
      change_type: 'comdef_change_type_new',
      meeting_name: 'Morning Meeting',
      service_body_name: 'Central Service'
    },
    {
      change_id: '2',
      user_name: 'Bob',
      date_string: '2024-01-02',
      date_int: 20240102,
      change_type: 'comdef_change_type_change',
      meeting_name: 'Evening Meeting',
      service_body_name: 'Area Service'
    },
    {
      change_id: '3',
      user_name: 'Alice',
      date_string: '2024-01-03',
      date_int: 20240103,
      change_type: 'comdef_change_type_delete',
      meeting_name: 'Noon Meeting',
      service_body_name: 'Central Service'
    }
  ];

  describe('getUsersFromChanges', () => {
    test('extracts unique user names and sorts them', () => {
      const users = getUsersFromChanges(mockChanges);
      expect(users).toEqual(['Alice', 'Bob']);
    });

    test('handles empty array', () => {
      const users = getUsersFromChanges([]);
      expect(users).toEqual([]);
    });

    test('filters out empty user names', () => {
      const changes: BmltChange[] = [{ ...mockChanges[0] }, { ...mockChanges[1], user_name: '' }, { ...mockChanges[2], user_name: '  ' }];
      const users = getUsersFromChanges(changes);
      expect(users).toEqual(['Alice']);
    });
  });

  describe('getChangesByUser', () => {
    test('groups changes by user', () => {
      const users = ['Alice', 'Bob'];
      const changesByUser = getChangesByUser(mockChanges, users);

      expect(changesByUser['Alice']).toHaveLength(2);
      expect(changesByUser['Bob']).toHaveLength(1);
      expect(changesByUser['Alice'][0].change_id).toBe('1');
      expect(changesByUser['Alice'][1].change_id).toBe('3');
      expect(changesByUser['Bob'][0].change_id).toBe('2');
    });

    test('initializes empty arrays for all users', () => {
      const users = ['Alice', 'Bob', 'Charlie'];
      const changesByUser = getChangesByUser(mockChanges, users);

      expect(changesByUser['Charlie']).toEqual([]);
    });
  });

  describe('flattenChanges', () => {
    test('flattens and sorts changes by date descending', () => {
      const changesByUser: ChangesByUser = {
        Alice: [mockChanges[0], mockChanges[2]],
        Bob: [mockChanges[1]]
      };

      const flattened = flattenChanges(changesByUser);

      expect(flattened).toHaveLength(3);
      expect(flattened[0].date_int).toBe(20240103);
      expect(flattened[1].date_int).toBe(20240102);
      expect(flattened[2].date_int).toBe(20240101);
    });
  });

  describe('formatChangeType', () => {
    test('removes comdef_change_type_ prefix', () => {
      expect(formatChangeType('comdef_change_type_new')).toBe('new');
      expect(formatChangeType('comdef_change_type_change')).toBe('change');
      expect(formatChangeType('comdef_change_type_delete')).toBe('delete');
    });
  });

  describe('getChangeTypeStats', () => {
    test('counts changes by type', () => {
      const stats = getChangeTypeStats(mockChanges);

      expect(stats['comdef_change_type_new']).toBe(1);
      expect(stats['comdef_change_type_change']).toBe(1);
      expect(stats['comdef_change_type_delete']).toBe(1);
    });

    test('handles empty array', () => {
      const stats = getChangeTypeStats([]);
      expect(stats).toEqual({});
    });
  });

  describe('countActiveUsers', () => {
    test('counts users with at least one change', () => {
      const changesByUser: ChangesByUser = {
        Alice: [mockChanges[0]],
        Bob: [mockChanges[1]],
        Charlie: []
      };

      expect(countActiveUsers(changesByUser)).toBe(2);
    });

    test('returns 0 for empty object', () => {
      expect(countActiveUsers({})).toBe(0);
    });
  });

  describe('getMeetingName', () => {
    test('returns meeting_name when available', () => {
      expect(getMeetingName(mockChanges[0])).toBe('Morning Meeting');
    });

    test('extracts from json_data.before when meeting_name is empty', () => {
      const change: BmltChange = {
        ...mockChanges[0],
        meeting_name: '',
        json_data: {
          before: { meeting_name: 'From Before' }
        }
      };

      expect(getMeetingName(change)).toBe('From Before');
    });

    test('extracts from json_data.after when before is unavailable', () => {
      const change: BmltChange = {
        ...mockChanges[0],
        meeting_name: '',
        json_data: {
          after: { meeting_name: 'From After' }
        }
      };

      expect(getMeetingName(change)).toBe('From After');
    });

    test('returns (deleted) as fallback', () => {
      const change: BmltChange = {
        ...mockChanges[0],
        meeting_name: '',
        json_data: undefined
      };

      expect(getMeetingName(change)).toBe('(deleted)');
    });
  });
});
