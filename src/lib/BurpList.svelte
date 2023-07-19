<script>
  import BurpRecorder from './BurpRecorder.svelte';
  import DayLine from "./DayLine.svelte";
  import BurpPlayer from "./BurpPlayer.svelte";
  import {slide} from 'svelte/transition';
  import Reactions from "./Reactions.svelte";
  import Favourite from "./Favourite.svelte";
  import Share from "./Share.svelte";
  import {authUser, userDoc, users} from './store-users.js'
  import {burps, todayString} from './store-burps'

  let burpsByDays;

  let publicView = false;

  $: loadedUserDocInitially = !!$userDoc;

  $: burpsByDays = $burps?.reduce(
          (m, b) => m.set(b.date, [...(m.get(b.date) || []), b]),
          new Map([[todayString, []]]))
      || null;

  $:youHaveBurpedToday =
      saving ||
      savedSuccessfully ||
      (burpsByDays?.get(todayString) || []).some((burp) => burp.uid === $authUser.uid);

  let saving;
  let savedSuccessfully;

  const getNickname = uid => $users.get(uid)?.nickname || '';

  const burpContainsUserThatWasFavourited = burp => $userDoc?.data().favourites?.includes(burp.uid);

  const itsMyOwnBurp = burp => burp.uid === $authUser.uid;
</script>


{#if !burpsByDays || !$authUser || !$users}
  <div class="card">
    Loading Burps and Favourites
  </div>
{/if}

{#if !youHaveBurpedToday }
  <div class="card record-burp" transition:slide>
    <BurpRecorder bind:saving bind:savedSuccessfully />
  </div>
{/if}

{#if burpsByDays && $authUser && $users}
  <div class="list">
    {#if youHaveBurpedToday && burpsByDays.get(todayString) && $users}
      <!-- not in public view and user doesn't follow anyone, inform about public view -->
      {#if loadedUserDocInitially && !publicView && ($userDoc?.data().favourites || []).length
      === 0 }
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
        {#if publicView || day[1].some(burpContainsUserThatWasFavourited) || day[1].some(
            itsMyOwnBurp) }
          <DayLine dateString={day[0]}/>
          {#each day[1] as burp (burp.id)}
            <!-- show burp if in public view or if user follows the user of this burp -->
            {#if publicView || burpContainsUserThatWasFavourited(burp) || itsMyOwnBurp(burp) }
              <div class="card play-burp">
                <BurpPlayer {burp}/>
                <p class="nickname">{getNickname(burp.uid)}
                  <Favourite burpUser={$users.get(burp.uid)}/>
                </p>
                <Reactions {burp}/>
              </div>
            {/if}
          {/each}
        {/if}
      {/each}
    {/if}
  </div>
{/if}

<div class="bottom-bar">
  {#if youHaveBurpedToday}
    {#if publicView}
      <button type="button" on:click={() => { publicView = false}}
              title="Show my favourite burpers">
        ★ Show Favourites
      </button>
    {:else}
      <button type="button" on:click={() => { publicView = true}} title="Show everyone">
        🌍 Show Everyone
      </button>
    {/if}
  {/if}

  <Share/>
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
