<script lang="ts">
  import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Badge } from 'flowbite-svelte';
  import { ChevronUpOutline, ChevronDownOutline } from 'flowbite-svelte-icons';
  import type { BmltChange } from '../lib/types';
  import { formatChangeType } from '../lib/utils/dataProcessing';

  interface Props {
    changes: BmltChange[];
  }

  let { changes }: Props = $props();

  type SortColumn = 'date' | 'user' | 'type' | 'meeting' | 'service';
  type SortDirection = 'asc' | 'desc';

  let sortColumn = $state<SortColumn>('date');
  let sortDirection = $state<SortDirection>('desc');

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
          aVal = (a.meeting_name || '').toLowerCase();
          bVal = (b.meeting_name || '').toLowerCase();
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
          <TableBodyRow>
            <TableBodyCell class="text-sm text-gray-600">{change.date_string}</TableBodyCell>
            <TableBodyCell>{change.user_name}</TableBodyCell>
            <TableBodyCell>
              <Badge color={getChangeTypeBadgeColor(change.change_type)} class="capitalize">
                {formatChangeType(change.change_type)}
              </Badge>
            </TableBodyCell>
            <TableBodyCell class="font-medium" style="max-width: 300px; word-wrap: break-word; white-space: normal;">{change.meeting_name || '(deleted)'}</TableBodyCell>
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
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div class="mb-3 flex items-start justify-between">
          <div class="font-semibold text-gray-900">{change.meeting_name || '(deleted)'}</div>
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
      </div>
    {/each}
  </div>
{/if}
