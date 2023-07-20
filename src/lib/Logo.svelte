<script>
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';

  let logoVisible = false;
  onMount(() => logoVisible = true);
</script>

{#if logoVisible}
  <div class='logo' in:fly='{{ y: -100, duration: 4000 }}'>
    <span>burp</span>
    <span class='logo-colored-letter'>2</span>
    <span>gether</span>
  </div>
{/if}

<style>
  .logo {
    padding: .5em 0 .2em;
    display: flex;
    justify-content: center;
    width: 100%;
    color: var(--color-two);
    font-size: 3em;
    align-items: center;
    margin: 0;
  }

  .logo .logo-colored-letter {
    transform: rotate(4deg) scale(1.5) translate(-.02em, .03em);
    color: var(--color-four);
  }
</style>
