<template>
  <canvas
    id="key-signature-canvas"
    v-bind="$attrs"
    v-bind:style="$_style"
  />
</template>

<style scoped>
#key-signature-canvas {
  position: relative;
}
</style>

<script>
import CanvasBase from './mixins/CanvasBase.js';

const anchorHorizontalOffsetPx = 0;

export default {
  mixins: [
    CanvasBase,
  ],

  watch: {
    keyShiftAmount: {
      handler() { this.$_setDirty(true) },
      deep: true,
      immediate: true,
    },

    $_keySignatureWidthPx(newKeySignatureWidthPx) {
      this.$_setCanvasWidthPx(newKeySignatureWidthPx);
    },

    $_keySignatureHeightPx(newKeySignatureHeightPx) {
      this.$_setCanvasHeightPx(newKeySignatureHeightPx);
    },
  },

  mounted() {
    this.$_setCanvasWidthPx(this.$_keySignatureWidthPx);
    this.$_setCanvasHeightPx(this.$_keySignatureHeightPx);
  },

  props: {
    keyShiftAmount: { type: Number },
  },

  computed: {
    $_staffLineStepPx() { return this.$store.state.config.staffLineStepPx },
    $_keySignatureWidthPx() {
      switch (this.keyShiftAmount) {
        case 1:
          return 6;
        case -1:
          return 8;
        default:
          return null;
      } 
    },
    $_keySignatureHeightPx() {
      switch (this.keyShiftAmount) {
        case 1:
          return this.$_staffLineStepPx * 3;
        case -1:
          return this.$_staffLineStepPx * 3;
        default:
          return null;
      } 
    },
    $_anchorVerticalOffsetPx() {
      switch (this.keyShiftAmount) {
        case 1:
          return (this.$_staffLineStepPx * 1.5) + 0.5;
        case -1:
          return (this.$_staffLineStepPx * 2.5) + 0.5;
        default:
          return null;
      } 
    },
    $_marginTopPx() {
      switch (this.keyShiftAmount) {
        case 1:
          return -(this.$_staffLineStepPx * 1.5);
        case -1:
          return -(this.$_staffLineStepPx * 2.5);
        default:
          return null;
      } 
    },
    $_style() {
      return {
        marginTop: String(this.$_marginTopPx) + 'px',
        height: String(this.$_keySignatureHeightPx) + 'px',
        width: String(this.$_keySignatureWidthPx) + 'px',
      };
    },
  },

  methods: {
    /* public */
    draw() {
      this.$_draw(canvasElement => {
        let canvas = canvasElement.getContext('2d');
        switch (this.keyShiftAmount) {
          case 1:
            drawSharp(this, canvas);
            break;
          case -1:
            drawFlat(this, canvas);
            break;
        } 
      });

      function drawSharp(self, canvas) {
        let anchorVerticalOffsetPx = self.$_anchorVerticalOffsetPx;
        let staffLineStepPx = self.$_staffLineStepPx;
        let keySignatureWidthPx = self.$_keySignatureWidthPx;
        canvas.strokeStyle = self.color.getStyleString();
        canvas.fillStyle = self.color.getStyleString();
        canvas.lineWidth = 1;
        canvas.beginPath();
        canvas.moveTo(
          anchorHorizontalOffsetPx + 1.5,
          anchorVerticalOffsetPx - staffLineStepPx,
        );
        canvas.lineTo(
          anchorHorizontalOffsetPx + 1.5,
          anchorVerticalOffsetPx + staffLineStepPx * 7 / 6,
        );
        canvas.stroke();
        canvas.beginPath();
        canvas.moveTo(
          anchorHorizontalOffsetPx + keySignatureWidthPx - 1.5,
          anchorVerticalOffsetPx - staffLineStepPx * 7 / 6,
        );
        canvas.lineTo(
          anchorHorizontalOffsetPx + keySignatureWidthPx - 1.5,
          anchorVerticalOffsetPx + staffLineStepPx,
        );
        canvas.stroke();
        canvas.beginPath();
        canvas.moveTo(
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx + Math.round(staffLineStepPx * 4 / 6) + 0.5,
        );
        canvas.lineTo(
          anchorHorizontalOffsetPx + keySignatureWidthPx,
          anchorVerticalOffsetPx + Math.round(staffLineStepPx * 2 / 6) + 0.5,
        );
        canvas.lineTo(
          anchorHorizontalOffsetPx + keySignatureWidthPx,
          anchorVerticalOffsetPx + Math.round(staffLineStepPx * 1 / 6) + 0.5,
        );
        canvas.lineTo(
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx + Math.round(staffLineStepPx * 3 / 6) + 0.5,
        );
        canvas.fill();
        canvas.stroke();
        canvas.beginPath();
        canvas.moveTo(
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx - (Math.round(staffLineStepPx * 2 / 6) + 0.5),
        );
        canvas.lineTo(
          anchorHorizontalOffsetPx + keySignatureWidthPx,
          anchorVerticalOffsetPx - (Math.round(staffLineStepPx * 4 / 6) + 0.5),
        );
        canvas.lineTo(
          anchorHorizontalOffsetPx + keySignatureWidthPx,
          anchorVerticalOffsetPx - (Math.round(staffLineStepPx * 3 / 6) + 0.5),
        );
        canvas.lineTo(
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx - (Math.round(staffLineStepPx * 1 / 6) + 0.5),
        );
        canvas.fill();
        canvas.stroke();
      }

      function drawFlat(self, canvas) {
        let anchorVerticalOffsetPx = self.$_anchorVerticalOffsetPx;
        let staffLineStepPx = self.$_staffLineStepPx;
        canvas.strokeStyle = self.color.getStyleString();
        canvas.fillStyle = self.color.getStyleString();
        canvas.lineWidth = 1;
        canvas.beginPath();
        canvas.moveTo(
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx + staffLineStepPx / 2,
        );
        canvas.lineTo(
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx - staffLineStepPx * 10 / 6,
        );
        canvas.stroke();
        canvas.beginPath();
        canvas.moveTo(
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx + staffLineStepPx / 2 - 1,
        );
        canvas.bezierCurveTo(
          anchorHorizontalOffsetPx + staffLineStepPx,
          anchorVerticalOffsetPx - staffLineStepPx * 1 / 4,
          anchorHorizontalOffsetPx + staffLineStepPx / 2,
          anchorVerticalOffsetPx - staffLineStepPx,
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx - staffLineStepPx / 3,
        );
        canvas.bezierCurveTo(
          anchorHorizontalOffsetPx + staffLineStepPx * 1 / 2,
          anchorVerticalOffsetPx - staffLineStepPx * 4 / 5,
          anchorHorizontalOffsetPx + staffLineStepPx * 4 / 5,
          anchorVerticalOffsetPx,
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx + staffLineStepPx / 2 - 1,
        );
        canvas.stroke();
        canvas.fill();
      }
    },
  },
}
</script>