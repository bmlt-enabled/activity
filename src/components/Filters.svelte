<script lang="ts">
  import { Input, Label, Select } from 'flowbite-svelte';
  import type { ChangeType } from '../lib/types';
  import { translations } from '../lib/stores/localization';

  interface Props {
    searchTerm: string;
    selectedType: ChangeType;
    selectedUser: string;
    users: string[];
  }

  let { searchTerm = $bindable(), selectedType = $bindable(), selectedUser = $bindable(), users }: Props = $props();

  const changeTypes = $derived([
    { value: '', name: $translations.allTypes },
    { value: 'change', name: $translations.changes },
    { value: 'new', name: $translations.new },
    { value: 'delete', name: $translations.delete },
    { value: 'rollback', name: $translations.rollback }
  ]);

  const userOptions = $derived([{ value: '', name: $translations.allUsers }, ...users.map((user) => ({ value: user, name: user }))]);
</script>

<div class="flex flex-wrap items-center gap-4">
  <div class="min-w-[250px] flex-1">
    <Label for="search" class="mb-2">{$translations.search}</Label>
    <Input id="search" type="text" placeholder={$translations.searchByMeetingName} bind:value={searchTerm} />
  </div>

  <div class="min-w-[150px]">
    <Label for="type-filter" class="mb-2">{$translations.changeType}</Label>
    <Select id="type-filter" items={changeTypes} bind:value={selectedType} placeholder={$translations.chooseOption} />
  </div>

  <div class="min-w-[150px]">
    <Label for="user-filter" class="mb-2">{$translations.user}</Label>
    <Select id="user-filter" items={userOptions} bind:value={selectedUser} placeholder={$translations.chooseOption} />
  </div>
</div>
