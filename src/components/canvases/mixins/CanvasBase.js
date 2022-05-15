import Color from '../../../modules/Color.js'

export default {
  watch: {
    color: {
      handler() { this.$_setDirty(true) },
      immediate: true,
    },
  },

  async mounted() {
    this.$data.$_canvasElement = this.$refs.canvas;
  },

  props: {
    color: { type: Color, default: () => Color.black },
  },

  data() {
    return {
      $_canvasElement: null,
      $_dirty: true,
    };
  },

  computed: {
    $_staffLineStepPx() {
      return this.$store.state.config.staffLineStepPx;
    },
  },

  methods: {
    $_setDirty(dirty) {
      this.$data.$_dirty = dirty;
      this.draw();
    },

    $_setCanvasWidthPx(canvasWidthPx, setStyle = true) {
      if (setStyle) {
        this.$data.$_canvasElement.style.width = String(canvasWidthPx) + 'px';
      }
      this.$data.$_canvasElement.width = canvasWidthPx;
      this.$_setDirty(true);
    },

    $_setCanvasHeightPx(canvasHeightPx, setStyle = true) {
      if (setStyle) {
        this.$data.$_canvasElement.style.height = String(canvasHeightPx) + 'px';
      }
      this.$data.$_canvasElement.height = canvasHeightPx;
      this.$_setDirty(true);
    },

    $_draw(callback) {
      if (!this.$data.$_canvasElement) return;
      if (!this.$data.$_dirty) return;

      let canvas = this.$data.$_canvasElement.getContext('2d');
      let width = this.$data.$_canvasElement.width;
      let height = this.$data.$_canvasElement.height;
      clearCanvas(canvas, width, height);
      callback(this.$data.$_canvasElement);
      this.$_setDirty(false);

      function clearCanvas(canvas, width, height) {
        canvas.beginPath();
        canvas.clearRect(0, 0, width, height);
      }
    }
  }
}