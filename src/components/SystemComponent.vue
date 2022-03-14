<template>
  <div id="system">
    <bar-component
      v-for="barIdx of $_barIdcs"
      v-bind:key="barIdx"
      v-bind:section-idx="sectionIdx"
      v-bind:bar-idx="barIdx"
      v-bind:staff-background-color="$_getStaffBackgroundColor(barIdx)"
      v-bind:showBeat="$_getShowBeat(barIdx)"
      v-bind:margin-top-px="$data.$_marginTopPxMax"
      v-bind:margin-bottom-px="$data.$_marginBottomPxMax"
      v-on:sub-component-elements-update="$_onSubComponentElementsUpdate(barIdx, $event)"
      v-on:margin-top-px-update="$_onMarginTopPxUpdate(barIdx, $event)"
      v-on:margin-bottom-px-update="$_onMarginBottomPxUpdate(barIdx, $event)"
    />
  </div>
</template>

<style scoped>
#system {
  display: flex;
  flex-direction: row;
  width: 100%;
}

#system * {
  flex-grow: 1;
}
</style>

<script>
import BarComponent from '../components/BarComponent.vue'
import Color from '../modules/Color.js';
import utils from '../modules/utils.js';

const selectedBarStaffColor = new Color(0, 0, 0, 0.2);

export default {
  components: {
    BarComponent,
  },

  props: {
    sectionIdx: { type: Number, default: null },
    systemFirstBarIdx: { type: Number, default: null },
    systemLastBarIdx: { type: Number, default: null },
    showBeatOnFirstBar: { type: Boolean, default: false },
  },

  data() {
    return {
      $_marginTopPxMax: 0,
      $_marginBottomPxMax: 0,
      $_marginTopPx: new Object(),
      $_marginBottomPx: new Object(),
    };
  },

  computed: {
    $_score() {
      return this.$store.state.score;
    },

    $_section() {
      if (this.$_score === null) return null;
      return this.$_score.sections[this.sectionIdx];
    },

    $_barIdcs() {
      let barIdcs = new Array();
      if (this.$_score === null) return barIdcs;
      if (this.systemFirstBarIdx === null) return barIdcs;
      if (this.systemLastBarIdx === null) return barIdcs;
      for (let barIdx = this.systemFirstBarIdx; barIdx <= this.systemLastBarIdx; ++barIdx) {
        barIdcs.push(barIdx);
      }
      return barIdcs;
    },
  },

  methods: {
    $_getStaffBackgroundColor(barIdx) {
      if (this.$store.state.selectedSectionIdx !== this.sectionIdx) return null;
      if (this.$store.state.selectedBarIdx !== barIdx) return null;
      return selectedBarStaffColor;
    },

    $_getShowBeat(barIdx) {
      if (barIdx === 0) {
        return this.showBeatOnFirstBar;
      } else {
        let currentBar = this.$_section.bars[barIdx].value;
        let previousBar = this.$_section.bars[barIdx - 1].value;
        if (currentBar.numerator !== previousBar.numerator) return true;
        if (currentBar.denominator !== previousBar.denominator) return true;
        return false;
      }
    },

    $_onMarginTopPxUpdate(barIdx, marginTopPx) {
      if (marginTopPx === null) {
        this.$delete(this.$data.$_marginTopPx, barIdx);
      } else {
        this.$set(this.$data.$_marginTopPx, barIdx, marginTopPx);
      }
      this.$nextTick(() => {
        this.$data.$_marginTopPxMax = utils.max(...Object.values(this.$data.$_marginTopPx));
      });
    },

    $_onMarginBottomPxUpdate(barIdx, marginBottomPx) {
      if (marginBottomPx === null) {
        this.$delete(this.$data.$_marginBottomPx, barIdx);
      } else {
        this.$set(this.$data.$_marginBottomPx, barIdx, marginBottomPx);
      }
      this.$nextTick(() => {
        this.$data.$_marginBottomPxMax = utils.max(...Object.values(this.$data.$_marginBottomPx));
      });
    },
  },
}
</script>