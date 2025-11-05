<script lang="ts">
  import CharacterSelector from './CharacterSelector.svelte';
  import TimeInput from './TimeInput.svelte';

  let selectedCharacter = $state('');
  let inputTime = $state('');
  let count = $state(0);
  let isTimeTraveling = $state(false);
  let showLightning = $state(false);

  const increment = () => {
    count += 1;
    if (count === 88) {
      isTimeTraveling = true;
      showLightning = true;
      setTimeout(() => {
        showLightning = false;
      }, 3000);
    }
    if (count > 88) {
      isTimeTraveling = false;
    }
  };
</script>

<div class="relative mx-auto mt-10 max-w-sm overflow-hidden rounded-lg bg-white shadow-xl transition-shadow duration-300 hover:shadow-2xl">
  {#if showLightning}
    <div class="animate-lightning absolute inset-0 z-10 bg-white opacity-80"></div>
  {/if}

  <div class="px-6 py-6">
    <div class="mb-4 text-2xl font-bold text-gray-800 transition-all duration-500 {isTimeTraveling ? 'animate-bounce text-blue-600' : ''}">
      {isTimeTraveling ? 'Great Scott!' : 'Great Scott!'}
    </div>
    <p class="mb-4 text-base text-gray-600">
      {isTimeTraveling ? '1.21 GIGAWATTS! Time travel achieved!' : 'Click the button below to increase your gigawatt power level.'}
    </p>
    <button
      onclick={increment}
      class="flex w-full transform items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 font-bold text-white shadow-md transition-all duration-200 hover:scale-105 hover:from-purple-600 hover:to-pink-600 {isTimeTraveling
        ? 'animate-pulse'
        : ''}"
    >
      <span class="mr-2">Count is {count}</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" class="h-5 w-5 shrink-0 {isTimeTraveling ? 'animate-spin' : ''}" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>

  <div class="bg-gray-50 px-6 pt-4 pb-6">
    <div class="space-y-6">
      <CharacterSelector bind:selectedCharacter />
      <TimeInput bind:value={inputTime} />
    </div>
  </div>
</div>

<style>
  @keyframes lightning {
    0%,
    100% {
      opacity: 0;
    }
    10%,
    30%,
    50%,
    70%,
    90% {
      opacity: 0.8;
    }
    20%,
    40%,
    60%,
    80% {
      opacity: 0;
    }
  }

  .animate-lightning {
    animation: lightning 0.5s linear infinite;
  }
</style>
