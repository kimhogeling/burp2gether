<script>
  import {fly} from 'svelte/transition';

  let logoVisible = false;
  let sloganVisible = false;

  setTimeout(() => {
    logoVisible = true
  }, 1)
  setTimeout(() => {
    sloganVisible = true
  }, 1)
</script>
{#if logoVisible}
  <div class="logo" in:fly="{{ y: 300, duration: 2000 }}">
    <span>burp</span>
    <span class="logo-colored-letter">2</span>
    <span>gether</span>
  </div>
{/if}
{#if sloganVisible}
  <div class="slogan" in:fly="{{ x: 200, duration: 700, delay: 1300 }}">
    and <span class="logo-colored-letter">4</span> each other!
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


  .slogan {
    /*font-family: Caveat, serif;*/
    /*font-family: 'Luckiest Guy';*/
    /*font-family: 'Press Start 2P';*/
    color: var(--color-four);
    /*font-size: 2.5rem;*/
    font-size: 2rem;
    text-align: center;
    text-shadow: black 0 0 1px;
    transform: rotate(-3deg);
    margin: -.4em 0 .5em 0;
  }

  .logo .logo-colored-letter {
    transform: rotate(4deg) scale(1.5) translate(-.02em, .03em);
    color: var(--color-four);
  }

  .slogan .logo-colored-letter {
    color: var(--color-two);
  }
</style>
