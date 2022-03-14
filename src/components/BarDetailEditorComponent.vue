<template>
  <v-card v-bind="$attrs">
    <v-card-text class="pa-0">
      <v-card-subtitle>Bar Line(Begin)</v-card-subtitle>
      <bar-line-start-selector-buttons
        v-bind:bar-line-start="$_selectedBar.lineStart"
        v-on:change="$_onChangeBarLineStart"
      />
      <v-card-subtitle>Bar Line(End)</v-card-subtitle>
      <bar-line-end-selector-buttons
        v-bind:bar-line-end="$_selectedBar.lineEnd"
        v-on:change="$_onChangeBarLineEnd"
      />
      <v-card-subtitle>Terminate System</v-card-subtitle>
      <div class="d-flex justify-center">
        <v-switch
          dense hide-details
          v-bind:value="$_selectedBar.terminatesSystem"
          v-on:change="$_onChangeTerminatesSystem"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import BarLineStartSelectorButtons from '../parts/BarLineStartSelectorButtons.vue'
import BarLineEndSelectorButtons from '../parts/BarLineEndSelectorButtons.vue'
import Bar from '../modules/Bar.js'

export default {
  components: {
    BarLineStartSelectorButtons,
    BarLineEndSelectorButtons,
  },

  computed: {
    $_score() {
      return this.$store.state.score;
    },

    $_selectedSectionIdx() {
      return this.$store.state.selectedSectionIdx;
    },

    $_selectedBarIdx() {
      return this.$store.state.selectedBarIdx;
    },

    $_selectedBar() {
      if (this.$score === null) return null;
      return this.$_score.sections[this.$_selectedSectionIdx].bars[this.$_selectedBarIdx];
    },
  },

  methods: {
    $_onChangeBarLineStart(newBarLineStart) {
      let newBar = new Bar(
        this.$_selectedBar.value,
        this.$_selectedBar.parts,
        this.$_selectedBar.clef,
        this.$_selectedBar.scale,
        this.$_selectedBar.terminatesSystem,
        newBarLineStart,
        this.$_selectedBar.lineEnd,
      );
      this.$emit('replace-bar', this.$_selectedSectionIdx, this.$_selectedBarIdx, newBar);
    },

    $_onChangeBarLineEnd(newBarLineEnd) {
      let newBar = new Bar(
        this.$_selectedBar.value,
        this.$_selectedBar.parts,
        this.$_selectedBar.clef,
        this.$_selectedBar.scale,
        this.$_selectedBar.terminatesSystem,
        this.$_selectedBar.lineStart,
        newBarLineEnd,
      );
      this.$emit('replace-bar', this.$_selectedSectionIdx, this.$_selectedBarIdx, newBar);
    },

    $_onChangeTerminatesSystem(terminatesSystem) {
      let newBar = new Bar(
        this.$_selectedBar.value,
        this.$_selectedBar.parts,
        this.$_selectedBar.clef,
        this.$_selectedBar.scale,
        terminatesSystem,
        this.$_selectedBar.lineStart,
        this.$_selectedBar.lineEnd,
      );
      this.$emit('replace-bar', this.$_selectedSectionIdx, this.$_selectedBarIdx, newBar);
    },
  },
}
</script>