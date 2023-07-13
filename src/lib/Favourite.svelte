<script>
  import {collection, getFirestore, onSnapshot, query, updateDoc, where} from "firebase/firestore";

  export let burpUser;
  export let user;

  let userDoc;
  onSnapshot(query(collection(getFirestore(), 'friend'), where('uid', '==', user.uid)),
      querySnapshot => {
        userDoc = querySnapshot.docs[0];
      });

  let addMessageVisible = false;
  let removeMessageVisible = false;

  function setFavourite() {
    const updatedFavourites = new Set(userDoc.data().favourites || []);
    updatedFavourites.add(burpUser.uid);
    const favourites = [...updatedFavourites];
    updateDoc(userDoc.ref, {favourites})
    .then(() => {
      addMessageVisible = false;
    })
    .catch(() => {
      alert(
          `Could not add user ${
              burpUser.nickname}:${burpUser.uid} to favourites of user ${
              userDoc.data().nickname}:${userDoc.data().uid}. Please tell Kim about this!`)
    });
  }

  function removeFavourite() {
      const updatedFavourites = new Set(userDoc.data().favourites || []);
      updatedFavourites.delete(burpUser.uid);
      const favourites = [...updatedFavourites];
      updateDoc(userDoc.ref, {favourites})
      .then(() => {
        removeMessageVisible = false;
      })
      .catch(() => {
        alert(
            `Could not remove user ${
                burpUser.nickname}:${burpUser.uid} from favourites of user ${
                userDoc.data().nickname}:${userDoc.data().uid}. Please tell Kim about this!`)
      });
  }

  let isStarred;
  $: isStarred = (userDoc?.data().favourites || []).includes(burpUser.uid)
</script>

{#if burpUser.uid !== user.uid && userDoc?.data()}
  {#if isStarred}
    <span class="star on" on:click={() => {removeMessageVisible = true}}
          title="Remove from favourites">★</span>
    {#if removeMessageVisible}
      <div class="message">
        <div>No longer favourite?</div>
        <div>
          <button type="button" class="cancel" on:click={() => {removeMessageVisible = false}}>Cancel</button>
          <button type="button" class="ok" on:click={() => {removeFavourite()}}>Ok</button>
        </div>
      </div>
    {/if}
  {/if}
  {#if !isStarred}
    <span class="star off" on:click={() => {addMessageVisible = true}}
          title="Add to favourites">☆</span>
    {#if addMessageVisible}
      <div class="message">
        <div>Add as favourite?</div>
        <div>
          <button type="button" class="cancel" on:click={() => {addMessageVisible = false}}>Cancel</button>
          <button type="button" class="ok" on:click={() => {setFavourite()}}>Ok</button>
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
