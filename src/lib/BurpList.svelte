<script>
  import BurpRecorder from './BurpRecorder.svelte';
  import {collection, getFirestore, onSnapshot, orderBy, query} from 'firebase/firestore';
  import {getStorage, ref, uploadBytes} from 'firebase/storage';
  import {Burp} from "../types/Burp.js";
  import DayLine from "./DayLine.svelte";
  import BurpPlayer from "./BurpPlayer.svelte";
  import {slide} from 'svelte/transition';
  import Reactions from "./Reactions.svelte";

  const createISOStringWithTimezoneOffset = (date) => new Date(
      date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0]

  let todayString = createISOStringWithTimezoneOffset(new Date());

  // this is just for midnight
  window.setInterval(() => {
    let updatedTodayString = createISOStringWithTimezoneOffset(new Date());
    if (todayString !== updatedTodayString) {
      todayString = updatedTodayString;
      youHaveBurpedToday = false;
      newBurpBlobString = null;
      newBlob = null;
    }
  }, 1000 * 60 * 2);

  let burpsByDays = null;
  let yourWinnerEachDay = new Map();
  let newBurpBlobString;
  let newBlob;
  let youHaveBurpedToday = true;

  export let user
  export let friends;
  export let supportedAudioMimeType;
  const supportedFileExtension = supportedAudioMimeType?.split('/')[1];


  const burpsRef = collection(getFirestore(), 'burp');
  onSnapshot(query(burpsRef, orderBy("date", "desc")), (querySnapshot) => {
    burpsByDays = new Map();
    burpsByDays.set(todayString, []);
    querySnapshot.docs
    .map(b => Burp.of(b.id, b.data()))
    .forEach(b => burpsByDays.set(b.date, [...(burpsByDays.get(b.date) || []), b]))

    yourWinnerEachDay = new Map();
    querySnapshot.docs
    .forEach(b => {
      const burp = Burp.of(b.id, b.data());
      if (burp.reactions?.WIN?.includes(user.uid)) {
        yourWinnerEachDay.set(burp.date, burp.id);
      }
    });
  });

  $: youHaveBurpedToday =
      didsave ||
      !burpsByDays
        ? true
        : (burpsByDays?.get(todayString) || []).some((burp) => burp.uid === user.uid);

  const storage = getStorage();

  let saving = false;
  let didsave = false;

  async function save() {
    const filename = `burp/${todayString}_${user.uid}.${supportedFileExtension}`;
    saving = true;
    return uploadBytes(ref(storage, filename), newBlob, {
      contentType: supportedAudioMimeType
    })
    .then(() => {
      didsave = true;
      newBurpBlobString = null;
    })
    .catch(e => {
      console.error('Something went wrong, couldn\'t save!', e);
      window.alert('Could not add. Maybe reload.')
    })
    .finally(() => {
      saving = false;
    })
  }

  const getNickname = uid => friends.get(uid)?.nickname || '';
</script>

{#if !youHaveBurpedToday && !saving && !didsave }
  <div class="card record-burp" transition:slide>
    <BurpRecorder bind:newBurpBlobString bind:newBlob {save} {supportedAudioMimeType}/>
  </div>
{/if}

{#if saving || didsave && !burpsByDays?.get(todayString)}
  <div class="card">Saving your new burp!</div>
{/if}

<div class="list">
  {#if youHaveBurpedToday && burpsByDays?.get(todayString) && friends}
    {#each ([...burpsByDays.entries()] || []) as day }
      <DayLine dateString={day[0]}/>
      {#each day[1] as burp (burp.id)}
        <div class="card play-burp">
          <BurpPlayer {burp} {supportedAudioMimeType} />
          <p class="nickname">{getNickname(burp.uid)}</p>
          <Reactions {burp} {user} {yourWinnerEachDay} />
        </div>
      {/each}
    {/each}
  {/if}
</div>

<style>
  .list {
    display: grid;
  }

  .record-burp {
    width: 15em;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .play-burp {
    display: flex;
    flex-direction: column;
    align-items: center;
    word-break: break-all;
  }

  .nickname {
    font-size: 1.5em;
  }
</style>
