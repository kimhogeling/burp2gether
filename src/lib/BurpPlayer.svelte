<script>
  // icons: https://svelte-icons-explorer.vercel.app/
  import { TiNotes } from 'svelte-icons/ti';

  import {
    getFileFromStorage,
    newBurpBlobString,
    supportedAudioMimeType
  } from '$lib/store-burps.js';

  // src for new recording, which is not yet in storage
  export let playing = false;
  // burp entry from DB
  export let burp;

  let injectAudio = false;
  let burpStorageURL;
  let burpStorageFileType;
  let error = null;

  $: audioSource = $newBurpBlobString || burpStorageURL;
  $: audioType = burpStorageFileType || supportedAudioMimeType;

  $: {
    if (burp?.filename) {
      getFileFromStorage(burp?.filename)
      .then(({ url, fileType }) => {
        burpStorageURL = url;
        burpStorageFileType = fileType;
      })
      .catch(msg => error = msg);
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
  <div class='error'>
    <p>Can't burp 😭</p>
    <code>Error is: <span>"{error}"</span></code>
    <p>Please tell Kim!</p>
  </div>
{/if}

{#if audioSource && audioType}
  <button on:click={play} class="icon-button {playing ? 'playing' : ''}">
    <TiNotes />
    {#if injectAudio}
      <audio>
        <source src={audioSource} type='{audioType}' />
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
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.7);
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
