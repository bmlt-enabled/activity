import { describe, test, expect } from 'vitest';
import { formatDetailsAsList } from '../lib/utils/detailsFormatter';

describe('detailsFormatter utility', () => {
  describe('formatDetailsAsList', () => {
    test('returns empty array for null input', () => {
      expect(formatDetailsAsList(null)).toEqual([]);
    });

    test('returns empty array for undefined input', () => {
      expect(formatDetailsAsList(undefined)).toEqual([]);
    });

    test('returns empty array for empty string', () => {
      expect(formatDetailsAsList('')).toEqual([]);
    });

    test('splits on periods to create list items', () => {
      const details = 'First change. Second change. Third change';
      const result = formatDetailsAsList(details);

      expect(result).toEqual(['First change', 'Second change', 'Third change']);
    });

    test('preserves URLs with dots', () => {
      const details = 'URL changed to https://example.com/path. Other change';
      const result = formatDetailsAsList(details);

      // When the string doesn't end with a period, the second part is included in the split
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((item) => item.includes('https://example.com/path'))).toBe(true);
    });

    test('preserves email addresses with dots', () => {
      const details = 'Email changed to user@example.com. Other change';
      const result = formatDetailsAsList(details);

      expect(result).toEqual(['Email changed to user@example.com', 'Other change']);
    });

    test('preserves coordinates with decimal points', () => {
      const details = 'Latitude changed from "42.123456 to "42.654321';
      const result = formatDetailsAsList(details);

      expect(result).toHaveLength(1);
      expect(result[0]).toContain('42.123456');
      expect(result[0]).toContain('42.654321');
    });

    test('preserves negative coordinates', () => {
      const details = 'Longitude changed from "-71.123456 to "-71.654321';
      const result = formatDetailsAsList(details);

      expect(result).toHaveLength(1);
      expect(result[0]).toContain('-71.123456');
      expect(result[0]).toContain('-71.654321');
    });

    test('removes unwanted root_server_uri phrase', () => {
      const details = 'Name changed. root_server_uri was added as "https:" . Other change.';
      const result = formatDetailsAsList(details);

      expect(result).toHaveLength(2);
      expect(result.some((item) => item.includes('Name changed'))).toBe(true);
      expect(result.some((item) => item.includes('Other change'))).toBe(true);
    });

    test('removes empty email_contact changes', () => {
      const details = 'Name changed. email_contact was changed from "" to "". Other change';
      const result = formatDetailsAsList(details);

      expect(result).toEqual(['Name changed', 'Other change']);
    });

    test('removes #@-@# from custom fields', () => {
      const details = 'Field changed #@-@# to new value';
      const result = formatDetailsAsList(details);

      expect(result[0]).not.toContain('#@-@#');
      expect(result[0]).toContain('Field changed   to new value');
    });

    test('handles complex mixed content', () => {
      const details = 'Meeting name changed. Contact updated to admin@example.com. Website set to https://meeting.org. Final change made';

      const result = formatDetailsAsList(details);

      expect(result.length).toBeGreaterThan(0);
      expect(result.some((item) => item.includes('Meeting name changed'))).toBe(true);
      expect(result.some((item) => item.includes('admin@example.com'))).toBe(true);
      expect(result.some((item) => item.includes('https://meeting.org'))).toBe(true);
    });

    test('trims whitespace from items', () => {
      const details = '  First item  .   Second item   .  Third item  ';
      const result = formatDetailsAsList(details);

      expect(result).toEqual(['First item', 'Second item', 'Third item']);
    });

    test('filters out empty items after splitting', () => {
      const details = 'First. . . Second. . Third';
      const result = formatDetailsAsList(details);

      expect(result).toEqual(['First', 'Second', 'Third']);
    });

    test('handles HTTPS URLs correctly', () => {
      const details = 'Changed from http://old.com to https://new.com. Done';
      const result = formatDetailsAsList(details);

      expect(result.length).toBeGreaterThan(0);
      expect(result.some((item) => item.includes('http://old.com'))).toBe(true);
      expect(result.some((item) => item.includes('https://new.com'))).toBe(true);
    });

    test('handles multiple email addresses', () => {
      const details = 'Email from old@test.com to new@example.org. Completed';
      const result = formatDetailsAsList(details);

      expect(result).toHaveLength(2);
      expect(result[0]).toContain('old@test.com');
      expect(result[0]).toContain('new@example.org');
    });

    test('preserves periods within quoted strings', () => {
      const details =
        'Additional Location Information was changed from "Private dinning room in rear of cafeteria / Free parking pass validated at front desk." to "Private dining room in rear of cafeteria / Free parking pass validated at front desk."';
      const result = formatDetailsAsList(details);

      // Should be a single item since the periods are within quotes
      expect(result).toHaveLength(1);
      expect(result[0]).toContain('Private dinning room in rear of cafeteria / Free parking pass validated at front desk.');
      expect(result[0]).toContain('Private dining room in rear of cafeteria / Free parking pass validated at front desk.');
    });

    test('handles multiple sentences with periods in quotes', () => {
      const details = 'Field was changed from "First. Second." to "Third. Fourth.". Another change made';
      const result = formatDetailsAsList(details);

      expect(result).toHaveLength(2);
      expect(result[0]).toContain('Field was changed from "First. Second." to "Third. Fourth."');
      expect(result[1]).toEqual('Another change made');
    });
  });
});
