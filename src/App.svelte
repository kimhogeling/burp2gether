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

  let contentVisible = false;
  setTimeout(() => {
    contentVisible = true;
  }, 3000);
</script>

<div class="content">
  <Logo/>

  {#if !supportedAudioMimeType}
    <div class="card">This Browser does not support {audioOptions.join(', ')}  😭</div>
  {/if}

  {#if contentVisible}
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
        <BurpList {user} {friends} {supportedAudioMimeType}/>
        <div class="share" transition:slide>
          <p class="share-text">Share the burping experience:</p>
          <img class="qr"
               alt="QR Code to share the app"
               src="https://firebasestorage.googleapis.com/v0/b/burp2gether.appspot.com/o/burp2gether-qr.jpeg?alt=media&token=0403eb1a-063d-462d-a1b5-1eb30e3933d6"
               width="300"/>
        </div>
      {/if}
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

  .share {
    display: flex;
    align-items: center;
    flex-direction: column;
    margin: 3em 0 0;
  }

  .share-text {
    color: white;
    margin: 0 0 1em;
  }

  .qr {
    border-radius: 0.5em;
  }
</style>
