<script lang="ts">
  import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Badge, Modal, Button } from 'flowbite-svelte';
  import { ChevronUpOutline, ChevronDownOutline } from 'flowbite-svelte-icons';
  import type { BmltChange } from '../lib/types';
  import { formatChangeType, getMeetingName } from '../lib/utils/dataProcessing';
  import { generateDiff } from '../lib/utils/diff';
  import { formatDetailsAsList } from '../lib/utils/detailsFormatter';
  import { translations } from '../lib/stores/localization';

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
    <p class="text-lg">{$translations.noChangesFound}</p>
  </div>
{:else}
  <!-- Desktop Table View -->
  <div class="hidden md:block">
    <Table hoverable={true} striped={true}>
      <TableHead>
        <TableHeadCell onclick={() => handleSort('date')} class="cursor-pointer">
          <div class="flex items-center gap-2">
            {$translations.dateAndTime}
            {#if sortColumn === 'date'}
              {#if sortDirection === 'asc'}
                <ChevronUpOutline size="sm" class="text-blue-600 dark:text-blue-400" />
              {:else}
                <ChevronDownOutline size="sm" class="text-blue-600 dark:text-blue-400" />
              {/if}
            {/if}
          </div>
        </TableHeadCell>
        <TableHeadCell onclick={() => handleSort('user')} class="cursor-pointer">
          <div class="flex items-center gap-2">
            {$translations.user}
            {#if sortColumn === 'user'}
              {#if sortDirection === 'asc'}
                <ChevronUpOutline size="sm" class="text-blue-600 dark:text-blue-400" />
              {:else}
                <ChevronDownOutline size="sm" class="text-blue-600 dark:text-blue-400" />
              {/if}
            {/if}
          </div>
        </TableHeadCell>
        <TableHeadCell onclick={() => handleSort('type')} class="cursor-pointer">
          <div class="flex items-center gap-2">
            {$translations.changeType}
            {#if sortColumn === 'type'}
              {#if sortDirection === 'asc'}
                <ChevronUpOutline size="sm" class="text-blue-600 dark:text-blue-400" />
              {:else}
                <ChevronDownOutline size="sm" class="text-blue-600 dark:text-blue-400" />
              {/if}
            {/if}
          </div>
        </TableHeadCell>
        <TableHeadCell onclick={() => handleSort('meeting')} class="cursor-pointer">
          <div class="flex items-center gap-2">
            {$translations.meetingName}
            {#if sortColumn === 'meeting'}
              {#if sortDirection === 'asc'}
                <ChevronUpOutline size="sm" class="text-blue-600 dark:text-blue-400" />
              {:else}
                <ChevronDownOutline size="sm" class="text-blue-600 dark:text-blue-400" />
              {/if}
            {/if}
          </div>
        </TableHeadCell>
        <TableHeadCell onclick={() => handleSort('service')} class="cursor-pointer">
          <div class="flex items-center gap-2">
            {$translations.serviceBody}
            {#if sortColumn === 'service'}
              {#if sortDirection === 'asc'}
                <ChevronUpOutline size="sm" class="text-blue-600 dark:text-blue-400" />
              {:else}
                <ChevronDownOutline size="sm" class="text-blue-600 dark:text-blue-400" />
              {/if}
            {/if}
          </div>
        </TableHeadCell>
        <TableHeadCell>{$translations.changeID}</TableHeadCell>
      </TableHead>
      <TableBody>
        {#each sortedChanges as change (change.change_id)}
          <TableBodyRow class="cursor-pointer" onclick={() => handleRowClick(change)}>
            <TableBodyCell class="text-sm text-gray-600 dark:text-gray-400">{change.date_string}</TableBodyCell>
            <TableBodyCell class="dark:text-gray-100">{change.user_name}</TableBodyCell>
            <TableBodyCell>
              <Badge color={getChangeTypeBadgeColor(change.change_type)} class="capitalize">
                {formatChangeType(change.change_type)}
              </Badge>
            </TableBodyCell>
            <TableBodyCell class="font-medium" style="max-width: 300px; word-wrap: break-word; white-space: normal;">{getMeetingName(change)}</TableBodyCell>
            <TableBodyCell class="font-medium text-blue-600 dark:text-blue-400">{change.service_body_name || 'N/A'}</TableBodyCell>
            <TableBodyCell>{change.change_id}</TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  </div>

  <!-- Mobile Card View -->
  <div class="space-y-4 md:hidden">
    {#each sortedChanges as change (change.change_id)}
      <button
        type="button"
        class="w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        onclick={() => handleRowClick(change)}
      >
        <div class="mb-3 flex items-start justify-between">
          <div class="font-semibold text-gray-900 dark:text-gray-100">{getMeetingName(change)}</div>
          <Badge color={getChangeTypeBadgeColor(change.change_type)} class="ml-2 capitalize">
            {formatChangeType(change.change_type)}
          </Badge>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">{$translations.user}:</span>
            <span class="font-medium text-gray-900 dark:text-gray-100">{change.user_name}</span>
          </div>

          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">{$translations.serviceBody}:</span>
            <span class="font-medium text-blue-600 dark:text-blue-400">{change.service_body_name || 'N/A'}</span>
          </div>

          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">{$translations.date}:</span>
            <span class="text-gray-600 dark:text-gray-300">{change.date_string}</span>
          </div>

          <div class="flex justify-between">
            <span class="text-gray-500 dark:text-gray-400">{$translations.changeID}:</span>
            <span class="text-gray-600 dark:text-gray-300">{change.change_id}</span>
          </div>
        </div>
      </button>
    {/each}
  </div>
{/if}

<!-- Change Details Modal -->
{#if selectedChange}
  <Modal bind:open={showModal} title={$translations.changeDetails} size="lg">
    <div class="space-y-4">
      <!-- Change Info -->
      <div class="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="font-medium text-gray-700 dark:text-gray-300">{$translations.meeting}:</span>
            <span class="ml-2 dark:text-gray-100">{getMeetingName(selectedChange)}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700 dark:text-gray-300">{$translations.changeType}:</span>
            <Badge color={getChangeTypeBadgeColor(selectedChange.change_type)} class="ml-2 capitalize">
              {formatChangeType(selectedChange.change_type)}
            </Badge>
          </div>
          <div>
            <span class="font-medium text-gray-700 dark:text-gray-300">{$translations.user}:</span>
            <span class="ml-2 dark:text-gray-100">{selectedChange.user_name}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700 dark:text-gray-300">{$translations.date}:</span>
            <span class="ml-2 dark:text-gray-100">{selectedChange.date_string}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700 dark:text-gray-300">{$translations.serviceBody}:</span>
            <span class="ml-2 text-blue-600 dark:text-blue-400">{selectedChange.service_body_name || 'N/A'}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700 dark:text-gray-300">{$translations.changeID}:</span>
            <span class="ml-2 dark:text-gray-100">{selectedChange.change_id}</span>
          </div>
        </div>
      </div>

      <!-- Details -->
      {#if selectedChange.details}
        {@const detailItems = formatDetailsAsList(selectedChange.details)}
        <div>
          <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">{$translations.changeSummary}</h3>
          <div class="rounded-lg border border-gray-200 bg-white p-4 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
            {#if detailItems.length > 0}
              <ul class="list-disc space-y-1 pl-5">
                {#each detailItems as item, i (i)}
                  <li>{item}</li>
                {/each}
              </ul>
            {:else}
              <p class="text-gray-500 dark:text-gray-400">{$translations.noDetailsAvailable}</p>
            {/if}
          </div>
        </div>
      {/if}

      {#if getChangeData()}
        {@const changeData = getChangeData()}
        {#if changeData.before && changeData.after}
          <!-- Unified Diff View -->
          <div>
            <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">{$translations.changes}</h3>
            <div class="max-h-96 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <pre class="font-mono text-xs">{#each generateDiff(changeData.before, changeData.after) as line, i (i)}<span
                    class="{line.type === 'added'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : line.type === 'removed'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'text-gray-700 dark:text-gray-300'} block">{line.fullLine}</span
                  >{/each}</pre>
            </div>
          </div>
        {:else}
          <!-- Fallback to separate before/after if only one exists -->
          <div class="grid gap-4 md:grid-cols-2">
            {#if changeData.before}
              <div>
                <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">{$translations.before}</h3>
                <div class="max-h-96 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                  <pre class="text-xs dark:text-gray-100">{JSON.stringify(changeData.before, null, 2)}</pre>
                </div>
              </div>
            {/if}

            {#if changeData.after}
              <div>
                <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">{$translations.after}</h3>
                <div class="max-h-96 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                  <pre class="text-xs dark:text-gray-100">{JSON.stringify(changeData.after, null, 2)}</pre>
                </div>
              </div>
            {/if}
          </div>
        {/if}
      {:else}
        <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">{$translations.noDetailedChangeData}</div>
      {/if}

      <div class="mt-6 flex justify-end">
        <Button color="alternative" onclick={() => (showModal = false)}>{$translations.close}</Button>
      </div>
    </div>
  </Modal>
{/if}
