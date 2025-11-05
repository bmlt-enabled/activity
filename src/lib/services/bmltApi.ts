import { BmltClient } from 'bmlt-query-client';
import type { BmltChange } from '../types';

export async function fetchBmltChanges(server: string, serviceBodyIds: string[], daysPassed: number): Promise<BmltChange[]> {
  const client = new BmltClient({
    rootServerURL: server
  });

  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - daysPassed);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  try {
    // Fetch changes for all selected service bodies
    const allChanges: BmltChange[] = [];

    for (const serviceBodyId of serviceBodyIds) {
      const changes = await client.getChanges({
        start_date: formatDate(startDate),
        end_date: formatDate(today),
        service_body_id: parseInt(serviceBodyId, 10)
      });
      allChanges.push(...(changes as unknown as BmltChange[]));
    }

    return allChanges;
  } catch (error) {
    console.error('Failed to fetch BMLT changes:', error);
    throw error;
  }
}
