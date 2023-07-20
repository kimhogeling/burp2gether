<script>
  export let dateString;
</script>

<div class='wrapper'>
  <div class='line'></div>
  <div class='text'>{dateString}</div>
</div>

<style>
  .wrapper {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    margin-bottom: 1.5em;
  }

  .line {
    width: 100%;
    position: absolute;
    left: 0;
    outline: 1px dashed var(--color-two);
  }

  .text {
    position: relative;
    color: var(--color-two);
    background: var(--color-one);
    padding: 0 1em;
  }
</style>
