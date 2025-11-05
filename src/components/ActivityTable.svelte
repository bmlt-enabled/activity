<script lang="ts">
  import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Badge, Modal, Button } from 'flowbite-svelte';
  import { ChevronUpOutline, ChevronDownOutline } from 'flowbite-svelte-icons';
  import type { BmltChange } from '../lib/types';
  import { formatChangeType, getMeetingName } from '../lib/utils/dataProcessing';
  import { generateDiff } from '../lib/utils/diff';

  interface Props {
    changes: BmltChange[];
  }

  let { changes }: Props = $props();

  type SortColumn = 'date' | 'user' | 'type' | 'meeting' | 'service';
  type SortDirection = 'asc' | 'desc';

  let sortColumn = $state<SortColumn>('date');
  let sortDirection = $state<SortDirection>('desc');
  let selectedChange = $state<BmltChange | null>(null);
  let showModal = $state(false);

  function handleRowClick(change: BmltChange) {
    selectedChange = change;
    showModal = true;
  }

  function getChangeData() {
    if (!selectedChange?.json_data) return null;

    try {
      if (typeof selectedChange.json_data === 'string') {
        return JSON.parse(selectedChange.json_data);
      }
      return selectedChange.json_data;
    } catch (error) {
      console.error('Failed to parse json_data:', error);
      return null;
    }
  }

  const sortedChanges = $derived.by(() => {
    const sorted = [...changes];

    sorted.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortColumn) {
        case 'date':
          aVal = a.date_int;
          bVal = b.date_int;
          break;
        case 'user':
          aVal = a.user_name.toLowerCase();
          bVal = b.user_name.toLowerCase();
          break;
        case 'type':
          aVal = formatChangeType(a.change_type);
          bVal = formatChangeType(b.change_type);
          break;
        case 'meeting':
          aVal = getMeetingName(a).toLowerCase();
          bVal = getMeetingName(b).toLowerCase();
          break;
        case 'service':
          aVal = (a.service_body_name || '').toLowerCase();
          bVal = (b.service_body_name || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  });

  function handleSort(column: SortColumn) {
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      sortDirection = 'asc';
    }
  }

  function getChangeTypeBadgeColor(changeType: string): 'blue' | 'green' | 'red' | 'yellow' {
    const type = formatChangeType(changeType);
    switch (type) {
      case 'change':
        return 'blue';
      case 'new':
        return 'green';
      case 'delete':
        return 'red';
      case 'rollback':
        return 'yellow';
      default:
        return 'blue';
    }
  }
</script>

