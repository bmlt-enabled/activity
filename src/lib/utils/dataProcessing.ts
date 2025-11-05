import type { BmltChange, ChangesByUser, ChangeTypeStats } from '../types';

export function getUsersFromChanges(changes: BmltChange[]): string[] {
  const users = new Set<string>();

  for (const change of changes) {
    if (change.user_name && change.user_name.trim()) {
      users.add(change.user_name);
    }
  }

  return Array.from(users).sort();
}

export function getChangesByUser(changes: BmltChange[], users: string[]): ChangesByUser {
  const userChanges: ChangesByUser = {};

  for (const user of users) {
    userChanges[user] = [];
  }

  for (const change of changes) {
    if (change.user_name && users.includes(change.user_name)) {
      userChanges[change.user_name].push(change);
    }
  }

  return userChanges;
}

export function flattenChanges(changesByUser: ChangesByUser): BmltChange[] {
  const flattened: BmltChange[] = [];

  for (const [userName, changes] of Object.entries(changesByUser)) {
    for (const change of changes) {
      flattened.push({ ...change, user_name: userName });
    }
  }

  // Sort by date descending
  flattened.sort((a, b) => b.date_int - a.date_int);

  return flattened;
}

export function formatChangeType(changeType: string): string {
  return changeType.replace('comdef_change_type_', '');
}

export function getChangeTypeStats(changes: BmltChange[]): ChangeTypeStats {
  const stats: ChangeTypeStats = {};

  for (const change of changes) {
    const type = change.change_type;
    stats[type] = (stats[type] || 0) + 1;
  }

  return stats;
}

export function countActiveUsers(changesByUser: ChangesByUser): number {
  return Object.values(changesByUser).filter((changes) => changes.length > 0).length;
}
