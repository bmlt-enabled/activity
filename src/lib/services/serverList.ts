import { BmltClient } from 'bmlt-query-client';
import type { BmltServer, ServiceBody } from '../types';

const SERVER_LIST_URL = 'https://raw.githubusercontent.com/bmlt-enabled/aggregator/refs/heads/main/serverList.json';

export async function fetchServerList(): Promise<BmltServer[]> {
  try {
    const response = await fetch(SERVER_LIST_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as BmltServer[];
  } catch (error) {
    console.error('Failed to fetch server list:', error);
    throw error;
  }
}

export async function fetchServiceBodies(serverUrl: string): Promise<ServiceBody[]> {
  try {
    const client = new BmltClient({
      rootServerURL: serverUrl
    });

    const serviceBodies = await client.getServiceBodies();
    return serviceBodies as unknown as ServiceBody[];
  } catch (error) {
    console.error('Failed to fetch service bodies:', error);
    throw error;
  }
}
