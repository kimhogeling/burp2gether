<script>
  let showQrCode = false;
</script>

<button on:click={() => { showQrCode = !showQrCode}} title="Share the app" type="button">
  🗣️
  {#if !showQrCode}
    Show share code
  {/if}
  {#if showQrCode}
    Hide share code
  {/if}
</button>

{#if showQrCode}
  <img class="qr"
       on:click={() => {showQrCode = false}}
       alt="QR Code to share the app"
       src="https://firebasestorage.googleapis.com/v0/b/burp2gether.appspot.com/o/burp2gether-qr.jpeg?alt=media&token=0403eb1a-063d-462d-a1b5-1eb30e3933d6"
       width="300"/>
{/if}

<style>
  .qr {
    position: fixed;
    top: 50vh;
    left: 50vw;
    transform: translate(-50%, -50%);
    border-radius: 0.5em;
    box-shadow: 0 0 200px var(--color-three);
    width: 300px;
    padding: 15px;
    background: var(--color-four);
  }
</style>
