<script>
  import {getDownloadURL, getStorage, ref} from "firebase/storage";
  // icons: https://svelte-icons-explorer.vercel.app/
  import {TiMediaPause, TiNotes} from "svelte-icons/ti";

  // src for new recording, which is not yet in storage
  export let newBurpBlobString;
  export let playing = false;

  export let supportedAudioMimeType;

  // burp entry from DB
  export let burp;
  const storage = getStorage();
  let burpStorageURL;
  let burpStorageFileType;
  let error = null;

  $: {
    error = null;

    if (burp?.date && burp?.uid && burp?.filename) {
      getDownloadURL(ref(storage, burp?.filename))
      .then((url) => {
        burpStorageURL = url;
        burpStorageFileType = `audio/${burp?.filename?.split('.')?.[1]}`;
        error = null;
      })
      .catch((err) => {
        burpStorageURL = null;
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (err.code) {
          case 'storage/object-not-found':
            error = 'File doesn\'t exist';
            break;
          case 'storage/unauthorized':
            error = 'User doesn\'t have permission to access the object';
            break;
          case 'storage/canceled':
            error = 'User canceled the upload';
            break;
          case 'storage/unknown':
            error = 'Unknown error occurred, inspect the server response';
            break;
        }
      });
    }
  }

  function playOrPause() {
    let audioElement = this.parentNode.querySelector('audio');
    if (playing) {
      audioElement.querySelector('audio').pause();
      playing = false;
      return;
    }

    audioElement.load();
    audioElement.onloadeddata =  () => {
      audioElement.play();
      playing = true;
      audioElement.onended = () => {
        playing = false;
        audioElement.onloadeddata = () => {};
      };
    };
  }
</script>

{#if error}
  <div class="error">
    <p>Can't burp 😭</p>
    <code>Error is: <span>"{error}"</span></code>
    <p>Please tell Kim!</p>
  </div>
{/if}

{#if newBurpBlobString || burpStorageURL}
  <button on:click={playOrPause} class="icon-button {playing ? 'playing' : ''}">
    {#if playing}
      <TiMediaPause/>
    {/if}
    {#if !playing}
      <TiNotes/>
    {/if}
  </button>
  <audio>
    <source src={newBurpBlobString || burpStorageURL} type="{burpStorageFileType || supportedAudioMimeType}" />
  </audio>
{/if}

<style>
  .icon-button {
    transition: transform 1s;
  }

  .icon-button.playing {
    transform: scale(1.1) rotate(2deg);
  }

  .error {
    display: flex;
    line-height: 1.2em;
    padding: 1em;
    flex-direction: column;
    background: var(--color-three);
    color: var(--color-four);
  }

  .error p {
    margin: .5em 0;
  }

  .error span {
    color: var(--color-one);
  }
</style>
