<template>
  <div id="score-footer">
    {{ scoreMetadata.title }} ({{ scorePageIndex + 1 }} / {{ numScorePages }})
  </div>
</template>

<style scoped>
#score-footer {
  display: flex;
  height: 40px;
  align-content: center;
  justify-content: center;
}
</style>

<script>
import Score from '../modules/Score.js';

export default {
  props: {
    scoreMetadata: { type: Score.Metadata },
    scorePageIndex: { type: Number },
    numScorePages: { type: Number },
  },
}
</script>