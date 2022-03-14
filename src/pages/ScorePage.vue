<template>
  <div
    id="score-page"
    v-if="$_score"
  >
    <section-component
      v-for="(sectionInfo, sectionIdx) of $_sectionInfoArray"
      v-bind:key="sectionIdx"
      v-bind:section-idx="sectionIdx"
      v-bind:show-beat-on-first-bar="sectionInfo.showBeatOnFirstBar"
    />
  </div>
</template>

<style scoped>
#score-page {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>

<script>
import SectionComponent from '../components/SectionComponent.vue'

class SectionInfo {
  constructor(showBeatOnFirstBar) {
    this.showBeatOnFirstBar = showBeatOnFirstBar;
  }
}

export default {
  components: {
    SectionComponent,
  },

  computed: {
    $_score() {
      return this.$store.state.score;
    },

    $_sectionInfoArray() {
      let sectionInfoArray = new Array();
      if (this.$_score === null) return sectionInfoArray;
      sectionInfoArray.push(new SectionInfo(true));
      for (let sectionIdx = 1; sectionIdx < this.$_score.sections.length; ++sectionIdx) {
        let currentSection = this.$_score.sections[sectionIdx];
        let previousSection = this.$_score.sections[sectionIdx - 1];
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