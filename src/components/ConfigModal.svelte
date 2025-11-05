<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Modal, Label, Input, Select, MultiSelect, Spinner, Alert } from 'flowbite-svelte';
  import { config } from '../lib/stores/config.svelte';
  import { fetchServerList, fetchServiceBodies } from '../lib/services/serverList';
  import type { BmltServer, ServiceBody } from '../lib/types';

  interface Props {
    open: boolean;
    onsubmit: () => void;
  }

  let { open = $bindable(), onsubmit }: Props = $props();

  let servers = $state<BmltServer[]>([]);
  let serviceBodies = $state<ServiceBody[]>([]);
  let loadingServers = $state(true);
  let loadingServiceBodies = $state(false);
  let error = $state<string | null>(null);

  let localServer = $state(config.bmltServer);
  let localServiceBodyIds = $state<string[]>([...config.serviceBodyIds]);
  let localDaysPassed = $state(config.daysPassed);

  const serverOptions = $derived(
    servers.map((server) => ({
      value: server.url,
      name: server.name
    }))
  );

  const serviceBodyOptions = $derived(
    serviceBodies.map((sb) => ({
      value: sb.id,
      name: `${sb.name} (${sb.type})`
    }))
  );

  async function loadServers() {
    try {
      loadingServers = true;
      error = null;
      servers = await fetchServerList();
      loadingServers = false;

      // Load service bodies for current server
      if (localServer) {
        await loadServiceBodies(localServer);
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load servers';
      loadingServers = false;
    }
  }

  async function loadServiceBodies(serverUrl: string) {
    try {
      loadingServiceBodies = true;
      error = null;
      serviceBodies = await fetchServiceBodies(serverUrl);
      loadingServiceBodies = false;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load service bodies';
      loadingServiceBodies = false;
    }
  }

  async function handleServerChange() {
    localServiceBodyIds = [];
    if (localServer) {
      await loadServiceBodies(localServer);
    }
  }

  function handleSubmit() {
    if (localServiceBodyIds.length === 0) {
      error = 'Please select at least one service body';
      return;
    }

    config.bmltServer = localServer;
    config.serviceBodyIds = [...localServiceBodyIds];
    config.daysPassed = localDaysPassed;
    onsubmit();
  }

  function handleCancel() {
    // Reset to current config values
    localServer = config.bmltServer;
    localServiceBodyIds = [...config.serviceBodyIds];
    localDaysPassed = config.daysPassed;
    open = false;
  }

  onMount(() => {
    loadServers();
  });
</script>

<Modal bind:open title="Configuration" autoclose={false} outsideclose size="lg">
  {#if loadingServers}
    <div class="flex items-center justify-center py-12">
      <Spinner size="8" />
      <span class="ml-3 text-gray-600">Loading servers...</span>
    </div>
  {:else}
    <form
      onsubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      class="space-y-6"
    >
      {#if error}
        <Alert color="red" class="mb-4">
          <span class="font-medium">Error:</span>
          {error}
        </Alert>
      {/if}

      <div>
        <Label for="bmlt-server" class="mb-2">BMLT Server</Label>
        <Select id="bmlt-server" items={serverOptions} bind:value={localServer} placeholder="Select a server..." onchange={handleServerChange} required />
        <p class="mt-1 text-sm text-gray-500">Select the BMLT root server to query</p>
      </div>

      {#if localServer}
        <div>
          <Label for="service-bodies" class="mb-2">Service Bodies</Label>
          {#if loadingServiceBodies}
            <div class="flex items-center gap-2 rounded-lg border border-gray-300 p-4">
              <Spinner size="4" />
              <span class="text-sm text-gray-600">Loading service bodies...</span>
            </div>
          {:else if serviceBodies.length > 0}
            <MultiSelect id="service-bodies" items={serviceBodyOptions} bind:value={localServiceBodyIds} placeholder="Select service bodies..." required />
            <p class="mt-1 text-sm text-gray-500">Select one or more service bodies to track ({localServiceBodyIds.length} selected)</p>
          {:else}
            <Alert color="yellow">
              <span class="text-sm">No service bodies found for this server</span>
            </Alert>
          {/if}
        </div>
      {/if}

      <div>
        <Label for="days-passed" class="mb-2">Days to Look Back</Label>
        <Input id="days-passed" type="number" bind:value={localDaysPassed} min="1" max="365" required />
        <p class="mt-1 text-sm text-gray-500">Number of days of history to fetch (1-365)</p>
      </div>

      <div class="flex justify-end gap-3">
        <Button color="alternative" onclick={handleCancel}>Cancel</Button>
        <Button type="submit" style="background-color: #0066B3;" class="text-white hover:opacity-90" disabled={localServiceBodyIds.length === 0}>Apply & Reload</Button>
      </div>
    </form>
  {/if}
</Modal>
