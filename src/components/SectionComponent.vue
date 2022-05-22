<template>
  <div id="section-container">
    <div
      id="system-container"
      v-for="(systemDefinition, systemIdx) of $_systemDefinitions"
      v-bind:key="systemIdx"
    >
      <div class="section-name-container pr-5">
        <template v-if="systemIdx === 0">
          <v-menu
            open-on-hover
            close-on-click
            close-on-content-click
            bottom
            offset-y
          >
            <template v-slot:activator="{ on, attrs }">
              <div
                class="section-name-menu-area py-3"
                v-if="$_isSectionContainingFirstBar"
                v-bind="attrs"
                v-on="on"
              >
                {{ $_section.name }}
              </div>
            </template>
  
            <section-name-hover-menu
              v-bind:section-idx="sectionDefinition.sectionIdx"
            />
          </v-menu>
        </template>
      </div>
      <system-component
        v-bind:score="score"
        v-bind:system-definition="systemDefinition"
        v-bind:is-bar-hover-menu-enabled="$_isBarHoverMenuEnabled"
        v-bind:is-print-layout-enabled="isPrintLayoutEnabled"
        v-on:mousedown-staff="$_selectBar"
        v-on:mouseup-staff="$_expandSelectedBars"
      />
    </div>
  </div>
</template>

<style scoped>
#section-container {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
}

.section-name-container {
  display: flex;
  min-width: 100px;
  align-items: center;
}

.section-name-menu-area {
  width: 100%;
  text-align: right;
}

#system-container {
  display: flex;
  flex-direction: row;
}
</style>

<script>
import SystemComponent from './SystemComponent.vue';
import { SystemDefinition } from './SystemComponent.vue';
import SectionNameHoverMenu from './parts/SectionNameHoverMenu.vue';
import Score from '../modules/Score.js';
import BarBreak from '../modules/BarBreak.js';

class SectionDefinition {
  constructor(sectionIdx, firstBarIdx, lastBarIdx, showBeatOnFirstBar) {
    this.sectionIdx = sectionIdx;
    this.firstBarIdx = firstBarIdx;
    this.lastBarIdx = lastBarIdx;
    this.showBeatOnFirstBar = showBeatOnFirstBar;
  }
}

export {
  SectionDefinition,
}

export default {
  components: {
    SystemComponent,
    SectionNameHoverMenu,
  },

  props: {
    score: { type: Score },
    sectionDefinition: { type: SectionDefinition },
    isPrintLayoutEnabled: { type: Boolean },
  },

  computed: {
    $_section() {
      return this.score.sections[this.sectionDefinition.sectionIdx];
    },

    $_isBarHoverMenuEnabled() {
      return !this.isPrintLayoutEnabled;
    },

    $_isSectionContainingFirstBar() {
      return (this.sectionDefinition.firstBarIdx === 0);
    },

    $_systemDefinitions() {
      let systemDefinitions = new Array();
      if (this.$_section === null) return systemDefinitions;
      let firstBarIdxOfCurrentSystem = null;
      for (let barIdx = this.sectionDefinition.firstBarIdx; barIdx <= this.sectionDefinition.lastBarIdx; ++barIdx) {
        if (firstBarIdxOfCurrentSystem === null) {
          firstBarIdxOfCurrentSystem = barIdx;
        }
        let bar = this.$_section.bars[barIdx];
        let isSectionLastBar = (barIdx === this.sectionDefinition.lastBarIdx);
        let isSectionBroken = (bar.break !== BarBreak.empty);
        if (isSectionBroken || isSectionLastBar) {
          let isFirstSystem = (this.sectionDefinition.sectionIdx === 0);
          let showBeatOnFirstBar = isFirstSystem && this.sectionDefinition.showBeatOnFirstBar;
          let lastBarIdxOfCurrentSystem = barIdx;
          systemDefinitions.push(new SystemDefinition(
            this.sectionDefinition.sectionIdx,
            firstBarIdxOfCurrentSystem,
            lastBarIdxOfCurrentSystem,
            showBeatOnFirstBar,
          ));
          firstBarIdxOfCurrentSystem = null;
        }
      }
      return systemDefinitions;
    },
  },

  inject: [
    'expandSelectedBars',
    'selectBar',
  ],

  methods: {
    async $_expandSelectedBars({ barIdx }) {
      await this.expandSelectedBars(this.sectionDefinition.sectionIdx, barIdx);
    },

    async $_selectBar({ barIdx, event }) {
      if (event.shiftKey) {
        await this.$_expandSelectedBars({ barIdx });
      } else {
        await this.selectBar(this.sectionDefinition.sectionIdx, barIdx);
      }
    },
  }
}
</script>