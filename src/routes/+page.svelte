<script>
  import Logo from "../lib/Logo.svelte";
  import Login from "../lib/Login.svelte";
  import {getAuth} from "firebase/auth";
  import BurpList from "../lib/BurpList.svelte";
  import Users from "../lib/Users.svelte";

  let loggedIn = false;
  let user;
  let users;
  let loadingUser = false;

  const audioOptions = ['audio/webm', 'audio/mp4'];
  const supportedAudioMimeType = audioOptions.find(MediaRecorder.isTypeSupported) || null;

  if (supportedAudioMimeType) {
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
      <div class="card">Looking for your login..</div>
    {/if}

    {#if !loadingUser && !user}
      <Login bind:user/>
    {/if}

    {#if loggedIn && user && !loadingUser }
      <Users bind:users {user}/>
      <BurpList {user} {users} {supportedAudioMimeType}/>
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
