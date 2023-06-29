<script>
  import {getDownloadURL, getStorage, ref} from "firebase/storage";
  // icons: https://svelte-icons-explorer.vercel.app/
  import {TiNotes} from "svelte-icons/ti";

  // src for new recording, which is not yet in storage
  export let newBurpBlobString;
  export let playing = false;

  export let supportedAudioMimeType;

  // burp entry from DB
  export let burp;
  const storage = getStorage();
  let injectAudio = false;
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

  function play(event, button = this) {
    if (playing) {
      return;
    }

    // the audio tag is not injected until the user clicks the play button
    if (!injectAudio) {
      injectAudio = true;
      // wait an event loop, so that the audio element below can be injected
      setTimeout(() => play(event, button), 1);
      return;
    }

    const audioElement = button.parentNode.querySelector('audio');
    audioElement.load();
    audioElement.onloadeddata = () => {
      audioElement.play();
      playing = true;
      audioElement.onended = () => {
        playing = false;
        audioElement.onloadeddata = () => {
        };
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
  <button on:click={play} class="icon-button {playing ? 'playing' : ''}">
    <TiNotes/>
    {#if injectAudio}
      <audio>
        <source src={newBurpBlobString || burpStorageURL}
                type="{burpStorageFileType || supportedAudioMimeType}"/>
      </audio>
    {/if}
  </button>
{/if}

<style>
  .icon-button {
    transition: transform 1.5s, box-shadow 1.5s;
  }

  .icon-button.playing {
    transform: scale(1.2) rotate(2deg);
    box-shadow: 5px 5px 10px rgba(0,0,0,0.7 );
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
