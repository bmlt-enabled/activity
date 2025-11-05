<script lang="ts">
  import { Card } from 'flowbite-svelte';
  import type { ChangeTypeStats } from '../lib/types';

  interface Props {
    totalChanges: number;
    activeUsers: number;
    changeTypes: ChangeTypeStats;
  }

  let { totalChanges, activeUsers, changeTypes }: Props = $props();
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
  <Card>
    <div class="text-sm font-medium tracking-wide text-gray-500 uppercase">Total Changes</div>
    <div class="mt-2 text-3xl font-bold" style="color: #0066B3;">{totalChanges.toLocaleString()}</div>
  </Card>

  <Card>
    <div class="text-sm font-medium tracking-wide text-gray-500 uppercase">Active Users</div>
    <div class="mt-2 text-3xl font-bold" style="color: #0066B3;">{activeUsers}</div>
  </Card>

  <Card>
    <div class="text-sm font-medium tracking-wide text-gray-500 uppercase">Edits</div>
    <div class="mt-2 text-3xl font-bold" style="color: #0066B3;">
      {changeTypes['comdef_change_type_change'] || 0}
    </div>
  </Card>

  <Card>
    <div class="text-sm font-medium tracking-wide text-gray-500 uppercase">New Meetings</div>
    <div class="mt-2 text-3xl font-bold" style="color: #0066B3;">
      {changeTypes['comdef_change_type_new'] || 0}
    </div>
  </Card>

  <Card>
    <div class="text-sm font-medium tracking-wide text-gray-500 uppercase">Deletions</div>
    <div class="mt-2 text-3xl font-bold" style="color: #0066B3;">
      {changeTypes['comdef_change_type_delete'] || 0}
    </div>
  </Card>
</div>
