<script lang="ts">
  import { Input, Label } from 'flowbite-svelte';

  let { value = $bindable() } = $props();
  let isValidTime = $state(false);

  $effect(() => {
    // Validate time format (HH:MM or HH:MM:SS)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    isValidTime = timeRegex.test(value);
  });
</script>

<div class="time-input">
  <Label for="time-input" class="mb-2 block text-lg font-bold text-gray-800">
    HH:MM:SS
    <div class="relative">
      <Input
        id="time-input"
        type="text"
        color={isValidTime ? 'green' : 'red'}
        placeholder="HH:MM:SS"
        bind:value
        class="rounded-lg border-2 border-purple-500 font-mono text-lg focus:ring-2 focus:ring-purple-500"
      />
      <div class="absolute top-1/2 right-3 -translate-y-1/2 transform">
        {#if isValidTime}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 animate-pulse text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        {/if}
      </div>
    </div>
  </Label>
  <p class="mt-2 text-sm text-gray-600">Format: HH:MM or HH:MM:SS (24-hour)</p>
</div>

<style>
  .time-input :global(input) {
    transition: all 0.3s ease;
  }

  .time-input :global(input:focus) {
    transform: scale(1.02);
  }
</style>
