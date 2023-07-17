<script>
  import {fly} from 'svelte/transition';

  let logoVisible = false;

  setTimeout(() => {
    logoVisible = true
  }, 1)
</script>
{#if logoVisible}
  <div class="logo" in:fly="{{ y: -200, duration: 3000 }}">
    <span>burp</span>
    <span class="logo-colored-letter">2</span>
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
