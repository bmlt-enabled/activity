<script lang="ts">
  import type { Snippet } from 'svelte';
  /*
    This is a fork of the flowbite-svelte DarkMode control, ported to Svelte 5 by copying
    relevant bits from the latest DarkMode control. There is only one other meaningful
    change, the guard statement around the usage of window.matchMedia. Without this, the
    tests fail with 'TypeError: window.matchMedia is not a function'. If you google this
    error, StackOverflow and GitHub Issues tell you to mock the function in setup.ts. This
    does not seem to work with vitest, because vitest uses jsdom internally, and jsdom
    constructs its own window object which does not seem mockable. All other changes were
    just to make TypeScript happy.
  */
  import { twMerge } from 'tailwind-merge';

  interface Props {
    class: string;
    lightIcon?: Snippet;
    darkIcon?: Snippet;
    size?: string;
    ariaLabel?: string;
  }
  let { class: className, lightIcon, darkIcon, size = 'md', ariaLabel = 'Dark mode' }: Props = $props();

  const btnClass = 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100 focus:outline-none rounded-lg transition-colors p-2';
  const sizes: Record<string, string> = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  const toggleTheme = (ev: any) => {
    const target = ev.target;
    const isDark = target.ownerDocument.documentElement.classList.toggle('dark');
    if (target.ownerDocument === document)
      // we are NOT in the iFrame
      localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
  };
</script>

<button onclick={toggleTheme} aria-label={ariaLabel} type="button" class={twMerge(btnClass, className)}>
  <span class="hidden dark:block">
    {#if lightIcon}
      {@render lightIcon()}
    {:else}
      <svg role="img" aria-label="Light mode" class={sizes[size]} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1
    0 100-2H3a1 1 0 000 2h1z"
          fill-rule="evenodd"
          clip-rule="evenodd"
        />
      </svg>
    {/if}
  </span>
  <span class="block dark:hidden">
    {#if darkIcon}
      {@render darkIcon()}
    {:else}
      <svg role="img" aria-label="Dark mode" class={sizes[size]} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
    {/if}
  </span>
</button>
