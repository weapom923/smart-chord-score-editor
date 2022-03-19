<template>
  <div id="section-container">
    <div id="section-name-container">
      <span v-if="$_section">{{ $_section.name }}</span>
    </div>
    <div id="system-container">
      <system-component
        v-for="(systemInfo, systemIdx) of $_systemInfoArray"
        v-bind:key="systemIdx"
        v-bind:score="score"
        v-bind:section-idx="sectionIdx"
        v-bind:system-first-bar-idx="systemInfo.systemFirstBarIdx"
        v-bind:system-last-bar-idx="systemInfo.systemLastBarIdx"
        v-bind:show-beat-on-first-bar="systemInfo.isFirstSystem && showBeatOnFirstBar"
      />
    </div>
  </div>
</template>

<style scoped>
#section-container {
  display: flex;
  flex-direction: row;
}

#section-name-container {
  min-width: 100px;
  padding-top: 20px;
}

#system-container {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
}
</style>

<script>
import SystemComponent from './SystemComponent.vue'
import Score from '../modules/Score.js'

class SystemInfo {
  constructor(systemFirstBarIdx, systemLastBarIdx, isFirstSystem) {
    this.systemFirstBarIdx = systemFirstBarIdx;
    this.systemLastBarIdx = systemLastBarIdx;
    this.isFirstSystem = isFirstSystem;
  }
}

export default {
  components: {
    SystemComponent,
  },

  props: {
    score: { type: Score },
    sectionIdx: { type: Number, default: null },
    showBeatOnFirstBar: { type: Boolean, default: null },
  },

  computed: {
    $_section() {
      if (this.score === null) return null;
      if (this.sectionIdx === null) return null;
      return this.score.sections[this.sectionIdx];
    },

    $_systemInfoArray() {
      let systemInfoArray = new Array();
      if (this.$_section === null) return systemInfoArray;
      let numBarsInSection = this.$_section.bars.length;
      let currentSystemFirstIdx = null;
      for (let barIdx = 0; barIdx < numBarsInSection; ++barIdx) {
        if (currentSystemFirstIdx === null) {
          currentSystemFirstIdx = barIdx;
        }
        let bar = this.$_section.bars[barIdx];
        let isSectionLastBar = (barIdx === (numBarsInSection - 1));
        if (bar.terminatesSystem || isSectionLastBar) {
          let isFirstSystem = (systemInfoArray.length === 0);
          systemInfoArray.push(new SystemInfo(currentSystemFirstIdx, barIdx, isFirstSystem));
          currentSystemFirstIdx = null;
        }
      }
      return systemInfoArray;
    },
  },
}
</script>