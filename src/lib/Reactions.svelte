
<script>
  import {doc, getFirestore, updateDoc} from "firebase/firestore";

  export let burp;
  export let user;
  export let yourWinnerEachDay;

  const REACTIONS = [
    {key: 'OKAY', smiley: '🙂', description: 'Okay'},
    {key: 'WOW', smiley: '🤩', description: 'Wow!'},
    {key: 'WTF', smiley: '🤯', description: 'WTF!'},
    {key: 'HAHA', smiley: '🤣', description: 'Haha'},
    {key: 'EWW', smiley: '🤢', description: 'Ewww'},
    {key: 'SAD', smiley: '😢', description: 'Sad..'},
    {key: 'WIN', smiley: '🏆', description: 'Today\'s Winner!', hide: true},
  ];

  const winnerReaction = REACTIONS.find(r => r.key === 'WIN');

  function addReaction (reaction) {
    const updatedReactions = burp.reactions || {}
    if (reaction.key === 'WIN') {
      let winnerAtChosenDay = yourWinnerEachDay.get(burp.date);
      if (winnerAtChosenDay && winnerAtChosenDay !== burp.id) {
        alert(`Your already chose a winner for ${burp.date}`);
        return;
      }
    }

    if (!updatedReactions[reaction.key]) {
      updatedReactions[reaction.key] = [];
    }

    if (!updatedReactions[reaction.key].includes(user.uid)) {
      updatedReactions[reaction.key] = [user.uid, ...updatedReactions[reaction.key]];
    } else {
      updatedReactions[reaction.key] = updatedReactions[reaction.key].filter(uid => uid !== user.uid);
    }

    updateDoc(doc(getFirestore(), 'burp', burp.id), {
      reactions: updatedReactions
    });

    burp.reactions = updatedReactions
  }
</script>

<div class="wrapper">
  <div class="smileys">
    {#each REACTIONS as reaction}
      {#if !reaction.hide}
      <span class="smiley" on:click={() => addReaction(reaction)} title={reaction.description}>
        {reaction.smiley}
        <span class="counter">{((burp.reactions || {})[reaction.key] || []).length || ''}</span>
      </span>
      {/if}
    {/each}
  </div>
  <div class="big-smiley">
    <span class="smiley big" on:click={() => addReaction(winnerReaction)}
          title={winnerReaction.description}>
    {winnerReaction.smiley}
      <span class="counter">{((burp.reactions || {})[winnerReaction.key] || []).length || ''}</span>
  </span>
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    align-items: center;
  }

  .smileys {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: .3em;
  }

  .smiley {
    font-size: 2em;
    cursor: pointer;
    padding: .1em;
    border-radius: .5em;
    background: var(--color-four);
    color: var(--color-one);
    border: 2px solid var(--color-three);
    display: flex;
    align-items: center;
  }

  .smiley.big {
    font-size: 4.4em;
    margin-left: .1em;
    border-radius: .2em;
  }

  .counter {
    font-size: 0.6em;
  }
</style>
