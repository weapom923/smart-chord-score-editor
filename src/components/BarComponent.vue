<template>
  <div
    id="bar"
    v-bind="$attrs"
    v-bind:style="$_barStyle"
  >
    <div id="beat-and-part-container">
      <key-signature-component
        v-if="$_showKeySignature"
        v-bind:clef="$_bar.clef"
        v-bind:scale="$_bar.scale"
      />
      <beat-component
        v-if="showBeat"
        v-bind:bar-value="$_bar.value"
      />
      <bar-line-canvas
        v-if="$_bar.lineStart"
        v-bind:bar-line="$_bar.lineStart"
      />
      <div id="part-container">
        <part-in-bar-component
          v-for="(part, partIdx) in $_bar.parts"
          v-bind:key="partIdx"
          v-bind:part="part"
          v-bind:selected-note-idx="$_getSelectedNoteIdxInPart(partIdx)"
          v-on:note-elements-update="$_onNoteElementsUpdate(partIdx, $event)"
        />
      </div>
      <bar-line-canvas
        v-bind:bar-line="$_bar.lineEnd"
      />
    </div>

    <staff-canvas
      ref="staffCanvas"
      v-bind:background-color="staffBackgroundColor"
      v-bind:style="$_staffCanvasStyle"
      v-on:click="$_selectBar"
    />
  </div>              
</template>           

<style scoped>
#bar {
  position: relative;
}

#beat-and-part-container {
  display: flex;
  flex-direction: row;
}

#beat-and-part-container * {
  flex-shrink: 0;
}

#part-container {
  flex-grow: 1;
  padding: 0 10px;
}
</style>

<script>
import PartInBarComponent from '../components/PartInBarComponent.vue';
import StaffCanvas from "./canvases/StaffCanvas.vue";
import BarLineCanvas from "./canvases/BarLineCanvas.vue";
import BeatComponent from "./BeatComponent.vue";
import KeySignatureComponent from "./KeySignatureComponent.vue";
import Color from '../modules/Color.js';

export default {
  components: {
    BeatComponent,
    PartInBarComponent,
    StaffCanvas,
    BarLineCanvas,
    KeySignatureComponent,
  },

  props: {
    sectionIdx: { type: Number },
    barIdx: { type: Number },
    selectedPartIdx: { type: Number, default: null },
    selectedNoteIdx: { type: Number, default: null },
    showBeat: { type: Boolean, default: false },
    showKeySignature: { type: Boolean, default: null },
    staffBackgroundColor: { type: Color, default: null },
    marginTopPx: { type: Number, default: null },
    marginBottomPx: { type: Number, default: null },
  },

  data() {
    return {
      $_subComponentElements: new Object(),
      $_marginTopPx: 0,
      $_marginBottomPx: 0,
    };
  },

  computed: {
    $_score() {
      return this.$store.state.score;
    },

    $_section() {
      if (this.$_score === null) return null;
      if (this.sectionIdx === null) return null;
      return this.$_score.sections[this.sectionIdx];
    },

    $_bar() {
      if (this.$_section === null) return null;
      return this.$_section.bars[this.barIdx];
    },

    $_barStyle() {
      let marginTopPx = (this.marginTopPx === null)? this.$data.$_marginTopPx : this.marginTopPx;
      let marginBottomPx = (this.marginBottomPx === null)? this.$data.$_marginBottomPx : this.marginBottomPx;
      return {
        marginTop: String(marginTopPx) + 'px',
        marginBottom: String(marginBottomPx) + 'px',
        height: String(this.$store.state.config.staffLineStepPx * 4 + 1) + 'px',
        paddingTop: String(this.$store.state.config.staffLineStepPx * 2) + 'px',
      };
    },

    $_staffCanvasStyle() {
      return {
        marginTop: String(-this.$store.state.config.staffLineStepPx * 2) + 'px',
      };
    },

    $_showKeySignature() {
      if (this.showKeySignature !== null) return this.showKeySignature;
      if (this.barIdx === null) return false;
      if (this.barIdx === 0) {
        return true;
      } else {
        let currentBar = this.$_section.bars[this.barIdx];
        let previousBar = this.$_section.bars[this.barIdx - 1];
        if (previousBar.terminatesSystem) return true;
        if (currentBar.scale.type !== previousBar.scale.type) return true;
        if (currentBar.scale.tonicNotePitch !== previousBar.scale.tonicNotePitch) return true;
        return false;
      }
    },

    $_showBeat() {
      if (this.barIdx === null) return false;
      if (this.barIdx === 0) {
        return this.showBeatOnFirstBar;
      } else {
        let currentBar = this.system[this.barIdx];
        let previousBar = this.system[this.barIdx - 1];
        if (currentBar.numerator !== previousBar.numerator) return true;
        if (currentBar.denominator !== previousBar.denominator) return true;
        return false;
      }
    },
  },

  methods: {
    $_getSelectedNoteIdxInPart(partIdx) {
      if (this.selectedPartIdx === null) return null;
      if (partIdx === this.selectedPartIdx) return this.selectedNoteIdx;
    },

    async $_selectBar() {
      await this.$store.dispatch('selectBar', [ this.sectionIdx, this.barIdx ]);
    },

    $_onNoteElementsUpdate(partIdx, noteElementsInPart) {
      if (noteElementsInPart === null) {
        this.$delete(this.$data.$_subComponentElements, partIdx);
        if (Object.keys(this.$data.$_subComponentElements).length === 0) {
          this.$emit('margin-top-px-update', null);
          this.$emit('margin-bottom-px-update', null);
        }
      } else {
        this.$set(this.$data.$_subComponentElements, partIdx, noteElementsInPart);
      }

      this.$nextTick(() => {
        let maxTopOffsetPx = this.$store.state.config.systemMarginTopPx;
        let maxBottomOffsetPx = this.$store.state.config.systemMarginBottomPx;
        let barBoundingClientRect = this.$el.getBoundingClientRect();
        let topBiasPx = barBoundingClientRect.top;
        let bottomBiasPx = barBoundingClientRect.bottom;
        for (let noteElementsInPart of Object.values(this.$data.$_subComponentElements)) {
          for (let noteElements of Object.values(noteElementsInPart)) {
            for (let noteElement of Object.values(noteElements)) {
              let topOffsetPx = topBiasPx - noteElement.getBoundingClientRect().top;
              if (maxTopOffsetPx < topOffsetPx) {
                maxTopOffsetPx = topOffsetPx;
              }
              let bottomOffsetPx = noteElement.getBoundingClientRect().bottom - bottomBiasPx;
              if (maxBottomOffsetPx < bottomOffsetPx) {
                maxBottomOffsetPx = bottomOffsetPx;
              }
            }
          }
        }
        this.$data.$_marginTopPx = maxTopOffsetPx;
        this.$data.$_marginBottomPx = maxBottomOffsetPx;
        this.$emit('margin-top-px-update', this.$data.$_marginTopPx);
        this.$emit('margin-bottom-px-update', this.$data.$_marginBottomPx);
      });
    },
  },
}
</script>