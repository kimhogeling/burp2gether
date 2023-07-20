<script>
  /**
   * @fileoverview This is a Svelte component that displays burps by day.
   * @author Kim Hogeling
   */

  import BurpRecorder from '$lib/BurpRecorder.svelte';
  import DayLine from '$lib/DayLine.svelte';
  import BurpPlayer from '$lib/BurpPlayer.svelte';
  import { slide } from 'svelte/transition';
  import Reactions from '$lib/Reactions.svelte';
  import Favourite from '$lib/Favourite.svelte';
  import Share from '$lib/Share.svelte';
  import { authUser, userDoc, users } from '$lib/store-users.js';
  import { burps, todayString } from '$lib/store-burps';

  /**
   * @description Toggle to either show all users or just the favourited users.
   * @type {boolean}
   */
  let publicView = false;

  /**
   * @description Group burps by day into a Map.
   * @type {Map<string, Array<Burp>> | null}
   */
  $: burpsByDays = $burps?.reduce(
      (m, b) => m.set(b.date, [...(m.get(b.date) || []), b]),
      new Map([[todayString, []]]))
    || null;

  /**
   * @description Determines if the user has burped today.
   * @type {boolean}
   */
  $: burpedToday =
    saving ||
    savedSuccessfully ||
    (burpsByDays?.get(todayString) || []).some((burp) => burp.uid === $authUser.uid);

  /**
   * @description Indicates if BurpRecorder is saving a newly recorded burp.
   * @type {boolean}
   */
  let saving;
  /**
   * @description Indicates if BurpRecorder did save a newly recorded burp successfully.
   * @type {boolean|null}
   */
  let savedSuccessfully;

  /**
   * @description Gets the nickname of a user by their uid.
   * @param {string} uid - The uid of the user.
   * @returns {string} The nickname of the user.
   */
  const getNickname = uid => $users.get(uid)?.nickname || '';

  /**
   * @description Determines if a burp contains a user that was favourited.
   * @param {Burp} burp - The burp object.
   * @returns {boolean} True if the burp contains a user that was favourited, false otherwise.
   */
  const burpContainsUserThatWasFavourited = burp => $userDoc?.data().favourites?.includes(burp.uid);

  /**
   * @description Determines if a burp is the user's own burp.
   * @param {Burp} burp - The burp object.
   * @returns {boolean} True if the burp is the user's own burp, false otherwise.
   */
  const itsMyOwnBurp = burp => burp.uid === $authUser.uid;
</script>


{#if !burpsByDays || !$authUser || !$users}
  <div class='card'>
    Loading Burps and Favourites
  </div>
{/if}

{#if !burpedToday }
  <div class='card record-burp' transition:slide>
    <BurpRecorder bind:saving bind:savedSuccessfully />
  </div>
{/if}

{#if burpsByDays && $authUser && $users}
  <div class='list'>
    {#if burpedToday && burpsByDays.get(todayString) && $users}
      <!-- not in public view and user doesn't follow anyone, inform about public view -->
      {#if $userDoc && !publicView && ($userDoc?.data().favourites || []).length
      === 0 }
        <div class='card info-no-favourites'>
          You have no favourites yet..<br>
          <br>
          Find people here:
          <button type='button' on:click={() => { publicView = true}} title='Show everyone'>🌍
            Everyone
          </button>
        </div>
      {/if}

      <!-- day by day-->
      {#each ([...burpsByDays.entries()] || []) as day }
        <!-- show day if in public view or if user follows any of the users that burped that day -->
        {#if publicView || day[1].some(burpContainsUserThatWasFavourited) || day[1].some(
          itsMyOwnBurp) }
          <DayLine dateString={day[0]} />
          {#each day[1] as burp (burp.id)}
            <!-- show burp if in public view or if user follows the user of this burp -->
            {#if publicView || burpContainsUserThatWasFavourited(burp) || itsMyOwnBurp(burp) }
              <div class='card play-burp'>
                <BurpPlayer {burp} />
                <p class='nickname'>{getNickname(burp.uid)}
                  <Favourite burpUser={$users.get(burp.uid)} />
                </p>
                <Reactions {burp} />
              </div>
            {/if}
          {/each}
        {/if}
      {/each}
    {/if}
  </div>
{/if}

<div class='bottom-bar'>
  {#if burpedToday}
    {#if publicView}
      <button type='button' on:click={() => { publicView = false}}
              title='Show my favourite burpers'>
        ★ Show Favourites
      </button>
    {:else}
      <button type='button' on:click={() => { publicView = true}} title='Show everyone'>
        🌍 Show Everyone
      </button>
    {/if}
  {/if}

  <Share />
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
