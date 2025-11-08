<script lang="ts">
  import { Card } from 'flowbite-svelte';
  import type { ChangeTypeStats } from '../lib/types';
  import { translations } from '../lib/stores/localization';

  interface Props {
    totalChanges: number;
    activeUsers: number;
    changeTypes: ChangeTypeStats;
  }

  let { totalChanges, activeUsers, changeTypes }: Props = $props();
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
  <Card class="flex flex-col justify-center p-6">
    <div class="text-center text-sm font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">{$translations.totalChanges}</div>
    <div class="mt-3 text-center text-3xl font-bold text-blue-600 dark:text-blue-400">{totalChanges.toLocaleString()}</div>
  </Card>

  <Card class="flex flex-col justify-center p-6">
    <div class="text-center text-sm font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">{$translations.activeUsers}</div>
    <div class="mt-3 text-center text-3xl font-bold text-blue-600 dark:text-blue-400">{activeUsers}</div>
  </Card>

  <Card class="flex flex-col justify-center p-6">
    <div class="text-center text-sm font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">{$translations.changesEdits}</div>
    <div class="mt-3 text-center text-3xl font-bold text-blue-600 dark:text-blue-400">
      {changeTypes['comdef_change_type_change'] || 0}
    </div>
  </Card>

  <Card class="flex flex-col justify-center p-6">
    <div class="text-center text-sm font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">{$translations.newMeetings}</div>
    <div class="mt-3 text-center text-3xl font-bold text-blue-600 dark:text-blue-400">
      {changeTypes['comdef_change_type_new'] || 0}
    </div>
  </Card>

  <Card class="flex flex-col justify-center p-6">
    <div class="text-center text-sm font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">{$translations.deletions}</div>
    <div class="mt-3 text-center text-3xl font-bold text-blue-600 dark:text-blue-400">
      {changeTypes['comdef_change_type_delete'] || 0}
    </div>
  </Card>
</div>
