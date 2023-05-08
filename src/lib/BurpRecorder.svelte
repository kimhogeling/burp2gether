<script>
  import BurpPlayer from "./BurpPlayer.svelte";
  import {slide} from 'svelte/transition';
  import {onMount} from 'svelte';

  // icons: https://svelte-icons-explorer.vercel.app/
  import {TiMediaStop, TiMicrophone, TiTick} from "svelte-icons/ti";

  export let newBlob;
  export let newBurpBlobString;
  export let save;
  export let supportedAudioMimeType;

  // Blob[]
  let audioChunks = [];
  let recording = false;
  let recorderWorks = false;
  let didInit = false;
  let globalStream = null;
  let triggeringRecording = false;
  let triggeringStop = false;
  let stopRecording = () => {
    console.log('initial empty stop function');
  };

  function killStream(stream) {
    [...stream.getAudioTracks()].forEach(t => t.stop());
  }

  function initRecorder() {
    return navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(
        stream => ({stream, rec: new MediaRecorder(stream, {mimeType: supportedAudioMimeType,})}))
  }

  // trigger Microphone Permission
  onMount(() => {
    initRecorder().then(({stream}) => {
      killStream(stream);
      recorderWorks = true;
    })
    .catch(e => {
      console.error('could not init recorder', e);
      recorderWorks = false;
      navigator.permissions.query({
        name: 'microphone'
      })
      .then(permissionStatus => {
        if (permissionStatus.state === 'denied') {
          alert("You can't record burps, because you've denied microphone access.");
        }
      })
      .catch(() => {
        alert('Somehow cannot record. Please tell Kim')
      })
    })
    .finally(() => {
      console.log(`did init recorder and it works${recorderWorks ? '' : ' NOT!!'}`)
      didInit = true;
    })
  });

  function startRecording() {
    triggeringRecording = true;
    audioChunks = [];
    newBlob = null
    newBurpBlobString = ''

    initRecorder().then(({stream, rec}) => {
      rec.addEventListener('start', () => {
        triggeringRecording = false;
        recording = true;
        globalStream = stream;
        stopRecording = () => {
          triggeringStop = true;
          console.log('replaced stop function')
          rec.stop();
        }
      });
      rec.addEventListener('dataavailable', blobEvent => audioChunks.push(blobEvent.data));
      rec.addEventListener('stop', () => {
        triggeringStop = false;
        recording = false;

        newBlob = new Blob(audioChunks, {type: supportedAudioMimeType});
        newBurpBlobString = window.URL.createObjectURL(newBlob);

        stopRecording = () => {
          console.log('third stop function');
        };
      });
      rec.start();
    });
  }

  function onsave() {
    save().finally(() => killStream(globalStream))
  }
</script>

<div class="wrapper" transition:slide>

  {#if !didInit}
    <p>Asking for Microphone permission..</p>
  {/if}

  {#if didInit && recorderWorks}
    <p>Let's record today's burp!</p>
    <div>
      {#if recording}
        <button type="button" on:click={stopRecording} class="icon-button"
                disabled={triggeringStop}>
          <TiMediaStop/>
        </button>
      {/if}
      {#if !recording}
        <button type="button" on:click={startRecording} class="icon-button red"
                disabled={triggeringRecording}>
          <TiMicrophone/>
        </button>
      {/if}
    </div>

    {#if newBurpBlobString}
      <div transition:slide>
        <p class="mt">Check your new Burp:</p>
        <BurpPlayer {newBurpBlobString}/>
        <p class="mt">Save it?</p>
        <button on:click={onsave} class="icon-button green">
          <TiTick/>
        </button>
      </div>
    {/if}
  {/if}

  {#if didInit && !recorderWorks}
    <p>Sorry.. 😭 Recorder doesn't work in this browser</p>
    <p class="mt">Maybe Chrome or Firefox work better on your device?</p>
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
