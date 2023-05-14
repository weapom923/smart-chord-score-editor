<template>
  <v-sheet
    tile id="score-page"
    class="d-flex flex-column overflow-y-hidden mb-5"
    v-on:mousedown="unselectBar"
    v-bind:style="$_pageStyle"
  >
    <score-title-component
      v-if="$_isFirstPage"
      v-bind:score-metadata="score.metadata"
    />
    <v-btn
      text
      v-if="$_hasNoSection"
      v-on:click="generateNewSection($_numSections)"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <section-component
      v-for="(sectionDefinition, sectionIdx) of $_sectionDefinitions"
      v-bind:key="sectionIdx"
      v-bind:is-print-layout-enabled="isPrintLayoutEnabled"
      v-bind:score="score"
      v-bind:section-definition="sectionDefinition"
    />
    <score-footer-component
      class="mt-auto"
      v-bind:score-metadata="score.metadata"
      v-bind:score-page-index="scorePageIndex"
      v-bind:num-score-pages="numScorePages"
    />
  </v-sheet>
</template>

<style scoped>
#score-page {
  user-select: none;
  break-after: page;
  border: 1px #cccccc dotted;
}

@media print {
  #score-page {
    border: none !important;
    margin: 0 !important;
  }
}
</style>

<script>
import SectionComponent from '../components/SectionComponent.vue'
import { SectionDefinition } from '../components/SectionComponent.vue'
import ScoreTitleComponent from '../components/ScoreTitleComponent.vue'
import ScoreFooterComponent from '../components/ScoreFooterComponent.vue'
import Score from '../modules/Score.js'

class ScorePageCommonDefinition {
  constructor(whRatio = ScorePageCommonDefinition.whRatio.silver) {
    this.whRatio = whRatio;
  }
}

Object.defineProperty(
  ScorePageCommonDefinition,
  'whRatio',
  {
    value: { silver: (1 / 1.4142356) },
    writable: false,
  }
);


class ScorePageDefinition {
  constructor(
    firstSectionIdx,
    firstBarIdx,
    lastSectionIdx,
    lastBarIdx,
  )
  {
    this.firstSectionIdx = firstSectionIdx;
    this.firstBarIdx = firstBarIdx;
    this.lastSectionIdx = lastSectionIdx;
    this.lastBarIdx = lastBarIdx;
  }
}

export {
  ScorePageDefinition,
  ScorePageCommonDefinition,
}

export default {
  components: {
    ScoreTitleComponent,
    SectionComponent,
    ScoreFooterComponent,
  },

  props: {
    score: { type: Score, default: null },
    scorePageCommonDefinition: { type: ScorePageCommonDefinition, default: () => new ScorePageCommonDefinition() },
    scorePageDefinition: { type: ScorePageDefinition, default: null },
    scorePageIndex: { type: Number, default: 0 },
    numScorePages: { type: Number, default: 0 },
    isPrintLayoutEnabled: { type: Boolean, default: false },
  },

  computed: {
    $_isFirstPage() { return (this.scorePageIndex === 0) },

    $_hasNoSection() { return (this.$_numSections === 0) },

    $_numSections() { return this.score.sections.length },

    $_pageElevation() { return ((this.isPrintLayoutEnabled)? 0 : 3) },

    $_pageStyle() {
      let pageStyle = new Object();
      pageStyle.width = `${this.$store.state.config.pageWidthOnPrintPx}px`;
      pageStyle.aspectRatio = `${this.scorePageCommonDefinition.whRatio}`;
      return pageStyle;
    },

    $_sectionDefinitions() {
      let sectionDefinitions = new Array();
      if (this.score === null) return sectionDefinitions;
      if (this.$_numSections === 0) return sectionDefinitions;
      for (
        let currentSectionIdx = this.scorePageDefinition.firstSectionIdx;
        currentSectionIdx <= this.scorePageDefinition.lastSectionIdx;
        ++currentSectionIdx)
      {
        let firstBarIdxOfCurrentSection = 0;
        if (currentSectionIdx === this.scorePageDefinition.firstSectionIdx) {
          firstBarIdxOfCurrentSection = this.scorePageDefinition.firstBarIdx;
        }
        let lastBarIdxOfCurrentSection = this.score.getSection(currentSectionIdx).getLastBarIdx();
        if (currentSectionIdx === this.scorePageDefinition.lastSectionIdx) {
          lastBarIdxOfCurrentSection = this.scorePageDefinition.lastBarIdx;
        }
        let showBeatOnFirstBarOfCurrentSection = false;
        if (currentSectionIdx === 0) {
          showBeatOnFirstBarOfCurrentSection = true;
        } else {
          let firstBarValueOfCurrentSection = this.score.getBar(currentSectionIdx, firstBarIdxOfCurrentSection).value;
          let { sectionIdx: previousSectionIdx, barIdx: lastBarIdxOfPreviousSection } =
            this.score.getPreviousSectionAndBarIdx({ sectionIdx: currentSectionIdx, barIdx: firstBarIdxOfCurrentSection });
          let lastBarValueOfPreviousSection = this.score.getBar(previousSectionIdx, lastBarIdxOfPreviousSection).value;
          if (firstBarValueOfCurrentSection.numerator !== lastBarValueOfPreviousSection.numerator) {
            showBeatOnFirstBarOfCurrentSection = true;
          } else if (firstBarValueOfCurrentSection.denominator !== lastBarValueOfPreviousSection.denominator) {
            showBeatOnFirstBarOfCurrentSection = true;
          }
        }
        sectionDefinitions.push(new SectionDefinition(
          currentSectionIdx,
          firstBarIdxOfCurrentSection,
          lastBarIdxOfCurrentSection,
          showBeatOnFirstBarOfCurrentSection,
        ));
      }
      return sectionDefinitions;
    },
  },

  inject: [
    'unselectBar',
    'generateNewSection',
  ],
}
</script>