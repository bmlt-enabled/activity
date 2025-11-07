<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';
  import { onMount } from 'svelte';
  import { Button, Modal, Label, Input, Select, MultiSelect, Spinner, Alert, Badge } from 'flowbite-svelte';
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

  const SERVICE_BODY_TYPE_GROUPS = [
    { type: 'ZF', name: 'Zonal Forum', color: 'purple' },
    { type: 'RS', name: 'Regional Service', color: 'blue' },
    { type: 'AS', name: 'Area Service', color: 'green' },
    { type: 'MA', name: 'Metro Area', color: 'cyan' },
    { type: 'GR', name: 'Group', color: 'yellow' }
  ];

  type BadgeColor =
    | 'green'
    | 'red'
    | 'blue'
    | 'purple'
    | 'yellow'
    | 'gray'
    | 'primary'
    | 'secondary'
    | 'emerald'
    | 'orange'
    | 'teal'
    | 'cyan'
    | 'sky'
    | 'indigo'
    | 'lime'
    | 'amber'
    | 'violet'
    | 'fuchsia'
    | 'pink'
    | 'rose';

  function createGroupedServiceBodyItems(bodies: ServiceBody[]) {
    const bodiesByType = bodies.reduce(
      (groups, body) => {
        (groups[body.type] ??= []).push(body);
        return groups;
      },
      {} as Record<string, ServiceBody[]>
    );

    const createGroupHeader = (type: string, name: string, color: string) => ({
      value: `_group_${type}_`,
      name: `━━━ ${name.toUpperCase()} (${type}) ━━━`,
      disabled: true,
      class: `group-header group-header-${color}`
    });

    const bodyItem = (body: ServiceBody) => ({
      value: body.id,
      name: `  ${body.name} (${body.type})`,
      type: body.type
    });

    const sortAlphabetically = (items: any[]) => items.sort((a, b) => a.name.localeCompare(b.name));

    const knownGroupItems = SERVICE_BODY_TYPE_GROUPS.map((group) => {
      const bodiesInGroup = bodiesByType[group.type];
      if (!bodiesInGroup?.length) return null;
      const header = createGroupHeader(group.type, group.name, group.color);
      const items = sortAlphabetically(bodiesInGroup.map(bodyItem));
      return [header, ...items];
    })
      .filter(Boolean)
      .flat();

    const knownTypes = new SvelteSet(SERVICE_BODY_TYPE_GROUPS.map((g) => g.type));
    const unknownTypes = Object.keys(bodiesByType).filter((type) => !knownTypes.has(type));

    const otherGroupItems =
      unknownTypes.length > 0
        ? [createGroupHeader('other', 'Other', 'gray'), ...sortAlphabetically(unknownTypes.flatMap((type) => bodiesByType[type]).map((body) => bodyItem({ ...body, type: body.type || 'Other' })))]
        : [];

    return [...knownGroupItems, ...otherGroupItems];
  }

  function getBadgeColor(bodyId: string, bodyLookup: Record<string, ServiceBody>): BadgeColor {
    const body = bodyLookup[bodyId];
    if (!body) return 'gray';

    const group = SERVICE_BODY_TYPE_GROUPS.find((g) => g.type === body.type);
    return (group?.color ?? 'gray') as BadgeColor;
  }

  const serverOptions = $derived(
    [...servers]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((server) => ({
        value: server.url,
        name: server.name
      }))
  );

  const serviceBodyOptions = $derived(createGroupedServiceBodyItems(serviceBodies));

  const serviceBodyLookup = $derived(Object.fromEntries(serviceBodies.map((sb) => [sb.id, sb])));

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
            <MultiSelect
              id="service-bodies"
              items={serviceBodyOptions}
              bind:value={localServiceBodyIds}
              placeholder="Select service bodies..."
              class="hide-close-button bg-gray-50 dark:bg-gray-600"
              required
            >
              {#snippet children({ item, clear })}
                <Badge rounded color={getBadgeColor(String(item.value), serviceBodyLookup)} dismissable params={{ duration: 100 }} onclose={clear}>
                  {item.name}
                </Badge>
              {/snippet}
            </MultiSelect>
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

<style>
  :global(#service-bodies div[class*='opacity-50']) {
    font-weight: bold !important;
    font-size: 0.925rem !important;
    background-color: rgb(243, 244, 246) !important; /* gray-100 */
    color: rgb(31, 41, 55) !important; /* gray-800 */
  }

  @media (prefers-color-scheme: dark) {
    :global(#service-bodies div[class*='opacity-50']) {
      background-color: rgb(17, 24, 39) !important; /* gray-900 */
      color: rgb(209, 213, 219) !important; /* gray-300 */
    }
  }

  :global(.group-header) {
    font-weight: 600 !important;
    font-size: 0.75rem !important;
    letter-spacing: 0.05em !important;
    padding: 0.5rem 0.75rem !important;
    margin: 0.25rem 0 !important;
    cursor: default !important;
    pointer-events: none !important;
  }

  :global(.group-header-purple) {
    background-color: rgb(233 213 255) !important;
    color: rgb(107 33 168) !important;
  }

  :global(.group-header-blue) {
    background-color: rgb(219 234 254) !important;
    color: rgb(29 78 216) !important;
  }

  :global(.group-header-green) {
    background-color: rgb(220 252 231) !important;
    color: rgb(21 128 61) !important;
  }

  :global(.group-header-cyan) {
    background-color: rgb(207 250 254) !important;
    color: rgb(14 116 144) !important;
  }

  :global(.group-header-yellow) {
    background-color: rgb(254 249 195) !important;
    color: rgb(161 98 7) !important;
  }

  :global(.group-header-gray) {
    background-color: rgb(243 244 246) !important;
    color: rgb(75 85 99) !important;
  }

  :global(.dark .group-header-purple) {
    background-color: rgb(88 28 135) !important;
    color: rgb(243 232 255) !important;
  }

  :global(.dark .group-header-blue) {
    background-color: rgb(30 64 175) !important;
    color: rgb(219 234 254) !important;
  }

  :global(.dark .group-header-green) {
    background-color: rgb(22 101 52) !important;
    color: rgb(220 252 231) !important;
  }

  :global(.dark .group-header-cyan) {
    background-color: rgb(14 116 144) !important;
    color: rgb(207 250 254) !important;
  }

  :global(.dark .group-header-yellow) {
    background-color: rgb(161 98 7) !important;
    color: rgb(254 249 195) !important;
  }

  :global(.dark .group-header-gray) {
    background-color: rgb(55 65 81) !important;
    color: rgb(229 231 235) !important;
  }
</style>
