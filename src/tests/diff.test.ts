import { describe, test, expect } from 'vitest';
import { generateDiff } from '../lib/utils/diff';

describe('diff utility', () => {
  describe('generateDiff', () => {
    test('detects unchanged values', () => {
      const before = { name: 'Meeting', time: '19:00' };
      const after = { name: 'Meeting', time: '19:00' };

      const diff = generateDiff(before, after);

      expect(diff).toHaveLength(2);
      expect(diff[0]).toMatchObject({
        type: 'unchanged',
        key: 'name',
        value: '"Meeting"'
      });
      expect(diff[1]).toMatchObject({
        type: 'unchanged',
        key: 'time',
        value: '"19:00"'
      });
    });

    test('detects changed values', () => {
      const before = { name: 'Meeting', time: '19:00' };
      const after = { name: 'Meeting', time: '20:00' };

      const diff = generateDiff(before, after);

      expect(diff).toHaveLength(3);
      expect(diff[0].type).toBe('unchanged');
      expect(diff[1].type).toBe('removed');
      expect(diff[1].key).toBe('time');
      expect(diff[2].type).toBe('added');
      expect(diff[2].key).toBe('time');
    });

    test('detects added fields', () => {
      const before = { name: 'Meeting' };
      const after = { name: 'Meeting', time: '19:00' };

      const diff = generateDiff(before, after);

      const addedLine = diff.find((line) => line.type === 'added');
      expect(addedLine).toBeDefined();
      expect(addedLine?.key).toBe('time');
      expect(addedLine?.fullLine).toBe('+ "time": "19:00"');
    });

    test('detects removed fields', () => {
      const before = { name: 'Meeting', time: '19:00' };
      const after = { name: 'Meeting' };

      const diff = generateDiff(before, after);

      const removedLine = diff.find((line) => line.type === 'removed');
      expect(removedLine).toBeDefined();
      expect(removedLine?.key).toBe('time');
      expect(removedLine?.fullLine).toBe('- "time": "19:00"');
    });

    test('handles null/undefined objects', () => {
      const diff = generateDiff(null, { name: 'Meeting' });

      expect(diff).toHaveLength(1);
      expect(diff[0].type).toBe('added');
    });

    test('sorts keys alphabetically', () => {
      const before = { zebra: '1', apple: '2', middle: '3' };
      const after = { zebra: '1', apple: '2', middle: '3' };

      const diff = generateDiff(before, after);

      expect(diff[0].key).toBe('apple');
      expect(diff[1].key).toBe('middle');
      expect(diff[2].key).toBe('zebra');
    });

    test('handles complex values', () => {
      const before = { nested: { inner: 'value' } };
      const after = { nested: { inner: 'changed' } };

      const diff = generateDiff(before, after);

      expect(diff).toHaveLength(2);
      expect(diff[0].type).toBe('removed');
      expect(diff[1].type).toBe('added');
    });
  });
});
