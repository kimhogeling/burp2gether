<script>
  import { connectionStatus, STATUS } from '$lib/store-online.js';
  import { audioOptions, supportedAudioMimeType } from '$lib/store-burps.js';
  import { authUser, users } from '$lib/store-users.js';
  import Logo from '$lib/Logo.svelte';
  import Login from '$lib/Login.svelte';
  import BurpList from '$lib/BurpList.svelte';

  $: {
    if ($connectionStatus === STATUS.RECONNECTED) {
      location.reload();
    }
  }
</script>

<div class='content'>
  <Logo />

  {#if $connectionStatus !== STATUS.ONLINE}
    <div class='card'>
      {
        $connectionStatus === STATUS.OFFLINE
          ? '🚫 You seem to be offline'
          : $connectionStatus === STATUS.DISCONNECTED
            ? '☠️ You seem to have lost internet connection'
            : $connectionStatus === STATUS.RECONNECTED
              ? '🥳 Connection is back! Refreshing the page...'
              : ''
      }
    </div>
  {/if}

  {#if !supportedAudioMimeType}
    <div class='card'>
      🚫 This Browser does not support {audioOptions.join(", ")}
    </div>
  {/if}

  {#if $connectionStatus === STATUS.ONLINE && supportedAudioMimeType}
    <!-- null means a user is identified as not logged in-->
    {#if $authUser === null}
      <Login />
    {:else if ($users) }
      <BurpList />
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
