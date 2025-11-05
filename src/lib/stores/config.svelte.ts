const STORAGE_KEY = 'bmlt-activity-report-config';

interface ConfigData {
  bmltServer: string;
  serviceBodyIds: string[];
  daysPassed: number;
  timezone: string;
}

function loadFromStorage(): ConfigData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load config from localStorage:', error);
  }
  return null;
}

function saveToStorage(data: ConfigData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save config to localStorage:', error);
  }
}

class ConfigStore {
  #bmltServer = $state('');
  #serviceBodyIds = $state<string[]>([]);
  #daysPassed = $state(180);
  #timezone = $state('America/New_York');

  constructor() {
    // Load from localStorage on initialization
    const stored = loadFromStorage();
    if (stored) {
      this.#bmltServer = stored.bmltServer;
      this.#serviceBodyIds = stored.serviceBodyIds;
      this.#daysPassed = stored.daysPassed;
      this.#timezone = stored.timezone;
    }
  }

  get bmltServer() {
    return this.#bmltServer;
  }

  set bmltServer(value: string) {
    this.#bmltServer = value;
    this.#save();
  }

  get serviceBodyIds() {
    return this.#serviceBodyIds;
  }

  set serviceBodyIds(value: string[]) {
    this.#serviceBodyIds = value;
    this.#save();
  }

  get daysPassed() {
    return this.#daysPassed;
  }

  set daysPassed(value: number) {
    this.#daysPassed = value;
    this.#save();
  }

  get timezone() {
    return this.#timezone;
  }

  set timezone(value: string) {
    this.#timezone = value;
    this.#save();
  }

  #save(): void {
    saveToStorage({
      bmltServer: this.#bmltServer,
      serviceBodyIds: this.#serviceBodyIds,
      daysPassed: this.#daysPassed,
      timezone: this.#timezone
    });
  }
}

export const config = new ConfigStore();
