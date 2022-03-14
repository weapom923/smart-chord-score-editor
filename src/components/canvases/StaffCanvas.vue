<template>
  <canvas
    id="staff-canvas"
    ref="canvas"
    v-bind="$attrs"
    v-on:click="$_onClick"
  />
</template>

<style scoped>
#staff-canvas {
  position: absolute;
  width: 100%;
  left: 0;
}
</style>

<script>
import CanvasBase from './mixins/CanvasBase.js';
import canvas_utils from './modules/canvas_utils.js'

export default {
  mixins: [
    CanvasBase,
  ],

  watch: {
    $_staffHeightPx(newCanvasHeightPx) {
      this.$_setCanvasHeightPx(newCanvasHeightPx);
    },
  },

  mounted() {
    this.$_setCanvasHeightPx(this.$_staffHeightPx);
    this.$data.$_resizeObserver = new ResizeObserver(event => {
      this.$_setCanvasWidthPx(event[0].contentRect.width, false);
    });
    this.$data.$_resizeObserver.observe(this.$el);
  },

  destroyed() {
    this.$data.$_resizeObserver.unobserve(this.$el);
    this.$data.$_resizeObserver.disconnect();
  },

  data() {
    return {
      $_resizeObserver: null,
    };
  },

  computed: {
    $_staffLineStepPx() { return this.$store.state.config.staffLineStepPx },
    $_staffHeightPx() { return this.$_staffLineStepPx * 4 + 1 },
  },

  methods: {
    /* public */
    draw() {
      this.$_draw(canvasElement => {
        let canvas = canvasElement.getContext('2d');
        this.$_drawStaff(canvas, canvasElement.width);
      });
    },

    /* private */
    $_drawStaff(canvas, canvasRightEndOffsetPx) {
      for (let lineIdx = 0; lineIdx < 5; ++lineIdx) {
        let verticalOffsetPx = lineIdx * this.$_staffLineStepPx;
        canvas.lineWidth = 1;
        canvas.strokeStyle = this.color.getStyleString();
        canvas.beginPath();
        canvas.moveTo(...canvas_utils.dotByDotOffsetCoordArgs(0, verticalOffsetPx));
        canvas.lineTo(...canvas_utils.dotByDotOffsetCoordArgs(canvasRightEndOffsetPx, verticalOffsetPx));
        canvas.stroke();
      }
    },

    $_onClick() {
      this.$emit('click');
    },
  },
}
</script>