<script>
  import {collection, getFirestore, onSnapshot, query, updateDoc, where} from "firebase/firestore";

  export let burpUser;
  export let user;

  let userDoc;
  onSnapshot(query(collection(getFirestore(), 'friend'), where('uid', '==', user.uid)),
      querySnapshot => {
        userDoc = querySnapshot.docs[0];
      });

  function setFavourite() {
    const updatedFavourites = new Set(userDoc.data().favourites || []);
    updatedFavourites.add(burpUser.uid);
    const favourites = [...updatedFavourites];
    updateDoc(userDoc.ref, {favourites}).catch(() => {
      alert(
          `Could not add user ${
              burpUser.nickname}:${burpUser.uid} to favourites of user ${
              userDoc.data().nickname}:${userDoc.data().uid}. Please tell Kim about this!`)
    });
  }

  function removeFavourite() {
    if (confirm(`Remove ${burpUser.nickname} from favourites?`)) {
      const updatedFavourites = new Set(userDoc.data().favourites || []);
      updatedFavourites.delete(burpUser.uid);
      const favourites = [...updatedFavourites];
      updateDoc(userDoc.ref, {favourites}).catch(() => {
        alert(
            `Could not remove user ${
                burpUser.nickname}:${burpUser.uid} from favourites of user ${
                userDoc.data().nickname}:${userDoc.data().uid}. Please tell Kim about this!`)
      });
    }
  }

  let isStarred;
  $: isStarred = (userDoc?.data().favourites || []).includes(burpUser.uid)
</script>

{#if burpUser.uid !== user.uid && userDoc?.data()}
  {#if isStarred}
    <span class="star" on:click={() => {removeFavourite()}} title="Remove from favourites">🤩</span>
  {/if}
  {#if !isStarred}
    <span class="star" on:click={() => {setFavourite()}} title="Add to favourites">😶</span>
  {/if}
{/if}

<style>
  .star {
    cursor: pointer;
  }
</style>
