<template>
  <v-container id="score-page">
    <v-sheet
      outlined
      elevation="3"
      class="pa-5"
    >
      <score-title-component
        v-bind:score-metadata="score.metadata"
      />
      <section-component
        v-for="(sectionInfo, sectionIdx) of $_sectionInfoArray"
        v-bind:key="sectionIdx"
        v-bind:score="score"
        v-bind:section-idx="sectionIdx"
        v-bind:show-beat-on-first-bar="sectionInfo.showBeatOnFirstBar"
      />
      <v-btn v-on:click="$emit('generate-section', $_numSections)">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-sheet>
  </v-container>
</template>

<style scoped>
#score-page {
  display: flex;
  flex-direction: column;
}
</style>

<script>
import SectionComponent from '@/components/SectionComponent.vue'
import ScoreTitleComponent from '@/components/ScoreTitleComponent.vue'
import Score from '@/modules/Score.js'

class SectionInfo {
  constructor(showBeatOnFirstBar) {
    this.showBeatOnFirstBar = showBeatOnFirstBar;
  }
}

export default {
  components: {
    ScoreTitleComponent,
    SectionComponent,
  },

  props: {
    score: { type: Score, default: null },
  },

  computed: {
    $_numSections() { return this.score.sections.length },

    $_sectionInfoArray() {
      let sectionInfoArray = new Array();
      if (this.score === null) return sectionInfoArray;
      if (this.$_numSections === 0) return sectionInfoArray;
      sectionInfoArray.push(new SectionInfo(true));
      for (let sectionIdx = 1; sectionIdx < this.$_numSections; ++sectionIdx) {
        let currentSection = this.score.sections[sectionIdx];
        let previousSection = this.score.sections[sectionIdx - 1];
        let firstBarValueOfCurrentSection = currentSection.bars[0].value;
        let lastBarValueOfPreviousSection = previousSection.bars[previousSection.bars.length - 1].value;
        if (firstBarValueOfCurrentSection.numerator !== lastBarValueOfPreviousSection.numerator) {
          sectionInfoArray.push(new SectionInfo(true));
        } else if (firstBarValueOfCurrentSection.denominator !== lastBarValueOfPreviousSection.denominator) {
          sectionInfoArray.push(new SectionInfo(true));
        } else {
          sectionInfoArray.push(new SectionInfo(false));
        }
      }
      return sectionInfoArray;
    },
  },
}
</script>