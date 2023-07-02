<script>
  import BurpRecorder from './BurpRecorder.svelte';
  import {collection, getFirestore, onSnapshot, orderBy, query, where} from 'firebase/firestore';
  import {getStorage, ref, uploadBytes} from 'firebase/storage';
  import {Burp} from "../types/Burp.js";
  import DayLine from "./DayLine.svelte";
  import BurpPlayer from "./BurpPlayer.svelte";
  import {slide} from 'svelte/transition';
  import Reactions from "./Reactions.svelte";
  import {onDestroy} from "svelte";
  import Favourite from "./Favourite.svelte";

  const createISOStringWithTimezoneOffset = (date) => new Date(
      date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0]

  let todayString = createISOStringWithTimezoneOffset(new Date());

  // this is just for midnight
  const intervalForDayChangeCheck = window.setInterval(() => {
    let updatedTodayString = createISOStringWithTimezoneOffset(new Date());
    if (todayString !== updatedTodayString) {
      todayString = updatedTodayString;
      youHaveBurpedToday = false;
      newBurpBlobString = null;
      newBlob = null;
    }
  }, 1000 * 60 * 2);

  onDestroy(() => clearInterval(intervalForDayChangeCheck));

  let burpsByDays = new Map();
  let yourWinnerEachDay = new Map();
  let newBurpBlobString;
  let newBlob;

  let youHaveBurpedToday = true;
  let publicView = false;

  export let user
  export let users;
  export let supportedAudioMimeType;
  const supportedFileExtension = supportedAudioMimeType?.split('/')[1];

  let userDoc;
  onSnapshot(query(collection(getFirestore(), 'friend'), where('uid', '==', user.uid)),
      querySnapshot => {
        userDoc = querySnapshot.docs[0];
      });

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
      savedSuccessfully ||
      (burpsByDays?.get(todayString) || []).some((burp) => burp.uid === user.uid);

  const storage = getStorage();

  let saving = false;
  let savedSuccessfully = false;

  async function save() {
    const filename = `burp/${todayString}_${user.uid}.${supportedFileExtension}`;
    saving = true;
    return uploadBytes(ref(storage, filename), newBlob, {
      contentType: supportedAudioMimeType
    })
    .then(() => {
      savedSuccessfully = true;
      newBurpBlobString = null;
    })
    .catch(e => {
      console.error('Something went wrong, couldn\'t save!', e);
      window.alert(
          'Could not add the burp. Maybe a bad internet connection? Otherwise reloading the app might help.')
    })
    .finally(() => {
      saving = false;
    })
  }

  const getNickname = uid => users.get(uid)?.nickname || '';
</script>

{#if !youHaveBurpedToday && !saving && !savedSuccessfully }
  <div class="card record-burp" transition:slide>
    <BurpRecorder bind:newBurpBlobString bind:newBlob {save} {supportedAudioMimeType}/>
  </div>
{/if}

<div class="list">
  {#if burpsByDays.entries().length === 0}
    <div class="card">
      Loading Burps..
    </div>
  {/if}

  {#if youHaveBurpedToday && burpsByDays.get(todayString) && users}
    <!-- not in public view and user doesn't follow anyone, inform about public view -->
    {#if !publicView && (userDoc?.data().favourites || []).length === 0 }
      <div class="card info-no-favourites">
        You have no favourites yet..<br>
        <br>
        Find people here:
        <button type="button" on:click={() => { publicView = true}} title="Show everyone">🌍
          Everyone
        </button>
      </div>
    {/if}

    <!-- day by day-->
    {#each ([...burpsByDays.entries()] || []) as day }
      <!-- show day if in public view or if user follows any of the users that burped that day -->
      {#if publicView || day[1].some(b => userDoc?.data().favourites.includes(b.uid)) }
        <DayLine dateString={day[0]}/>
        {#each day[1] as burp (burp.id)}
          <!-- show burp if in public view or if user follows the user of this burp -->
          {#if publicView || userDoc?.data().favourites?.includes(burp.uid) }
            <div class="card play-burp">
              <BurpPlayer {burp} {supportedAudioMimeType}/>
              <p class="nickname">{getNickname(burp.uid)}
                <Favourite burpUser={users.get(burp.uid)} {user}/>
              </p>
              <Reactions {burp} {user} {yourWinnerEachDay}/>
            </div>
          {/if}
        {/each}
      {/if}
    {/each}
  {/if}
</div>

{#if youHaveBurpedToday}
  <div class="bottom-bar">
    {#if publicView}
      <button type="button" on:click={() => { publicView = false}}
              title="Show my favourite burpers">🤩 Show Favourites
      </button>
    {/if}
    {#if !publicView}
      <button type="button" on:click={() => { publicView = true}} title="Show everyone">🌍 Show Everyone
      </button>
    {/if}
  </div>
{/if}

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

  .info-no-favourites {
    padding: 1em;
  }

  .bottom-bar {
    position: fixed;
    bottom: 0;
    border-top: 2px solid;
    width: 100%;
    display: flex;
    justify-content: space-evenly;
    background: var(--color-two);
  }
</style>
