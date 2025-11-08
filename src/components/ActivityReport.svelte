<script lang="ts">
  import { onMount } from 'svelte';
  import { Spinner, Alert, Button } from 'flowbite-svelte';
  import { CogOutline } from 'flowbite-svelte-icons';
  import Stats from './Stats.svelte';
  import Filters from './Filters.svelte';
  import ActivityTable from './ActivityTable.svelte';
  import ConfigModal from './ConfigModal.svelte';
  import SettingsModal from './SettingsModal.svelte';
  import DarkMode from './DarkMode.svelte';
  import { config } from '../lib/stores/config.svelte';
  import { fetchBmltChanges } from '../lib/services/bmltApi';
  import { getUsersFromChanges, getChangesByUser, flattenChanges, getChangeTypeStats, countActiveUsers, formatChangeType, getMeetingName } from '../lib/utils/dataProcessing';
  import type { BmltChange, ChangeType } from '../lib/types';
  import { translations } from '../lib/stores/localization';

  const allLanguages = [
    { value: 'en', name: 'English' },
    { value: 'es', name: 'Español' }
  ];

  function detectBrowserLanguage() {
    const browserLang = navigator.languages ? navigator.languages[0] : navigator.language;
    const shortLang = browserLang.slice(0, 2);
    const supported = allLanguages.map((l) => l.value);
    return supported.includes(shortLang) ? shortLang : 'en';
  }

  const initialLang = localStorage.getItem('activityLanguage') || detectBrowserLanguage();
  let activityLanguage = $state(initialLang);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let allChanges = $state<BmltChange[]>([]);
  let users = $state<string[]>([]);
  let configModalOpen = $state(false);
  let settingsModalOpen = $state(false);
  let isConfigured = $state(false);

  let searchTerm = $state('');
  let selectedType = $state<ChangeType>('');
  let selectedUser = $state('');

  const filteredChanges = $derived.by(() => {
    return allChanges.filter((change) => {
      const matchesSearch =
        searchTerm === '' ||
        getMeetingName(change).toLowerCase().includes(searchTerm.toLowerCase()) ||
        change.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatChangeType(change.change_type).toLowerCase().includes(searchTerm.toLowerCase()) ||
        change.service_body_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === '' || formatChangeType(change.change_type) === selectedType;

      const matchesUser = selectedUser === '' || change.user_name === selectedUser;

      return matchesSearch && matchesType && matchesUser;
    });
  });

  const stats = $derived.by(() => {
    const changesByUser = getChangesByUser(allChanges, users);
    return {
      totalChanges: allChanges.length,
      activeUsers: countActiveUsers(changesByUser),
      changeTypes: getChangeTypeStats(allChanges)
    };
  });

  async function loadData() {
    try {
      loading = true;
      error = null;

      const changes = await fetchBmltChanges(config.bmltServer, config.serviceBodyIds, config.daysPassed);

      users = getUsersFromChanges(changes);
      const changesByUser = getChangesByUser(changes, users);
      allChanges = flattenChanges(changesByUser);

      loading = false;
      isConfigured = true;
    } catch (err) {
      error = err instanceof Error ? err.message : $translations.failedToLoadActivityData;
      loading = false;
    }
  }

  function handleLanguageChange(lang: string) {
    activityLanguage = lang;
  }

  function handleConfigSubmit() {
    configModalOpen = false;
    loadData();
  }

  onMount(() => {
    // Check if configuration exists
    if (!config.bmltServer || config.serviceBodyIds.length === 0) {
      configModalOpen = true;
    } else {
      isConfigured = true;
      loadData();
    }
    translations.setLanguage(activityLanguage);
  });

  $effect(() => {
    localStorage.setItem('activityLanguage', activityLanguage);
    translations.setLanguage(activityLanguage);
  });
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 p-6 dark:from-gray-900 dark:to-gray-800" style="--tw-gradient-from: #0066B3; --tw-gradient-to: #0052A3;">
  <div class="mx-auto max-w-7xl">
    <div class="overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-900">
      <!-- Header -->
      <div class="border-b border-gray-200 bg-white px-4 py-4 sm:px-8 sm:py-6 dark:border-gray-700 dark:bg-gray-800">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="mb-1 text-2xl font-bold text-gray-900 sm:mb-2 sm:text-3xl dark:text-gray-100">{$translations.title}</h1>
            <p class="text-sm text-gray-600 sm:text-base dark:text-gray-400">
              {config.serviceBodyIds.length}
              {$translations.service}
              {config.serviceBodyIds.length === 1 ? $translations.body : $translations.bodies} - {$translations.last}
              {config.daysPassed}
              {$translations.days}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              onclick={() => (settingsModalOpen = true)}
              title={$translations.languageSettings}
              class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            >
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="1.5" />
                <ellipse cx="12" cy="12" rx="10" ry="4" stroke-width="1.5" fill="none" />
                <ellipse cx="12" cy="12" rx="4" ry="10" stroke-width="1.5" fill="none" />
              </svg>
            </button>
            <div title={$translations.darkMode}>
              <DarkMode size="lg" class="" />
            </div>
            <Button size="sm" class="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600" onclick={() => (configModalOpen = true)}>
              <CogOutline class="mr-2 h-4 w-4" />
              {$translations.configure}
            </Button>
          </div>
        </div>
      </div>

      {#if !isConfigured && !loading}
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <div class="mb-4 text-6xl">⚙️</div>
          <h2 class="mb-2 text-2xl font-bold text-gray-700 dark:text-gray-200">{$translations.welcomeToActivityReport}</h2>
          <p class="mb-6 text-gray-600 dark:text-gray-400">{$translations.pleaseConfigureSettings}</p>
          <Button class="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600" onclick={() => (configModalOpen = true)}>
            <CogOutline class="mr-2 h-5 w-5" />
            {$translations.openConfiguration}
          </Button>
        </div>
      {:else if loading}
        <div class="flex items-center justify-center py-20">
          <Spinner size="12" />
          <span class="ml-3 text-lg text-gray-600 dark:text-gray-400">{$translations.loadingActivityData}</span>
        </div>
      {:else if error}
        <div class="p-8">
          <Alert color="red">
            <span class="font-medium">{$translations.error}:</span>
            {error}
          </Alert>
        </div>
      {:else}
        <!-- Stats Section -->
        <div class="border-b border-gray-200 bg-gray-50 p-4 sm:p-8 dark:border-gray-700 dark:bg-gray-800">
          <Stats totalChanges={stats.totalChanges} activeUsers={stats.activeUsers} changeTypes={stats.changeTypes} />
        </div>

        <!-- Filters Section -->
        <div class="border-b border-gray-200 bg-white p-4 sm:p-8 dark:border-gray-700 dark:bg-gray-900">
          <Filters bind:searchTerm bind:selectedType bind:selectedUser {users} />
        </div>

        <!-- Table Section -->
        <div class="p-4 sm:p-8 dark:bg-gray-900">
          <ActivityTable changes={filteredChanges} />
        </div>
      {/if}
    </div>
  </div>
</div>

<ConfigModal bind:open={configModalOpen} onsubmit={handleConfigSubmit} />
<SettingsModal bind:open={settingsModalOpen} currentLanguage={activityLanguage} onLanguageChange={handleLanguageChange} />