{#if sortedChanges.length === 0}
  <div class="py-16 text-center text-gray-500">
    <p class="text-lg">No changes found for the specified date range.</p>
  </div>
{:else}
  <!-- Desktop Table View -->
  <div class="hidden md:block">
    <Table hoverable={true} striped={true}>
      <TableHead>
        <TableHeadCell onclick={() => handleSort('date')} class="cursor-pointer">
          <div class="flex items-center gap-2">
            Date & Time
            {#if sortColumn === 'date'}
              {#if sortDirection === 'asc'}
                <ChevronUpOutline size="sm" style="color: #0066B3;" />
              {:else}
                <ChevronDownOutline size="sm" style="color: #0066B3;" />
              {/if}
            {/if}
          </div>
        </TableHeadCell>
        <TableHeadCell onclick={() => handleSort('user')} class="cursor-pointer">
          <div class="flex items-center gap-2">
            User
            {#if sortColumn === 'user'}
              {#if sortDirection === 'asc'}
                <ChevronUpOutline size="sm" style="color: #0066B3;" />
              {:else}
                <ChevronDownOutline size="sm" style="color: #0066B3;" />
              {/if}
            {/if}
          </div>
        </TableHeadCell>
        <TableHeadCell onclick={() => handleSort('type')} class="cursor-pointer">
          <div class="flex items-center gap-2">
            Change Type
            {#if sortColumn === 'type'}
              {#if sortDirection === 'asc'}
                <ChevronUpOutline size="sm" style="color: #0066B3;" />
              {:else}
                <ChevronDownOutline size="sm" style="color: #0066B3;" />
              {/if}
            {/if}
          </div>
        </TableHeadCell>
        <TableHeadCell onclick={() => handleSort('meeting')} class="cursor-pointer">
          <div class="flex items-center gap-2">
            Meeting Name
            {#if sortColumn === 'meeting'}
              {#if sortDirection === 'asc'}
                <ChevronUpOutline size="sm" style="color: #0066B3;" />
              {:else}
                <ChevronDownOutline size="sm" style="color: #0066B3;" />
              {/if}
            {/if}
          </div>
        </TableHeadCell>
        <TableHeadCell onclick={() => handleSort('service')} class="cursor-pointer">
          <div class="flex items-center gap-2">
            Service Body
            {#if sortColumn === 'service'}
              {#if sortDirection === 'asc'}
                <ChevronUpOutline size="sm" style="color: #0066B3;" />
              {:else}
                <ChevronDownOutline size="sm" style="color: #0066B3;" />
              {/if}
            {/if}
          </div>
        </TableHeadCell>
        <TableHeadCell>Change ID</TableHeadCell>
      </TableHead>
      <TableBody>
        {#each sortedChanges as change (change.change_id)}
          <TableBodyRow class="cursor-pointer" onclick={() => handleRowClick(change)}>
            <TableBodyCell class="text-sm text-gray-600">{change.date_string}</TableBodyCell>
            <TableBodyCell>{change.user_name}</TableBodyCell>
            <TableBodyCell>
              <Badge color={getChangeTypeBadgeColor(change.change_type)} class="capitalize">
                {formatChangeType(change.change_type)}
              </Badge>
            </TableBodyCell>
            <TableBodyCell class="font-medium" style="max-width: 300px; word-wrap: break-word; white-space: normal;">{getMeetingName(change)}</TableBodyCell>
            <TableBodyCell class="font-medium" style="color: #0066B3;">{change.service_body_name || 'N/A'}</TableBodyCell>
            <TableBodyCell>{change.change_id}</TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  </div>

  <!-- Mobile Card View -->
  <div class="space-y-4 md:hidden">
    {#each sortedChanges as change (change.change_id)}
      <button type="button" class="w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm hover:shadow-md" onclick={() => handleRowClick(change)}>
        <div class="mb-3 flex items-start justify-between">
          <div class="font-semibold text-gray-900">{getMeetingName(change)}</div>
          <Badge color={getChangeTypeBadgeColor(change.change_type)} class="ml-2 capitalize">
            {formatChangeType(change.change_type)}
          </Badge>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">User:</span>
            <span class="font-medium text-gray-900">{change.user_name}</span>
          </div>

          <div class="flex justify-between">
            <span class="text-gray-500">Service Body:</span>
            <span class="font-medium" style="color: #0066B3;">{change.service_body_name || 'N/A'}</span>
          </div>

          <div class="flex justify-between">
            <span class="text-gray-500">Date:</span>
            <span class="text-gray-600">{change.date_string}</span>
          </div>

          <div class="flex justify-between">
            <span class="text-gray-500">Change ID:</span>
            <span class="text-gray-600">{change.change_id}</span>
          </div>
        </div>
      </button>
    {/each}
  </div>
{/if}

<!-- Change Details Modal -->
{#if selectedChange}
  <Modal bind:open={showModal} title="Change Details" size="lg">
    <div class="space-y-4">
      <!-- Change Info -->
      <div class="rounded-lg bg-gray-50 p-4">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="font-medium text-gray-700">Meeting:</span>
            <span class="ml-2">{getMeetingName(selectedChange)}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">Change Type:</span>
            <Badge color={getChangeTypeBadgeColor(selectedChange.change_type)} class="ml-2 capitalize">
              {formatChangeType(selectedChange.change_type)}
            </Badge>
          </div>
          <div>
            <span class="font-medium text-gray-700">User:</span>
            <span class="ml-2">{selectedChange.user_name}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">Date:</span>
            <span class="ml-2">{selectedChange.date_string}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">Service Body:</span>
            <span class="ml-2" style="color: #0066B3;">{selectedChange.service_body_name || 'N/A'}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">Change ID:</span>
            <span class="ml-2">{selectedChange.change_id}</span>
          </div>
        </div>
      </div>

      <!-- Details -->
      {#if selectedChange.details}
        <div>
          <h3 class="mb-2 text-lg font-semibold text-gray-900">Change Summary</h3>
          <div class="rounded-lg border border-gray-200 bg-white p-4 text-sm">
            {selectedChange.details}
          </div>
        </div>
      {/if}

      {#if getChangeData()}
        {@const changeData = getChangeData()}
        {#if changeData.before && changeData.after}
          <!-- Unified Diff View -->
          <div>
            <h3 class="mb-2 text-lg font-semibold text-gray-900">Changes</h3>
            <div class="max-h-96 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
              <pre class="font-mono text-xs">{#each generateDiff(changeData.before, changeData.after) as line, i (i)}<span
                    class="{line.type === 'added' ? 'bg-green-100 text-green-800' : line.type === 'removed' ? 'bg-red-100 text-red-800' : 'text-gray-700'} block">{line.fullLine}</span
                  >{/each}</pre>
            </div>
          </div>
        {:else}
          <!-- Fallback to separate before/after if only one exists -->
          <div class="grid gap-4 md:grid-cols-2">
            {#if changeData.before}
              <div>
                <h3 class="mb-2 text-lg font-semibold text-gray-900">Before</h3>
                <div class="max-h-96 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <pre class="text-xs">{JSON.stringify(changeData.before, null, 2)}</pre>
                </div>
              </div>
            {/if}

            {#if changeData.after}
              <div>
                <h3 class="mb-2 text-lg font-semibold text-gray-900">After</h3>
                <div class="max-h-96 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <pre class="text-xs">{JSON.stringify(changeData.after, null, 2)}</pre>
                </div>
              </div>
            {/if}
          </div>
        {/if}
      {:else}
        <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">No detailed change data available for this entry.</div>
      {/if}

      <div class="mt-6 flex justify-end">
        <Button color="alternative" onclick={() => (showModal = false)}>Close</Button>
      </div>
    </div>
  </Modal>
{/if}
