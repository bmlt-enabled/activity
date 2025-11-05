class ConfigStore {
  bmltServer = $state('https://bmlt.sezf.org/main_server');
  serviceBodyIds = $state<string[]>(['43']);
  daysPassed = $state(180);
  timezone = $state('America/New_York');
}

export const config = new ConfigStore();
