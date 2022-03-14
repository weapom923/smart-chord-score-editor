<template>
  <div
    id="beat-component"
    v-bind:style="$_style"
  >
    <div
      ref="numerator"
      id="numerator"
    >
      {{ $_numerator }}
    </div>
    <div
      ref="denominator"
      id="denominator"
    >
      {{ $_denominator }}
    </div>
  </div>
</template>

<style scoped>
#beat-component {
  display: flex;
  flex-direction: row;
  position: relative;
  margin-right: 5px;
}

#numerator {
  position: absolute;
  bottom: 0;
}

#denominator {
  position: absolute;
  top: 0;
}
</style>

<script>
import NoteValue from '../modules/NoteValue.js'
import utils from '../modules/utils.js'

export default {
  props: {
    barValue: { type: NoteValue, default: null },
  },

  data() {
    return {
      $_numeratorElement: null,
      $_denominatorElement: null,
      $_beatComponentContainerWidthPx: null,
    };
  },

  mounted() {
    this.$data.$_numeratorElement = this.$refs['numerator'];
    this.$data.$_denominatorElement = this.$refs['denominator'];
    this.$_updateBeatComponentContainerSize();
  },

  computed: {
    $_numerator() {
      if (this.barValue === null) return null;
      return this.barValue.numerator;
    },

    $_denominator() {
      if (this.barValue === null) return null;
      return this.barValue.denominator;
    },

    $_style() {
      return {
        fontSize: String(this.$store.state.config.staffLineStepPx * 2) + 'px',
        lineHeight: String(this.$store.state.config.staffLineStepPx * 2) + 'px',
        width: String(this.$data.$_beatComponentContainerWidthPx) + 'px',
      };
    },
  },

  methods: {
    $_updateBeatComponentContainerSize() {
      this.$data.$_beatComponentContainerWidthPx = utils.max(
        this.$data.$_numeratorElement.clientWidth,
        this.$data.$_denominatorElement.clientWidth,
      );
    },
  },
}
</script>