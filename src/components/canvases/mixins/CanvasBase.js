import Color from '../../../modules/Color.js'

export default {
  watch: {
    color: {
      handler() { this.$_setDirty(true) },
      immediate: true,
    },
  },

  mounted() {
    this.$_setDirty(true);
  },

  props: {
    color: { type: Color, default: () => Color.black },
  },

  data() {
    return {
      $_isDirty: false,
    };
  },

  computed: {
    $_staffLineStepPx() {
      return this.$store.state.config.staffLineStepPx;
    },
  },

  methods: {
    $_setDirty(isDirty) {
      if (!this.$data.$_isDirty && isDirty) {
        this.$nextTick(this.draw);
      }
      this.$data.$_isDirty = isDirty;
    },

    $_setCanvasWidthPx(canvasWidthPx, setStyle = true) {
      if (setStyle) {
        this.$el.style.width = String(canvasWidthPx) + 'px';
      }
      this.$el.width = canvasWidthPx;
      this.$_setDirty(true);
    },

    $_setCanvasHeightPx(canvasHeightPx, setStyle = true) {
      if (setStyle) {
        this.$el.style.height = String(canvasHeightPx) + 'px';
      }
      this.$el.height = canvasHeightPx;
      this.$_setDirty(true);
    },

    $_draw(callback) {
      if (!this.$el) return;
      if (!this.$data.$_isDirty) return;

      let canvas = this.$el.getContext('2d');
      let width = this.$el.width;
      let height = this.$el.height;
      clearCanvas(canvas, width, height);
      callback(this.$el);
      this.$_setDirty(false);

      function clearCanvas(canvas, width, height) {
        canvas.beginPath();
        canvas.clearRect(0, 0, width, height);
      }
    }
  }
}