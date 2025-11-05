<script lang="ts">
  import { Select, Label } from 'flowbite-svelte';

  let { selectedCharacter = $bindable() } = $props();

  const characters = [
    { value: 'mcfly', name: 'Marty McFly', quote: 'This is heavy!' },
    { value: 'doc', name: 'Emmett "Doc" Brown', quote: "Roads? Where we're going, we don't need roads." },
    { value: 'biff', name: 'Biff Tannen', quote: 'Hello! Hello! Anybody home?' },
    { value: 'lorraine', name: 'Lorraine Baines', quote: "When I'm around you, I don't know how to act." },
    { value: 'george', name: 'George McFly', quote: 'If you put your mind to it, you can accomplish anything.' }
  ];

  let characterQuote = $state('');

  $effect(() => {
    if (selectedCharacter) {
      const character = characters.find((c) => c.value === selectedCharacter);
      characterQuote = character?.quote || '';
    }
  });
</script>

<div class="character-selector">
  <Label class="mb-2 block text-lg font-bold text-gray-800">
    <Select
      class="mt-2 rounded-lg border-2 border-purple-500 focus:ring-2 focus:ring-purple-500"
      placeholder="Choose character ..."
      items={characters}
      bind:value={selectedCharacter}
      aria-label="Choose your character..."
    />
  </Label>
  {#if characterQuote}
    <div class="mt-2 transform rounded-lg bg-blue-100 p-3 text-gray-700 italic transition-all duration-300 hover:scale-105">
      "{characterQuote}"
    </div>
  {/if}
</div>

<style>
  .character-selector :global(select) {
    background-image: linear-gradient(to right, rgba(147, 51, 234, 0.1), rgba(236, 72, 153, 0.1));
  }
</style>
