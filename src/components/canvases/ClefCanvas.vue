<template>
  <canvas
    id="clef-canvas"
    v-bind="$attrs"
    v-bind:style="$_style"
  />
</template>

<style scoped>
#clef-canvas {
  position: relative;
  margin-left: 2px;
  margin-right: 2px;
}
</style>

<script>
import CanvasBase from './mixins/CanvasBase.js';
import Clef from '../../modules/Clef.js';

export default {
  mixins: [
    CanvasBase,
  ],

  watch: {
    Clef: {
      handler() { this.$_setDirty(true) },
      deep: true,
      immediate: true,
    },

    $_clefWidthPx(newClefWidthPx) {
      this.$_setCanvasWidthPx(newClefWidthPx);
    },

    $_clefHeightPx(newClefHeightPx) {
      this.$_setCanvasHeightPx(newClefHeightPx);
    },
  },

  mounted() {
    this.$_setCanvasWidthPx(this.$_clefWidthPx);
    this.$_setCanvasHeightPx(this.$_clefHeightPx);
  },

  props: {
    clef: { type: Clef },
  },

  computed: {
    $_staffLineStepPx() { return this.$store.state.config.staffLineStepPx },
    $_clefWidthPx() { return this.$_staffLineStepPx * 3 },
    $_clefHeightPx() {
      switch (this.clef) {
        case Clef.treble:
          return this.$_staffLineStepPx * 8 + 1;
        case Clef.bass:
          return this.$_staffLineStepPx * 4 + 1;
        default:
          return null;
      } 
    },
    $_anchorHorizontalOffsetPx() {
      switch (this.clef) {
        case Clef.treble:
          return this.$_staffLineStepPx * 1.6;
        case Clef.bass:
          return this.$_staffLineStepPx * 0.6;
        default:
          return null;
      } 
    },
    $_anchorVerticalOffsetPx() {
      switch (this.clef) {
        case Clef.treble:
          return this.$_staffLineStepPx * 5 + 1;
        case Clef.bass:
          return this.$_staffLineStepPx * 1 + 1;
        default:
          return null;
      } 
    },
    $_marginTopPx() {
      switch (this.clef) {
        case Clef.treble:
          return -(this.$_staffLineStepPx * 4 + 1);
        case Clef.bass:
          return -(this.$_staffLineStepPx * 2 + 1);
        default:
          return null;
      } 
    },
    $_marginBottomPx() {
      switch (this.clef) {
        case Clef.treble:
          return -this.$_staffLineStepPx * 4 + 1;
        case Clef.bass:
          return -this.$_staffLineStepPx * 2 + 1;
        default:
          return null;
      } 
    },
    $_style() {
      return {
        marginTop: String(this.$_marginTopPx) + 'px',
        marginBottom: String(this.$_marginTopPx) + 'px',
        height: String(this.$_clefHeightPx) + 'px',
        width: String(this.$_clefWidthPx) + 'px',
      };
    },
  },

  methods: {
    /* public */
    draw() {
      this.$_draw(canvasElement => {
        let canvas = canvasElement.getContext('2d');
        switch (this.clef) {
          case Clef.treble:
            drawTrebleClef(this, canvas);
            break;
          case Clef.bass:
            drawBassClef(this, canvas);
            break;
        } 
      });

      function drawTrebleClef(self, canvas) {
        let anchorHorizontalOffsetPx = self.$_anchorHorizontalOffsetPx;
        let anchorVerticalOffsetPx = self.$_anchorVerticalOffsetPx;
        let staffLineStepPx = self.$_staffLineStepPx;
        canvas.strokeStyle = self.color.getStyleString();
        canvas.fillStyle = self.color.getStyleString();
        canvas.lineWidth = 1;
        canvas.beginPath();
        canvas.moveTo(
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx,
        );
        canvas.bezierCurveTo(
          anchorHorizontalOffsetPx - staffLineStepPx,
          anchorVerticalOffsetPx + staffLineStepPx * 0.5,
          anchorHorizontalOffsetPx - staffLineStepPx,
          anchorVerticalOffsetPx - staffLineStepPx,
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx - staffLineStepPx,
        );
        canvas.bezierCurveTo(
          anchorHorizontalOffsetPx + staffLineStepPx * 1.2,
          anchorVerticalOffsetPx - staffLineStepPx,
          anchorHorizontalOffsetPx + staffLineStepPx * 1.2,
          anchorVerticalOffsetPx + staffLineStepPx * 0.8,
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx + staffLineStepPx,
        );
        canvas.bezierCurveTo(
          anchorHorizontalOffsetPx + staffLineStepPx,
          anchorVerticalOffsetPx + staffLineStepPx * 0.8,
          anchorHorizontalOffsetPx + staffLineStepPx,
          anchorVerticalOffsetPx - staffLineStepPx * 0.7,
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx - staffLineStepPx * 0.7,
        );
        canvas.bezierCurveTo(
          anchorHorizontalOffsetPx - staffLineStepPx * 0.8,
          anchorVerticalOffsetPx - staffLineStepPx * 0.7,
          anchorHorizontalOffsetPx - staffLineStepPx * 0.8,
          anchorVerticalOffsetPx + staffLineStepPx * 0.5,
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx,
        );
        canvas.stroke();
        canvas.fill();
        canvas.beginPath();
        canvas.moveTo(
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx + staffLineStepPx,
        );
        canvas.bezierCurveTo(
          anchorHorizontalOffsetPx - staffLineStepPx * 0.7,
          anchorVerticalOffsetPx + staffLineStepPx,
          anchorHorizontalOffsetPx - staffLineStepPx * 1.5,
          anchorVerticalOffsetPx + staffLineStepPx,
          anchorHorizontalOffsetPx - staffLineStepPx * 1.5,
          anchorVerticalOffsetPx - staffLineStepPx * 0.5,
        );
        canvas.stroke();
        canvas.beginPath();
        canvas.bezierCurveTo(
          anchorHorizontalOffsetPx - staffLineStepPx * 1.45,
          anchorVerticalOffsetPx - staffLineStepPx * 0.5,
          anchorHorizontalOffsetPx - staffLineStepPx * 1.4,
          anchorVerticalOffsetPx - staffLineStepPx,
          anchorHorizontalOffsetPx - staffLineStepPx * 0.5,
          anchorVerticalOffsetPx - staffLineStepPx * 2,
        );
        canvas.lineTo(
          anchorHorizontalOffsetPx + staffLineStepPx * 0.5,
          anchorVerticalOffsetPx - staffLineStepPx * 3,
        );
        canvas.bezierCurveTo(
          anchorHorizontalOffsetPx + staffLineStepPx * 0.6,
          anchorVerticalOffsetPx - staffLineStepPx * 3.5,
          anchorHorizontalOffsetPx + staffLineStepPx * 0.6,
          anchorVerticalOffsetPx - staffLineStepPx * 3.5,
          anchorHorizontalOffsetPx + staffLineStepPx * 0.4,
          anchorVerticalOffsetPx - staffLineStepPx * 4,
        );
        canvas.bezierCurveTo(
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx - staffLineStepPx * 4,
          anchorHorizontalOffsetPx - staffLineStepPx * 0.2,
          anchorVerticalOffsetPx - staffLineStepPx * 3.5,
          anchorHorizontalOffsetPx - staffLineStepPx * 0.2,
          anchorVerticalOffsetPx - staffLineStepPx * 3,
        );
        canvas.quadraticCurveTo(
          anchorHorizontalOffsetPx - staffLineStepPx * 0.2,
          anchorVerticalOffsetPx - staffLineStepPx * 4.6,
          anchorHorizontalOffsetPx + staffLineStepPx * 0.4,
          anchorVerticalOffsetPx - staffLineStepPx * 4.8,
        );
        canvas.quadraticCurveTo(
          anchorHorizontalOffsetPx + staffLineStepPx * 1,
          anchorVerticalOffsetPx - staffLineStepPx * 3.3,
          anchorHorizontalOffsetPx + staffLineStepPx * 0.3,
          anchorVerticalOffsetPx - staffLineStepPx * 2.4,
        );
        canvas.lineTo(
          anchorHorizontalOffsetPx - staffLineStepPx * 0.6,
          anchorVerticalOffsetPx - staffLineStepPx * 1.5,
        );
        canvas.bezierCurveTo(
          anchorHorizontalOffsetPx - staffLineStepPx * 1,
          anchorVerticalOffsetPx - staffLineStepPx,
          anchorHorizontalOffsetPx - staffLineStepPx * 1.4,
          anchorVerticalOffsetPx - staffLineStepPx * 0.5,
          anchorHorizontalOffsetPx - staffLineStepPx * 1.5,
          anchorVerticalOffsetPx,
        );
        canvas.stroke();
        canvas.fill();
        canvas.beginPath();
        canvas.moveTo(
          anchorHorizontalOffsetPx - staffLineStepPx * 0.2,
          anchorVerticalOffsetPx - staffLineStepPx * 3,
        );
        canvas.lineTo(
          anchorHorizontalOffsetPx + staffLineStepPx * 0.2,
          anchorVerticalOffsetPx + staffLineStepPx * 1,
        );
        canvas.quadraticCurveTo(
          anchorHorizontalOffsetPx + staffLineStepPx * 0.3,
          anchorVerticalOffsetPx + staffLineStepPx * 1.5,
          anchorHorizontalOffsetPx + staffLineStepPx * 0.2,
          anchorVerticalOffsetPx + staffLineStepPx * 1.8,
        );
        canvas.quadraticCurveTo(
          anchorHorizontalOffsetPx - staffLineStepPx * 0.3,
          anchorVerticalOffsetPx + staffLineStepPx * 2.4,
          anchorHorizontalOffsetPx - staffLineStepPx * 0.8,
          anchorVerticalOffsetPx + staffLineStepPx * 2,
        );
        canvas.stroke();
        canvas.beginPath();
        canvas.arc(
          anchorHorizontalOffsetPx - staffLineStepPx * 0.7,
          anchorVerticalOffsetPx + staffLineStepPx * 1.8,
          staffLineStepPx * 0.3, 0, 2 * Math.PI);
        canvas.fill();
      }

      function drawBassClef(self, canvas) {
        let anchorHorizontalOffsetPx = self.$_anchorHorizontalOffsetPx;
        let anchorVerticalOffsetPx = self.$_anchorVerticalOffsetPx;
        let staffLineStepPx = self.$_staffLineStepPx;
        canvas.strokeStyle = self.color.getStyleString();
        canvas.fillStyle = self.color.getStyleString();
        canvas.lineWidth = 1;
        canvas.beginPath();
        canvas.arc(
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx,
          staffLineStepPx * 0.3, 0, 2 * Math.PI);
        canvas.stroke();
        canvas.fill();
        canvas.beginPath();
        canvas.moveTo(
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx,
        );
        canvas.bezierCurveTo(
          anchorHorizontalOffsetPx - staffLineStepPx * 0.8,
          anchorVerticalOffsetPx + staffLineStepPx * 0.5,
          anchorHorizontalOffsetPx - staffLineStepPx * 0.5,
          anchorVerticalOffsetPx - staffLineStepPx * 1.2,
          anchorHorizontalOffsetPx + staffLineStepPx * 0.5,
          anchorVerticalOffsetPx - staffLineStepPx,
        );
        canvas.stroke();
        canvas.beginPath();
        canvas.moveTo(
          anchorHorizontalOffsetPx + staffLineStepPx * 0.5,
          anchorVerticalOffsetPx - staffLineStepPx,
        );
        canvas.bezierCurveTo(
          anchorHorizontalOffsetPx + staffLineStepPx * 1.2,
          anchorVerticalOffsetPx - staffLineStepPx,
          anchorHorizontalOffsetPx + staffLineStepPx * 1.5,
          anchorVerticalOffsetPx - staffLineStepPx * 0.5,
          anchorHorizontalOffsetPx + staffLineStepPx * 1.5,
          anchorVerticalOffsetPx,
        );
        canvas.bezierCurveTo(
          anchorHorizontalOffsetPx + staffLineStepPx * 1.5,
          anchorVerticalOffsetPx + staffLineStepPx,
          anchorHorizontalOffsetPx + staffLineStepPx * 0.5,
          anchorVerticalOffsetPx + staffLineStepPx * 2.2,
          anchorHorizontalOffsetPx - staffLineStepPx * 0.4,
          anchorVerticalOffsetPx + staffLineStepPx * 2.2,
        );
        canvas.bezierCurveTo(
          anchorHorizontalOffsetPx + staffLineStepPx * 0.4,
          anchorVerticalOffsetPx + staffLineStepPx * 2.2,
          anchorHorizontalOffsetPx + staffLineStepPx * 1.2,
          anchorVerticalOffsetPx + staffLineStepPx,
          anchorHorizontalOffsetPx + staffLineStepPx * 1.2,
          anchorVerticalOffsetPx,
        );
        canvas.bezierCurveTo(
          anchorHorizontalOffsetPx + staffLineStepPx * 1.2,
          anchorVerticalOffsetPx - staffLineStepPx * 0.3,
          anchorHorizontalOffsetPx + staffLineStepPx * 1.1,
          anchorVerticalOffsetPx - staffLineStepPx * 0.8,
          anchorHorizontalOffsetPx + staffLineStepPx * 0.5,
          anchorVerticalOffsetPx - staffLineStepPx,
        );
        canvas.stroke();
        canvas.fill();
        canvas.beginPath();
        canvas.arc(
          anchorHorizontalOffsetPx + staffLineStepPx * 1.9,
          anchorVerticalOffsetPx - staffLineStepPx * 0.5,
          staffLineStepPx * 0.1, 0, 2 * Math.PI);
        canvas.stroke();
        canvas.fill();
        canvas.beginPath();
        canvas.arc(
          anchorHorizontalOffsetPx + staffLineStepPx * 1.9,
          anchorVerticalOffsetPx + staffLineStepPx * 0.5,
          staffLineStepPx * 0.1, 0, 2 * Math.PI);
        canvas.stroke();
        canvas.fill();
      }
    },

    /* private */
  },
}
</script>