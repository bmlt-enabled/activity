export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  key: string;
  value: string;
  fullLine: string;
}

export function generateDiff(before: any, after: any): DiffLine[] {
  const lines: DiffLine[] = [];

  // Get all unique keys from both objects
  const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);

  for (const key of Array.from(allKeys).sort()) {
    const beforeValue = before?.[key];
    const afterValue = after?.[key];

    // Convert values to strings for comparison
    const beforeStr = beforeValue !== undefined ? JSON.stringify(beforeValue) : undefined;
    const afterStr = afterValue !== undefined ? JSON.stringify(afterValue) : undefined;

    if (beforeStr === afterStr) {
      // Unchanged
      lines.push({
        type: 'unchanged',
        key,
        value: beforeStr || '',
        fullLine: `  "${key}": ${beforeStr}`
      });
    } else {
      // Changed or added/removed
      if (beforeStr !== undefined) {
        lines.push({
          type: 'removed',
          key,
          value: beforeStr,
          fullLine: `- "${key}": ${beforeStr}`
        });
      }
      if (afterStr !== undefined) {
        lines.push({
          type: 'added',
          key,
          value: afterStr,
          fullLine: `+ "${key}": ${afterStr}`
        });
      }
    }
  }

  return lines;
}
