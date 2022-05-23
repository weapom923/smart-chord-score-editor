<template>
  <div
    id="seek-bar-container"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div
      id="seek-bar-base"
      ref="seekBarBase"
    >
      <div
        v-show="!disabled"
        id="seek-bar-played"
        ref="seekBarPlayed"
      >
        <div
          id="seek-bar-handle"
          ref="seekBarHandle"
        >
        </div>
      </div>

      <div
        id="seek-bar-loop"
        class="loop"
        ref="seekBarLoop"
        v-show="$_isLoopEnabled"
      >
      </div>

      <div
        id="seek-bar-clickable-area"
        ref="seekBarClickableArea"
        v-on:mousedown.stop="$_seekStart"
      >
      </div>
    </div>
  </div>
</template>

<style scoped>
div#seek-bar-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 0 10px;
}

div#seek-bar-base {
  position: relative;
  flex-grow: 1;
  height: 3px;
  background-color: #dddddd;
}

div#seek-bar-played {
  height: 100%;
  background-color: #666666;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

div#seek-bar-handle {
  flex-shrink: 0;
  background-color: #666666;
  height: 15px;
  width: 15px;
  margin-right: -8px;
  border-radius: 50%;
}

div#seek-bar-loop {
  position: absolute;
  top: 0;
  height: 100%;
  opacity: 0.5;
}

div#seek-bar-clickable-area {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin-top: -10px;
  padding: 10px 0;
}

div.loop {
  background-color: #16f43f;
}
</style>

<script>
import utils from '../modules/utils.js';

export default {
  watch: {
    currentTimeMsec(newCurrentTimeMsec) {
      this.$_updateSeekBarPosition(newCurrentTimeMsec);
    },

    durationMsec(newDurationMsec) {
      let seekBarBaseWidthPx = this.$refs.seekBarBase.getBoundingClientRect().width;
      this.$_updateSeekBarScaleAndPosition(seekBarBaseWidthPx, newDurationMsec);
    },

    loopBeginTimeMsec(newLoopBeginTimeMsec) {
      if (newLoopBeginTimeMsec !== null) {
        this.$_updateLoopRange(newLoopBeginTimeMsec, this.loopEndTimeMsec);
      }
    },

    loopEndTimeMsec(newLoopEndTimeMsec) {
      if (newLoopEndTimeMsec !== null) {
        this.$_updateLoopRange(this.loopBeginTimeMsec, newLoopEndTimeMsec);
      }
    },
  },

  mounted() {
    let seekBarBaseWidthPx = this.$refs.seekBarBase.getBoundingClientRect().width;
    this.$_updateSeekBarScaleAndPosition(seekBarBaseWidthPx, this.durationMsec);
    this.$_updateSeekBarPosition(this.currentTimeMsec);
    this.$_updateLoopRange(this.loopBeginTimeMsec, this.loopEndTimeMsec);
    this.$data.$_seekBarBaseResizeObserver = new ResizeObserver(
      resizeObserverEntries => {
        let resizeObserverEntry = resizeObserverEntries[0];
        this.$_updateSeekBarScaleAndPosition(resizeObserverEntry.contentRect.width, this.durationMsec);
      },
    );
    this.$data.$_seekBarBaseResizeObserver.observe(this.$refs.seekBarBase);
  },

  destroyed() {
    this.$data.$_seekBarBaseResizeObserver.disconnect();
  },

  props: {
    disabled: { type: Boolean },
    currentTimeMsec: { type: Number },
    durationMsec: { type: Number },
    loopBeginTimeMsec: { type: Number },
    loopEndTimeMsec: { type: Number },
  },

  data() {
    return {
      $_seekBarBaseResizeObserver: null,
      $_seekBarScale: null,
      $_isSeeking: false,
    };
  },

  computed: {
    $_isLoopEnabled() {
      return ((this.loopBeginTimeMsec !== null) && (this.loopEndTimeMsec !== null));
    },
  },

  methods: {
    $_updateSeekBarPosition(currentTimeMsec) {
      this.$refs.seekBarPlayed.style.width = String(currentTimeMsec / this.$_seekBarScale) + 'px';
    }, 

    $_updateSeekBarScaleAndPosition(seekBarBaseWidthPx, durationMsec) {
      this.$_seekBarScale = durationMsec / seekBarBaseWidthPx;
      this.$_updateSeekBarPosition(this.currentTimeMsec);
    },

    $_updateLoopRange(loopBeginTimeMsec, loopEndTimeMsec) {
      let loopDurationMsec = loopEndTimeMsec - loopBeginTimeMsec;
      this.$refs.seekBarLoop.style.left = String(loopBeginTimeMsec / this.$_seekBarScale) + 'px';
      this.$refs.seekBarLoop.style.width = String(loopDurationMsec / this.$_seekBarScale) + 'px';
    },

    $_getSeekTimeMsecByMouseEvent(mouseEvent) {
      let seekBarBaseClientRect = this.$refs.seekBarBase.getBoundingClientRect();
      let seekBarOffsetPx = mouseEvent.clientX - seekBarBaseClientRect.x;
      return seekBarOffsetPx * this.$_seekBarScale;
    },

    $_seek(event) {
      if (this.$data.$_isSeeking) {
        let seekBarBaseClientRect = this.$refs.seekBarBase.getBoundingClientRect();
        let seekBarOffsetPx = event.clientX - seekBarBaseClientRect.x;
        let seekTimeMsec = seekBarOffsetPx * this.$_seekBarScale;
        utils.clamp(seekTimeMsec, 0, this.durationMsec);
        this.$emit('seek', seekTimeMsec);
      }
    },

    $_seekStart(event) {
      this.$data.$_isSeeking = true;
      this.$emit('seek-start');
      this.$_seek(event);
      window.addEventListener('mousemove', this.$_seek);
      window.addEventListener('mouseup', this.$_seekEnd);
    },

    $_seekEnd(event) {
      this.$data.$_isSeeking = false;
      this.$_seek(event);
      this.$emit('seek-end');
      window.removeEventListener('mousemove', this.$_seek);
      window.addEventListener('mouseup', this.$_seekEnd);
    },
  },
}
</script>