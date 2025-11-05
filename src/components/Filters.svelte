<script lang="ts">
  import { Input, Label, Select } from 'flowbite-svelte';
  import type { ChangeType } from '../lib/types';

  interface Props {
    searchTerm: string;
    selectedType: ChangeType;
    selectedUser: string;
    users: string[];
  }

  let { searchTerm = $bindable(), selectedType = $bindable(), selectedUser = $bindable(), users }: Props = $props();

  const changeTypes = [
    { value: '', name: 'All Types' },
    { value: 'change', name: 'Changes' },
    { value: 'new', name: 'New' },
    { value: 'delete', name: 'Deleted' },
    { value: 'rollback', name: 'Rollback' }
  ];

  const userOptions = $derived([{ value: '', name: 'All Users' }, ...users.map((user) => ({ value: user, name: user }))]);
</script>

<div class="flex flex-wrap items-center gap-4">
  <div class="min-w-[250px] flex-1">
    <Label for="search" class="mb-2">Search</Label>
    <Input id="search" type="text" placeholder="Search by meeting name, user, or change type..." bind:value={searchTerm} />
  </div>

  <div class="min-w-[150px]">
    <Label for="type-filter" class="mb-2">Change Type</Label>
    <Select id="type-filter" items={changeTypes} bind:value={selectedType} />
  </div>

  <div class="min-w-[150px]">
    <Label for="user-filter" class="mb-2">User</Label>
    <Select id="user-filter" items={userOptions} bind:value={selectedUser} />
  </div>
</div>
