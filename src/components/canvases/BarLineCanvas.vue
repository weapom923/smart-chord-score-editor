<template>
  <canvas
    ref="canvas"
    v-bind="$attrs"
    v-bind:style="$_style"
  />
</template>

<script>
import CanvasBase from './mixins/CanvasBase.js';
import BarLine from '../../modules/BarLine.js';

const barLineIntervalPx = 3;
const normalBarLineWidthPx = 1;
const boldBarLineWidthPx = 4;
const barLineDotRadiusRate = 0.15;
const barLineDotMarginPx = 2;

export default {
  mixins: [
    CanvasBase,
  ],

  watch: {
    barLine: {
      handler() { this.$_setDirty(true) },
      deep: true,
      immediate: true,
    },

    $_barLineTotalWidthPx(newBarLineTotalWidthPx) {
      this.$_setCanvasWidthPx(newBarLineTotalWidthPx);
    },

    $_barLineHeightPx(newBarLineHeightPx) {
      this.$_setCanvasHeightPx(newBarLineHeightPx);
    },
  },

  mounted() {
    this.$_setCanvasWidthPx(this.$_barLineTotalWidthPx);
    this.$_setCanvasHeightPx(this.$_barLineHeightPx);
  },

  props: {
    barLine: { type: BarLine },
  },

  computed: {
    $_canvasRightEndOffsetPx() { return this.$_barLineTotalWidthPx - 1 },
    $_staffLineStepPx() { return this.$store.state.config.staffLineStepPx },
    $_barLineDotRadiusPx() { return barLineDotRadiusRate * this.$_staffLineStepPx; },
    $_barLineTotalWidthPx() {
      switch (this.barLine) {
        case BarLine.End.single:
          return normalBarLineWidthPx;
        case BarLine.End.double:
          return normalBarLineWidthPx * 2 + barLineIntervalPx;
        case BarLine.Start.repeatStart:
          return boldBarLineWidthPx + barLineIntervalPx + normalBarLineWidthPx + barLineDotMarginPx + 2 * this.$_barLineDotRadiusPx;
        case BarLine.End.repeatEnd:
          return boldBarLineWidthPx + barLineIntervalPx + normalBarLineWidthPx + barLineDotMarginPx + 2 * this.$_barLineDotRadiusPx;
      } 
      return null;
    },
    $_barLineHeightPx() { return this.$_staffLineStepPx * 4 + 1 },
    $_style() {
      return {
        marginTop: String(-(this.$_staffLineStepPx * 2)) + 'px',
        marginBottom: String(-(this.$_staffLineStepPx * 2 + 1)) + 'px',
        height: String(this.$_barLineHeightPx) + 'px',
        width: String(this.$_barLineTotalWidthPx) + 'px',
      };
    },
  },

  methods: {
    /* public */
    draw() {
      this.$_draw(canvasElement => {
        let canvas = canvasElement.getContext('2d');
        switch (this.barLine) {
          case BarLine.End.single:
            this.$_drawSingleBarLine(canvas);
            break;
          case BarLine.End.double:
            this.$_drawDoubledBarLine(canvas);
            break;
          case BarLine.Start.repeatStart:
            this.$_drawRepeatStartBarLine(canvas);
            break;
          case BarLine.End.repeatEnd:
            this.$_drawRepeatEndBarLine(canvas);
            break;
        } 
      });
    },

    /* private */
    $_drawSingleBarLine(canvas) {
      let barLineCenterOffsetPx = normalBarLineWidthPx / 2;
      this.$_drawNormalBarLine(canvas, barLineCenterOffsetPx);
    },

    $_drawDoubledBarLine(canvas) {
      this.$_drawSingleBarLine(canvas);
      let rightBarLineCenterHorizontalOffsetPx = normalBarLineWidthPx / 2;
      this.$_drawNormalBarLine(canvas, rightBarLineCenterHorizontalOffsetPx);
      let leftBarLineCenterHorizontalOffsetPx = normalBarLineWidthPx + barLineIntervalPx + normalBarLineWidthPx / 2;
      this.$_drawNormalBarLine(canvas, leftBarLineCenterHorizontalOffsetPx);
    },

    $_drawRepeatStartBarLine(canvas) {
      let rightBarLineCenterHorizontalOffsetPx = boldBarLineWidthPx / 2;
      this.$_drawBoldBarLine(canvas, rightBarLineCenterHorizontalOffsetPx);
      let leftBarLineCenterHorizontalOffsetPx = boldBarLineWidthPx + barLineIntervalPx + normalBarLineWidthPx / 2;
      this.$_drawNormalBarLine(canvas, leftBarLineCenterHorizontalOffsetPx);
      let barLineDotCenterHorizontalOffsetPx = boldBarLineWidthPx + barLineIntervalPx + normalBarLineWidthPx + barLineDotMarginPx + this.$_barLineDotRadiusPx;
      let upperBarLineDotCenterVerticalOffsetPx = this.$_staffLineStepPx * 3 / 2;
      let lowerBarLineDotCenterVerticalOffsetPx = this.$_staffLineStepPx * 5 / 2;
      this.$_drawBarLineDot(
        canvas,
        barLineDotCenterHorizontalOffsetPx,
        upperBarLineDotCenterVerticalOffsetPx,
      );
      this.$_drawBarLineDot(
        canvas,
        barLineDotCenterHorizontalOffsetPx,
        lowerBarLineDotCenterVerticalOffsetPx,
      );
    },

    $_drawRepeatEndBarLine(canvas) {
      let rightBarLineCenterHorizontalOffsetPx = this.$_barLineTotalWidthPx - (boldBarLineWidthPx / 2);
      this.$_drawBoldBarLine(canvas, rightBarLineCenterHorizontalOffsetPx);
      let leftBarLineCenterHorizontalOffsetPx = this.$_canvasRightEndOffsetPx - (boldBarLineWidthPx + barLineIntervalPx + normalBarLineWidthPx / 2);
      this.$_drawNormalBarLine(canvas, leftBarLineCenterHorizontalOffsetPx);
      let barLineDotCenterHorizontalOffsetPx = this.$_barLineDotRadiusPx;
      let upperBarLineDotCenterVerticalOffsetPx = this.$_staffLineStepPx * 3 / 2;
      let lowerBarLineDotCenterVerticalOffsetPx = this.$_staffLineStepPx * 5 / 2;
      this.$_drawBarLineDot(
        canvas,
        barLineDotCenterHorizontalOffsetPx,
        upperBarLineDotCenterVerticalOffsetPx,
      );
      this.$_drawBarLineDot(
        canvas,
        barLineDotCenterHorizontalOffsetPx,
        lowerBarLineDotCenterVerticalOffsetPx,
      );
    },

    $_drawNormalBarLine(canvas, horizontalOffsetPx) {
      canvas.strokeStyle = this.color.getStyleString();
      canvas.lineWidth = normalBarLineWidthPx;
      canvas.beginPath();
      canvas.moveTo(horizontalOffsetPx, 0);
      canvas.lineTo(horizontalOffsetPx, this.$_barLineHeightPx);
      canvas.stroke();
    },

    $_drawBoldBarLine(canvas, horizontalOffsetPx) {
      canvas.strokeStyle = this.color.getStyleString();
      canvas.lineWidth = boldBarLineWidthPx;
      canvas.beginPath();
      canvas.moveTo(horizontalOffsetPx, 0);
      canvas.lineTo(horizontalOffsetPx, this.$_barLineHeightPx);
      canvas.stroke();
    },

    $_drawBarLineDot(canvas, horizontalOffsetPx, verticalOffsetPx) {
      canvas.strokeStyle = this.color.getStyleString();
      canvas.lineWidth = normalBarLineWidthPx;
      canvas.beginPath();
      canvas.arc(
        horizontalOffsetPx,
        verticalOffsetPx,
        this.$_barLineDotRadiusPx, 0, 2 * Math.PI);
      canvas.fill();
    },
  },
}
</script>