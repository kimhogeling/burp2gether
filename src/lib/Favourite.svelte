<script>
  import {authUser, updateFavourites, userDoc} from './store-users.js';

  export let burpUser;

  let addMessageVisible = false;
  let removeMessageVisible = false;

  function removeFavourite() {
    updateFavourites(false, burpUser).then(() => removeMessageVisible = false);
  }

  function addFavourite() {
    updateFavourites(true, burpUser).then(() => addMessageVisible = false);
  }

  $: isStarred = ($userDoc?.data().favourites || []).includes(burpUser?.uid);
</script>

{#if burpUser.uid !== $authUser.uid}
  {#if isStarred}
    <span class="star on"
          on:click={() => {removeMessageVisible = true}}
          on:keydown={() => {removeMessageVisible = true}}
          role="button"
          tabindex="0"
          title="Remove from favourites">★</span>
    {#if removeMessageVisible}
      <div class="message">
        <div>No longer favourite?</div>
        <div>
          <button type="button" class="cancel" on:click={() => {removeMessageVisible = false}}>
            Cancel
          </button>
          <button type="button" class="ok" on:click={() => {removeFavourite()}}>Ok</button>
        </div>
      </div>
    {/if}
  {/if}
  {#if !isStarred}
    <span class="star off"
          on:click={() => {addMessageVisible = true}}
          on:keydown={() => {addMessageVisible = true}}
          role="button"
          tabindex="0"
          title="Add to favourites">☆</span>
    {#if addMessageVisible}
      <div class="message">
        <div>Add as favourite?</div>
        <div>
          <button type="button" class="cancel" on:click={() => {addMessageVisible = false}}>Cancel
          </button>
          <button type="button" class="ok" on:click={() => {addFavourite()}}>Ok</button>
        </div>
      </div>
    {/if}
  {/if}
{/if}

<style>
  .star {
    cursor: pointer;
    color: var(--color-one);
  }

  .star.off {
    color: var(--color-three);
  }

  .message {
    width: 278px;
    position: absolute;
    background-color: var(--color-four);
    left: 14px;
    padding: 15px;
    border-radius: 1em;
    box-shadow: 2px 2px 5px #0000008c;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 2px solid var(--color-three);
  }

  button {
    padding: 10px;
    margin: 10px 5px 0;
    cursor: pointer;
    font-weight: normal;
  }

  button.ok {
    background-color: var(--color-four);
    color: var(--color-one);
    font-weight: bold;
  }

  button.cancel {
    background-color: var(--color-four);
    color: var(--color-three);
  }
</style>
