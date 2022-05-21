<template>
  <v-toolbar tile dense>
    <div class="container" id="bar-editor-toolbar">
      <div>
        <span>
          <span class="section-index">{{ selectedBarsFirst.sectionIdx + 1 }}</span>
          <span class="section-title">{{ $_firstSection.name }}</span>
          <span>bar-{{ selectedBarsFirst.barIdx + 1 }}</span>
        </span>
        <span class="connector-symbol" v-if="$_areMultipleBarsSelected" />
        <span v-if="$_areMultipleBarsSelected">
          <span class="section-index">{{ selectedBarsLast.sectionIdx + 1 }}</span>
          <span class="section-title">{{ $_lastSection.name }}</span>
          <span>bar-{{ selectedBarsLast.barIdx + 1 }}</span>
        </span>
      </div>
      <div v-if="$_areMultipleBarsSelected">({{ $_numSelectedBars }} bars selected)</div>
      <v-spacer />
      <part-type-selector
        id="part-type-selector"
        v-if="!$_areMultipleBarsSelected"
        v-model="selectedPartIdx"
        v-bind:bar="$_firstBar"
      />
    </div>
  </v-toolbar>
</template>

<style scoped>
#bar-editor-toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
}

#bar-editor-toolbar div:not(:last-child) {
  margin-right: 10px;
}

#bar-editor-toolbar div {
  font-size: 12px;
  line-height: 12px;
}

#bar-editor-toolbar div span:not(:last-child) {
  margin-right: 5px;
}

.section-title {
  font-size: 14px;
  line-height: 14px;
}

.section-index {
  font-size: 10px;
  line-height: 10px;
}

.section-index:before {
  content: '[';
}

.section-index:after {
  content: ']';
}

.connector-symbol:after {
  padding: 0 5px;
}

.connector-symbol:after {
  content: '-';
}

#part-type-selector {
  flex-grow: 0;
  width: 20%;
  min-width: 100px;
}
</style>

<script>
import PartTypeSelector from '../parts/BarPartTypeSelector.vue';
import Score from '../../modules/Score.js'
import SectionAndBarIdx from '../../modules/SectionAndBarIdx.js'

export default {
  components: {
    PartTypeSelector,
  },

  props: {
    score: { type: Score },
    selectedBarsFirst: { type: SectionAndBarIdx },
    selectedBarsLast: { type: SectionAndBarIdx },
    selectedPartIdx: { type: Number },
  },

  computed: {
    $_firstSection() {
      return this.score.getSection(this.selectedBarsFirst.sectionIdx);
    },

    $_firstBar() {
      return this.score.getBar(this.selectedBarsFirst.sectionIdx, this.selectedBarsFirst.barIdx);
    },

    $_lastSection() {
      return this.score.getSection(this.selectedBarsLast.sectionIdx);
    },

    $_lastBar() {
      return this.score.getBar(this.selectedBarsLast.sectionIdx, this.selectedBarsLast.barIdx);
    },

    $_areMultipleBarsSelected() {
      return !this.selectedBarsFirst.isEqualTo(this.selectedBarsLast);
    },

    $_numSelectedBars() {
      let numSelectedBars = 0;
      let sectionIdx = this.selectedBarsFirst.sectionIdx;
      let barIdx = this.selectedBarsFirst.barIdx;
      while ((sectionIdx !== this.selectedBarsLast.sectionIdx) || (barIdx !== this.selectedBarsLast.barIdx)) {
        ++numSelectedBars;
        ({ sectionIdx, barIdx } = this.score.getNextSectionAndBarIdx({ sectionIdx, barIdx }));
      }
      return numSelectedBars + 1;
    },

    $_selectedPartIdx: {
      get() { return this.selectedPartIdx },
      set(selectedPartIdx) { this.$emit('update-selected-part-idx', selectedPartIdx) },
    },
  },
}
</script>