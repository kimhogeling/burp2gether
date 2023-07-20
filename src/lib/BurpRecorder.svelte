<script>
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  // icons: https://svelte-icons-explorer.vercel.app/
  import { TiMediaStop, TiMicrophone, TiTick } from 'svelte-icons/ti';

  import BurpPlayer from '$lib/BurpPlayer.svelte';
  import { newBurpBlobString, saveBurp, supportedAudioMimeType } from '$lib/store-burps.js';
  import { authUser } from '$lib/store-users.js';

  export let saving = false;
  export let savedSuccessfully = false;

  // Blob[]
  let audioChunks = [];
  let newBlob = null;
  let recording = false;
  let recorderWorks = false;
  let didInit = false;
  let globalStream = null;
  let triggeringRecording = false;
  let triggeringStop = false;
  let stopRecording = () => {
  };

  function killStream(stream) {
    [...stream.getAudioTracks()].forEach(t => t.stop());
  }

  function initRecorder() {
    return navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(
      stream => ({ stream, rec: new MediaRecorder(stream, { mimeType: supportedAudioMimeType }) }));
  }

  function onsave() {
    saving = true;
    return saveBurp($authUser, newBlob)
    .then(() => {
      savedSuccessfully = true;
    })
    .catch(() => {
      savedSuccessfully = false;
    })
    .finally(() => {
      saving = false;
      newBurpBlobString.set(null);
      killStream(globalStream);
    });
  }

  // trigger Microphone Permission
  onMount(async () => {
    try {
      killStream((await initRecorder()).stream);
      recorderWorks = true;
    } catch (e) {
      console.error('could not init recorder', e);
      recorderWorks = false;
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
        if (permissionStatus.state === 'denied') {
          alert('You can\'t record burps, because you\'ve denied microphone access.');
        } else {
          alert(
            `Somehow cannot record. (permissionStatus.state:${permissionStatus.state}) Please tell Kim`);
        }
      } catch {
        alert('Somehow cannot record. Please tell Kim');
      }
    }
    didInit = true;
  });

  async function startRecording() {
    triggeringRecording = true;
    audioChunks = [];
    newBlob = null;
    newBurpBlobString.set(null);

    try {
      const { stream, rec } = await initRecorder();
      rec.addEventListener('start', () => {
        triggeringRecording = false;
        recording = true;
        globalStream = stream;
        stopRecording = () => {
          triggeringStop = true;
          rec.stop();
        };
      });
      rec.addEventListener('dataavailable', blobEvent => audioChunks.push(blobEvent.data));
      rec.addEventListener('stop', () => {
        triggeringStop = false;
        recording = false;

        newBlob = new Blob(audioChunks, { type: supportedAudioMimeType });
        newBurpBlobString.set(window.URL.createObjectURL(newBlob));

        stopRecording = () => {
        };
      });
      rec.start();
    } catch (e) {
      console.error('Could not start recording', e);
      if (confirm('Could not start recording. Maybe reloading the app would help. Reload?')) {
        location.reload();
      }
    }
  }
</script>

<div class='wrapper' transition:slide>

  {#if !didInit}
    <p>Asking for Microphone permission..</p>
  {/if}

  {#if didInit && recorderWorks}
    <p>Let's record today's burp!</p>
    <div>
      {#if recording}
        <button type='button' on:click={stopRecording} class='icon-button'
                disabled={triggeringStop}>
          <TiMediaStop />
        </button>
      {/if}
      {#if !recording}
        <button type='button' on:click={startRecording} class='icon-button red'
                disabled={triggeringRecording}>
          <TiMicrophone />
        </button>
      {/if}
    </div>

    {#if $newBurpBlobString}
      <div transition:slide>
        <p class='mt'>Check your new Burp:</p>
        <BurpPlayer {$newBurpBlobString} />
        <p class='mt'>Save it?</p>
        <button on:click={onsave} class='icon-button green'>
          <TiTick />
        </button>
      </div>
    {/if}
  {/if}

  {#if didInit && !recorderWorks}
    <p>Sorry.. 😭 Recorder doesn't work in this browser</p>
    <p class='mt'>Maybe Chrome or Firefox work better on your device?</p>
  {/if}

</div>

<style>
  button[disabled] {
    color: grey;
    background: lightgrey;
  }

  .red {
    color: red;
  }

  .green {
    color: green;
  }

  .wrapper {
    text-align: center;
  }

  .mt {
    margin-top: 1em;
  }
</style>
