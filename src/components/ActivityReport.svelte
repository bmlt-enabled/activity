<script lang="ts">
  import { onMount } from 'svelte';
  import { Spinner, Alert, Button } from 'flowbite-svelte';
  import { CogOutline } from 'flowbite-svelte-icons';
  import Stats from './Stats.svelte';
  import Filters from './Filters.svelte';
  import ActivityTable from './ActivityTable.svelte';
  import ConfigModal from './ConfigModal.svelte';
  import { config } from '../lib/stores/config.svelte';
  import { fetchBmltChanges } from '../lib/services/bmltApi';
  import { getUsersFromChanges, getChangesByUser, flattenChanges, getChangeTypeStats, countActiveUsers, formatChangeType } from '../lib/utils/dataProcessing';
  import type { BmltChange, ChangeType } from '../lib/types';

  let loading = $state(false);
  let error = $state<string | null>(null);
  let allChanges = $state<BmltChange[]>([]);
  let users = $state<string[]>([]);
  let configModalOpen = $state(false);
  let isConfigured = $state(false);

  let searchTerm = $state('');
  let selectedType = $state<ChangeType>('');
  let selectedUser = $state('');

  const filteredChanges = $derived.by(() => {
    return allChanges.filter((change) => {
      const matchesSearch =
        searchTerm === '' ||
        change.meeting_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      error = err instanceof Error ? err.message : 'Failed to load activity data';
      loading = false;
    }
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
  });
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 p-6" style="--tw-gradient-from: #0066B3; --tw-gradient-to: #0052A3;">
  <div class="mx-auto max-w-7xl">
    <div class="overflow-hidden rounded-lg bg-white shadow-2xl">
      <!-- Header -->
      <div class="px-4 py-4 text-white sm:px-8 sm:py-6" style="background: linear-gradient(to right, #004080, #003366);">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="mb-1 text-2xl font-bold sm:mb-2 sm:text-3xl">BMLT User Activity Report</h1>
            <p class="text-sm opacity-90 sm:text-lg">
              {config.serviceBodyIds.length} Service {config.serviceBodyIds.length === 1 ? 'Body' : 'Bodies'} - Last {config.daysPassed} Days
            </p>
          </div>
          <Button color="light" size="sm" class="w-full hover:bg-white/90 sm:w-auto" onclick={() => (configModalOpen = true)}>
            <CogOutline class="mr-2 h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      {#if !isConfigured && !loading}
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <div class="mb-4 text-6xl">⚙️</div>
          <h2 class="mb-2 text-2xl font-bold text-gray-700">Welcome to BMLT Activity Report</h2>
          <p class="mb-6 text-gray-600">Please configure your server and service body settings to get started.</p>
          <Button style="background-color: #0066B3;" class="text-white hover:opacity-90" onclick={() => (configModalOpen = true)}>
            <CogOutline class="mr-2 h-5 w-5" />
            Open Configuration
          </Button>
        </div>
      {:else if loading}
        <div class="flex items-center justify-center py-20">
          <Spinner size="12" />
          <span class="ml-3 text-lg text-gray-600">Loading activity data...</span>
        </div>
      {:else if error}
        <div class="p-8">
          <Alert color="red">
            <span class="font-medium">Error:</span>
            {error}
          </Alert>
        </div>
      {:else}
        <!-- Stats Section -->
        <div class="border-b border-gray-200 bg-gray-50 p-4 sm:p-8">
          <Stats totalChanges={stats.totalChanges} activeUsers={stats.activeUsers} changeTypes={stats.changeTypes} />
        </div>

        <!-- Filters Section -->
        <div class="border-b border-gray-200 bg-white p-4 sm:p-8">
          <Filters bind:searchTerm bind:selectedType bind:selectedUser {users} />
        </div>

        <!-- Table Section -->
        <div class="p-4 sm:p-8">
          <ActivityTable changes={filteredChanges} />
        </div>
      {/if}
    </div>
  </div>
</div>

<ConfigModal bind:open={configModalOpen} onsubmit={handleConfigSubmit} />
