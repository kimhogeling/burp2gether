<script>
  import Logo from "./lib/Logo.svelte";
  import Login from "./lib/Login.svelte";
  import {getAuth} from "firebase/auth";
  import BurpList from "./lib/BurpList.svelte";
  import Friends from "./lib/Friends.svelte";
  import {slide} from 'svelte/transition';

  let loggedIn = false;
  let user;
  let friends;
  let loadingUser = false;

  const audioOptions = ['audio/webm', 'audio/mp4'];
  const supportedAudioMimeType = audioOptions.find(MediaRecorder.isTypeSupported) || null;

  if (false || supportedAudioMimeType) {
    loadingUser = true;
    getAuth().onAuthStateChanged(u => {
      loadingUser = false;
      loggedIn = !!u;
    })
  }
</script>

<div class="content">
  <Logo/>

  {#if !supportedAudioMimeType}
    <div class="card">This Browser does not support {audioOptions.join(', ')}  😭</div>
  {/if}

  {#if supportedAudioMimeType}
    {#if loadingUser}
      <div class="card" transition:slide>
        Checking if you're logged in..
      </div>
    {/if}

    {#if !loadingUser && !user}
      <Login bind:user/>
    {/if}

    {#if loggedIn}
      <Friends bind:friends {user}/>
      <BurpList {user} {friends} {supportedAudioMimeType} />
    {/if}
  {/if}
</div>

<style>
  .content {
    width: 320px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
