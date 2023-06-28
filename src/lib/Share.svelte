<script>
  import MdShare from 'svelte-icons/md/MdShare.svelte';

  let showQrCode = false;
</script>

<div class="share">
  <p class="share-text">Share the app:
    {#if !showQrCode}
      <button type="button" class="icon-button" on:click={() => { showQrCode = true}}>
        <MdShare/>
      </button>
    {/if}
  </p>

  {#if showQrCode}
    <img class="qr"
         alt="QR Code to share the app"
         src="https://firebasestorage.googleapis.com/v0/b/burp2gether.appspot.com/o/burp2gether-qr.jpeg?alt=media&token=0403eb1a-063d-462d-a1b5-1eb30e3933d6"
         width="300"/>
  {/if}
</div>

<style>
  .share {
    display: flex;
    align-items: center;
    flex-direction: column;
    margin: 3em 0 0;
  }

  .share-text {
    color: white;
    display: flex;
    align-items: center;
  }

  .qr {
    border-radius: 0.5em;
  }
</style>
