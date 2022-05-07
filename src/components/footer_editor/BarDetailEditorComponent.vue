<template>
  <v-card v-bind="$attrs">
    <v-card-text class="pa-2">
      <bar-line-start-selector
        v-bind:bar-line-start="$_selectedBar.lineStart"
        v-on:change="$_onChangeBarLineStart"
      />
      <bar-line-end-selector
        v-bind:bar-line-end="$_selectedBar.lineEnd"
        v-on:change="$_onChangeBarLineEnd"
      />
      <bar-repeat-ending-number-selector
        v-bind:bar-repeat-ending="$_selectedBar.repeatEnding"
        v-on:change="$_onChangeRepeatEnding"
      />
      <bar-break-selector
        v-bind:bar-break="$_selectedBar.break"
        v-on:change="$_onChangeBarBreak"
      />
      <bar-value-text-area-and-selector
        v-bind:value="$_selectedBar.value"
        v-on:update="$_onUpdateBarValue"
        v-on:update:error="$_onUpdateBarValueError"
      />
      <clef-selector
        v-bind:value="$_selectedBar.clef"
        v-on:update="$_onUpdateClef"
        label="Clef Sign"
      />
      <scale-selector
        v-bind:value="$_selectedBar.scale"
        v-on:update="$_onUpdateScale"
      />
    </v-card-text>
  </v-card>
</template>

<script>
import ScaleSelector from '../parts/ScaleSelector.vue';
import ClefSelector from '../parts/ClefSelector.vue';
import BarBreakSelector from '../parts/BarBreakSelector.vue';
import BarRepeatEndingNumberSelector from '../parts/BarRepeatEndingNumberSelector.vue';
import BarLineStartSelector from '../parts/BarLineStartSelector.vue';
import BarLineEndSelector from '../parts/BarLineEndSelector.vue';
import BarValueTextAreaAndSelector from '../parts/BarValueTextAreaAndSelector.vue';
import Score from '../../modules/Score.js';
import Bar from '../../modules/Bar.js';

export default {
  components: {
    ScaleSelector,
    ClefSelector,
    BarBreakSelector,
    BarRepeatEndingNumberSelector,
    BarLineStartSelector,
    BarLineEndSelector,
    BarValueTextAreaAndSelector,
  },

  props: {
    score: { type: Score },
  },

  data() {
    return {
      $_barValueIsInvalid: false,
    };
  },

  computed: {
    $_selectedBarsFirst() {
      return this.$store.state.selectedBarsFirst;
    },

    $_selectedBarsLast() {
      return this.$store.state.selectedBarsLast;
    },

    $_selectedBar() {
      if (this.score === null) return null;
      return this.score.sections[this.$_selectedBarsFirst.sectionIdx].bars[this.$_selectedBarsFirst.barIdx];
    },

    $_selectedBars() {
      if (this.score === null) return new Array();
      return this.score.getBars(
        this.$_selectedBarsFirst.sectionIdx,
        this.$_selectedBarsFirst.barIdx,
        this.$_selectedBarsLast.sectionIdx,
        this.$_selectedBarsLast.barIdx,
      );
    },
  },

  inject: [
    'replaceBars',
  ],

  methods: {
    $_onChangeBarLineStart(newBarLineStart) {
      this.replaceBars(
        this.$_selectedBarsFirst.sectionIdx,
        this.$_selectedBarsFirst.barIdx,
        this.$_selectedBars.map(
          selectedBar => new Bar(
            selectedBar.value,
            selectedBar.parts,
            selectedBar.clef,
            selectedBar.scale,
            selectedBar.break,
            newBarLineStart,
            selectedBar.lineEnd,
            selectedBar.repeatEnding,
          ),
        ),
      );
    },

    $_onChangeBarLineEnd(newBarLineEnd) {
      this.replaceBars(
        this.$_selectedBarsFirst.sectionIdx,
        this.$_selectedBarsFirst.barIdx,
        this.$_selectedBars.map(
          selectedBar => new Bar(
            selectedBar.value,
            selectedBar.parts,
            selectedBar.clef,
            selectedBar.scale,
            selectedBar.break,
            selectedBar.lineStart,
            newBarLineEnd,
            selectedBar.repeatEnding,
          ),
        ),
      );
    },

    $_onChangeRepeatEnding(barRepeatEnding) {
      this.replaceBars(
        this.$_selectedBarsFirst.sectionIdx,
        this.$_selectedBarsFirst.barIdx,
        this.$_selectedBars.map(
          selectedBar => new Bar(
            selectedBar.value,
            selectedBar.parts,
            selectedBar.clef,
            selectedBar.scale,
            selectedBar.break,
            selectedBar.lineStart,
            selectedBar.lineEnd,
            barRepeatEnding,
          ),
        ),
      );
    },

    $_onChangeBarBreak(barBreak) {
      this.replaceBars(
        this.$_selectedBarsFirst.sectionIdx,
        this.$_selectedBarsFirst.barIdx,
        this.$_selectedBars.map(
          selectedBar => new Bar(
            selectedBar.value,
            selectedBar.parts,
            selectedBar.clef,
            selectedBar.scale,
            barBreak,
            selectedBar.lineStart,
            selectedBar.lineEnd,
            selectedBar.repeatEnding,
          ),
        ),
      );
    },

    $_onUpdateBarValue(barValue) {
      this.replaceBars(
        this.$_selectedBarsFirst.sectionIdx,
        this.$_selectedBarsFirst.barIdx,
        this.$_selectedBars.map(
          selectedBar => new Bar(
            barValue,
            selectedBar.parts,
            selectedBar.clef,
            selectedBar.scale,
            selectedBar.break,
            selectedBar.lineStart,
            selectedBar.lineEnd,
            selectedBar.repeatEnding,
          ),
        ),
      );
    },

    $_onUpdateClef(clef) {
      this.replaceBars(
        this.$_selectedBarsFirst.sectionIdx,
        this.$_selectedBarsFirst.barIdx,
        this.$_selectedBars.map(
          selectedBar => new Bar(
            selectedBar.value,
            selectedBar.parts,
            clef,
            selectedBar.scale,
            selectedBar.break,
            selectedBar.lineStart,
            selectedBar.lineEnd,
            selectedBar.repeatEnding,
          ),
        ),
      );
    },

    $_onUpdateScale(scale) {
      this.replaceBars(
        this.$_selectedBarsFirst.sectionIdx,
        this.$_selectedBarsFirst.barIdx,
        this.$_selectedBars.map(
          selectedBar => new Bar(
            selectedBar.value,
            selectedBar.parts,
            selectedBar.clef,
            scale,
            selectedBar.break,
            selectedBar.lineStart,
            selectedBar.lineEnd,
            selectedBar.repeatEnding,
          ),
        ),
      );
    },

    $_onUpdateBarValueError(isErrorOccured) {
      this.$data.$_barValueIsInvalid = isErrorOccured;
    },
  },
}
</script>