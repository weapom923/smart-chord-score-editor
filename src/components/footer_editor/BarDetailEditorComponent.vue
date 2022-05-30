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
      <grid-note-selector
        v-bind:value="$_selectedBar.gridNoteValue"
        v-on:update="$_onUpdateGridNoteValue"
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
import GridNoteSelector from '../parts/GridNoteSelector.vue';
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
    GridNoteSelector,
  },

  watch: {
    async '$_selectedBarsFirst'() { await this.$_updateSelectedBars() },
    async '$_selectedBarsLast'() { await this.$_updateSelectedBars() },
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
      return this.score.getBar(
        this.$_selectedBarsFirst.sectionIdx,
        this.$_selectedBarsFirst.barIdx,
      );
    },
  },

  inject: [
    'replaceBars',
  ],

  methods: {
    async $_getSelectedBars() {
      if (this.score === null) return new Array();
      return await this.score.getBars(
        this.$_selectedBarsFirst.sectionIdx,
        this.$_selectedBarsFirst.barIdx,
        this.$_selectedBarsLast.sectionIdx,
        this.$_selectedBarsLast.barIdx,
      );
    },

    async $_onChangeBarLineStart(newBarLineStart) {
      let selectedBars = await this.$_getSelectedBars();
      this.replaceBars(
        this.$_selectedBarsFirst.sectionIdx,
        this.$_selectedBarsFirst.barIdx,
        selectedBars.map(
          selectedBar => new Bar(
            selectedBar.value,
            selectedBar.parts,
            selectedBar.clef,
            selectedBar.scale,
            selectedBar.break,
            newBarLineStart,
            selectedBar.lineEnd,
            selectedBar.repeatEnding,
            selectedBar.gridNoteValue,
          ),
        ),
      );
    },

    async $_onChangeBarLineEnd(newBarLineEnd) {
      let selectedBars = await this.$_getSelectedBars();
      this.replaceBars(
        this.$_selectedBarsFirst.sectionIdx,
        this.$_selectedBarsFirst.barIdx,
        selectedBars.map(
          selectedBar => new Bar(
            selectedBar.value,
            selectedBar.parts,
            selectedBar.clef,
            selectedBar.scale,
            selectedBar.break,
            selectedBar.lineStart,
            newBarLineEnd,
            selectedBar.repeatEnding,
            selectedBar.gridNoteValue,
          ),
        ),
      );
    },

    async $_onChangeRepeatEnding(barRepeatEnding) {
      let selectedBars = await this.$_getSelectedBars();
      this.replaceBars(
        this.$_selectedBarsFirst.sectionIdx,
        this.$_selectedBarsFirst.barIdx,
        selectedBars.map(
          selectedBar => new Bar(
            selectedBar.value,
            selectedBar.parts,
            selectedBar.clef,
            selectedBar.scale,
            selectedBar.break,
            selectedBar.lineStart,
            selectedBar.lineEnd,
            barRepeatEnding,
            selectedBar.gridNoteValue,
          ),
        ),
      );
    },

    async $_onChangeBarBreak(barBreak) {
      let selectedBars = await this.$_getSelectedBars();
      this.replaceBars(
        this.$_selectedBarsFirst.sectionIdx,
        this.$_selectedBarsFirst.barIdx,
        selectedBars.map(
          selectedBar => new Bar(
            selectedBar.value,
            selectedBar.parts,
            selectedBar.clef,
            selectedBar.scale,
            barBreak,
            selectedBar.lineStart,
            selectedBar.lineEnd,
            selectedBar.repeatEnding,
            selectedBar.gridNoteValue,
          ),
        ),
      );
    },

    async $_onUpdateBarValue(barValue) {
      let selectedBars = await this.$_getSelectedBars();
      this.replaceBars(
        this.$_selectedBarsFirst.sectionIdx,
        this.$_selectedBarsFirst.barIdx,
        selectedBars.map(
          selectedBar => new Bar(
            barValue,
            selectedBar.parts,
            selectedBar.clef,
            selectedBar.scale,
            selectedBar.break,
            selectedBar.lineStart,
            selectedBar.lineEnd,
            selectedBar.repeatEnding,
            selectedBar.gridNoteValue,
          ),
        ),
      );
    },

    async $_onUpdateGridNoteValue(gridNoteValue) {
      let selectedBars = await this.$_getSelectedBars();
      this.replaceBars(
        this.$_selectedBarsFirst.sectionIdx,
        this.$_selectedBarsFirst.barIdx,
        selectedBars.map(
          selectedBar => new Bar(
            selectedBar.value,
            selectedBar.parts,
            selectedBar.clef,
            selectedBar.scale,
            selectedBar.break,
            selectedBar.lineStart,
            selectedBar.lineEnd,
            selectedBar.repeatEnding,
            gridNoteValue,
          ),
        ),
      );
    },

    async $_onUpdateClef(clef) {
      let selectedBars = await this.$_getSelectedBars();
      this.replaceBars(
        this.$_selectedBarsFirst.sectionIdx,
        this.$_selectedBarsFirst.barIdx,
        selectedBars.map(
          selectedBar => new Bar(
            selectedBar.value,
            selectedBar.parts,
            clef,
            selectedBar.scale,
            selectedBar.break,
            selectedBar.lineStart,
            selectedBar.lineEnd,
            selectedBar.repeatEnding,
            selectedBar.gridNoteValue,
          ),
        ),
      );
    },

    async $_onUpdateScale(scale) {
      let selectedBars = await this.$_getSelectedBars();
      this.replaceBars(
        this.$_selectedBarsFirst.sectionIdx,
        this.$_selectedBarsFirst.barIdx,
        selectedBars.map(
          selectedBar => new Bar(
            selectedBar.value,
            selectedBar.parts,
            selectedBar.clef,
            scale,
            selectedBar.break,
            selectedBar.lineStart,
            selectedBar.lineEnd,
            selectedBar.repeatEnding,
            selectedBar.gridNoteValue,
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