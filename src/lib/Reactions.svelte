<script>
  import {Reaction} from "../types/Reaction.js";
  import {authUser} from './store-users.js'
  import {addReactionToFirebase, yourWinnerEachDay} from "$lib/store-burps.js";

  export let burp;

  let winnerReaction = new Reaction('WIN', '🏆', 'Today\'s Winner!', true);
  const REACTIONS = [
    new Reaction('OKAY', '🙂', 'Okay'),
    new Reaction('WOW', '🤩', 'Wow!'),
    new Reaction('WTF', '🤯', 'WTF!'),
    new Reaction('HAHA', '🤣', 'Haha'),
    new Reaction('EWW', '🤢', 'Ewww'),
    new Reaction('SAD', '😢', 'Sad..'),
    winnerReaction,
  ];

  function addReaction(reaction) {
    if (reaction.key === winnerReaction.key) {
      let winnerAtChosenDay = $yourWinnerEachDay.get(burp.date);
      if (winnerAtChosenDay && winnerAtChosenDay !== burp.id) {
        alert(`Your already chose a winner for ${burp.date}`);
        return;
      }
    }
    burp.reactions = addReactionToFirebase(reaction, burp, $authUser);
  }
</script>

<div class="wrapper">
  <div class="smileys">
    {#each REACTIONS as reaction}
      {#if !reaction.hide}
      <span class="smiley" on:click={() => addReaction(reaction)} title={reaction.description}>
        {reaction.smiley}
        <span class="counter">{(burp.reactions || {})[reaction.key]?.length || ''}</span>
      </span>
      {/if}
    {/each}
  </div>
  <div class="big-smiley">
    <span class="smiley big" on:click={() => addReaction(winnerReaction)}
          title={winnerReaction.description}>
    {winnerReaction.smiley}
      <span class="counter">{(burp.reactions || {})[winnerReaction.key]?.length || ''}</span>
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
