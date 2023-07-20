<script>
  import { slide } from 'svelte/transition';
  import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
</script>

<div class='card' transition:slide>
  <p>Welcome to burp2gether!</p>
  <p>The place to share burps together with your friends.</p>
  <p>Login to start burping together.</p>
  <button on:click={() => signInWithPopup(getAuth(), new GoogleAuthProvider())}>
    Google Login
  </button>
  <p>(Other Login options will come in the future)</p>
</div>

<style>
  .card {
    text-align: center;
  }

  p {
    margin: 1em;
  }
</style>
