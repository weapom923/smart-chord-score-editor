<template>
  <v-app-bar dense>
    <v-btn
      icon
      v-on:click="$_loadAudioSource"
    >
      <v-icon>mdi-folder-open</v-icon>
    </v-btn>
    <audio-player-controller
      v-bind:disabled="!$_isAudioSourceLoaded"
      v-bind:duration-msec="$data.$_durationMsec"
      v-bind:play-time-msec="$data.$_playTimeMsec"
      v-bind:is-playing="$data.$_isPlaying"
      v-bind:is-loop-enabled="$_isLoopEnabled"
      v-bind:loop-begin-time-msec="$data.$_loopBeginTimeMsec"
      v-bind:loop-end-time-msec="$data.$_loopEndTimeMsec"
      v-on:seek-in-msec="$_seekInMsec"
      v-on:play="$_play"
      v-on:pause="$_pause"
      v-on:clear-loop="$_clearLoop"
      v-on:set-loop-begin="$_setLoopBeginTimeMsec"
      v-on:set-loop-end="$_setLoopEndTimeMsec"
    />
  </v-app-bar>
</template>

<script>
import AudioPlayerController from './AudioPlayerController.vue';
import utils from '../modules/utils.js';

export default {
  components: {
    AudioPlayerController,
  },

  watch: {
    '$data.$_isPlaying'(newIsPlaying) {
      if (newIsPlaying) {
        if (this.$data.$_audioPlayer.ended) this.$_seekInMsec(0);
        this.$data.$_audioPlayer.play();
      } else {
        this.$data.$_audioPlayer.pause();
      }
    },

    '$data.$_audioSource'(newAudioSource) {
      this.$data.$_audioPlayer.src = newAudioSource;
    },
  },

  data() {
    return {
      $_audioPlayer: null,
      $_playTimeMsec: 0,
      $_loopBeginTimeMsec: null,
      $_loopEndTimeMsec: null,
      $_audioSource: null,
      $_durationMsec: 0,
      $_isPlaying: false,
    }
  },

  computed: {
    $_isAudioSourceLoaded() {
      return this.$data.$_audioSource !== null;
    },

    $_isLoopEnabled() {
      if (this.$data.$_loopBeginTimeMsec === null) return false;
      if (this.$data.$_loopEndTimeMsec === null) return false;
      if (this.$data.$_loopBeginTimeMsec > this.$data.$_loopEndTimeMsec) return false;
      return true;
    },
  },

  mounted() {
    this.$data.$_audioPlayer = document.createElement('audio');
    this.$nextTick(() => {
      if (typeof this.$data.$_audioPlayer === 'undefined') return;

      this.$data.$_audioPlayer.onloadedmetadata = () => {
        let previousTimeMsec = this.$_getPlayTimeMsec();
        let self = this;
        window.requestAnimationFrame(function recursiveFunction() {
          let currentTimeMsec = self.$_getPlayTimeMsec();
          if (previousTimeMsec !== currentTimeMsec) {
            previousTimeMsec = currentTimeMsec;
            self.$data.$_audioPlayer.dispatchEvent(new CustomEvent('animationframeupdate'));
          }
          window.requestAnimationFrame(recursiveFunction);
        });
      };
      this.$data.$_audioPlayer.onloadeddata = () => {
        this.$data.$_durationMsec = Math.trunc(this.$data.$_audioPlayer.duration * 1000);
      };
      this.$data.$_audioPlayer.addEventListener('animationframeupdate', this.$_update);
      this.$data.$_audioPlayer.addEventListener('timeupdate', this.$_update);
      this.$data.$_audioPlayer.addEventListener('ended', () => {
        if (this.$_isLoopEnabled && this.$data.$_isPlaying) {
          this.$_seekInMsec(this.$data.$_loopBeginTimeMsec);
          this.$data.$_audioPlayer.play();
        } else {
          this.$_pause();
        }
      });
    });
  },

  methods: {
    /* private */
    $_seekInMsec(timeMsec) {
      this.$data.$_audioPlayer.currentTime = timeMsec / 1000;
    },

    $_getPlayTimeMsec() {
      return Math.trunc(this.$data.$_audioPlayer.currentTime * 1000);
    },

    async $_loadAudioSource() {
      let fileInterface = await utils.getFileInterface('audio/*');
      if (fileInterface === null) return;
      let audioUint8Array = await utils.loadFileAsUint8Array(fileInterface);
      if (audioUint8Array === null) return;
      this.$data.$_audioSource = URL.createObjectURL(new Blob([ audioUint8Array.buffer ]));
      this.$_clearLoop();
      this.$_pause();
    },

    $_play() {
      this.$data.$_isPlaying = true;
    },

    $_pause() {
      this.$data.$_isPlaying = false;
    },

    $_setLoopBeginTimeMsec(loopBeginTimeMsec) {
      this.$data.$_loopBeginTimeMsec = loopBeginTimeMsec;
    },

    $_setLoopEndTimeMsec(loopEndTimeMsec) {
      this.$data.$_loopEndTimeMsec = loopEndTimeMsec;
    },

    $_clearLoop() {
      this.$data.$_loopBeginTimeMsec = null;
      this.$data.$_loopEndTimeMsec = null;
    },

    $_update() {
      let playTimeMsec = this.$_getPlayTimeMsec();
      if (this.$_isLoopEnabled) {
        let isPlayTimeBeforeLoopBegin = playTimeMsec < this.$data.$_loopBeginTimeMsec;
        let isPlayTimeAfterLoopEnd = playTimeMsec >= this.$data.$_loopEndTimeMsec;
        if (isPlayTimeBeforeLoopBegin || isPlayTimeAfterLoopEnd) {
          this.$_seekInMsec(this.$data.$_loopBeginTimeMsec);
          playTimeMsec = this.$data.$_loopBeginTimeMsec;
        }
      }
      this.$data.$_playTimeMsec = playTimeMsec;
    },
  },
};
</script>