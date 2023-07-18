<script>
  import Logo from "../lib/Logo.svelte";
  import Login from "../lib/Login.svelte";
  import BurpList from "../lib/BurpList.svelte";
  import {user, users} from '../lib/store-users.js';

  // Check if the browser supports any of the needed audio formats
  const audioOptions = ["audio/webm", "audio/mp4"];
  const supportedAudioMimeType = audioOptions.find(MediaRecorder.isTypeSupported) || null;
</script>

<div class="content">
  <Logo/>

  {#if !supportedAudioMimeType}
    <div class="card">
      This Browser does not support {audioOptions.join(", ")} 😭
    </div>
  {:else}
    <!-- null means a user is identified as not logged in -->
    {#if $user === null}
      <Login/>
    {:else if ($users) }
      <BurpList {supportedAudioMimeType}/>
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
