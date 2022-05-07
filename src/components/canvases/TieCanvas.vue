<template>
  <canvas
    ref="canvas"
    v-bind="$attrs"
    v-bind:style="$_style"
  />
</template>

<script>
import CanvasBase from './mixins/CanvasBase.js';
import utils from '../../modules/utils.js'

const tieTopMarginPx = 5;

export default {
  mixins: [
    CanvasBase,
  ],

  watch: {
    startVerticalOffsetPx: {
      handler() { this.$_setDirty(true) },
      deep: true,
      immediate: true,
    },

    endVerticalOffsetPx: {
      handler() { this.$_setDirty(true) },
      deep: true,
      immediate: true,
    },

    $_tieWidthPx(newTieWidthPx) {
      this.$_setCanvasWidthPx(newTieWidthPx);
    },

    $_tieHeightPx(newTieHeightPx) {
      this.$_setCanvasHeightPx(newTieHeightPx);
    },
  },

  mounted() {
    this.$_setCanvasWidthPx(this.widthPx);
    this.$_setCanvasHeightPx(this.$_tieHeightPx);
  },

  props: {
    startVerticalOffsetPx: { type: Number },
    endVerticalOffsetPx: { type: Number },
    widthPx: { type: Number },
  },

  computed: {
    $_tieWidthPx() { return this.widthPx },
    $_tieHeightPx() { return utils.max(-this.startVerticalOffsetPx, -this.endVerticalOffsetPx) + tieTopMarginPx },
    $_style() {
      return {
        marginTop: String(-this.$_tieHeightPx) + 'px',
        height: String(this.$_tieHeightPx) + 'px',
        width: String(this.$_tieWidthPx) + 'px',
      };
    },
  },

  methods: {
    /* public */
    draw() {
      this.$_draw(canvasElement => {
        let canvas = canvasElement.getContext('2d');
        canvas.strokeStyle = this.color.getStyleString();
        canvas.lineWidth = 1;
        canvas.beginPath();
        canvas.moveTo(
          0,
          this.$_tieHeightPx + this.startVerticalOffsetPx,
        );
        canvas.bezierCurveTo(
          this.$_tieWidthPx / 2,
          0,
          this.$_tieWidthPx / 2,
          0,
          this.$_tieWidthPx,
          this.$_tieHeightPx + this.endVerticalOffsetPx,
        );
        canvas.stroke();
      });
    },
  },
}
</script>