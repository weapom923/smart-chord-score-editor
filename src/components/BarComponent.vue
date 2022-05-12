<template>
  <div
    id="bar"
    v-bind="$attrs"
  >
    <div id="beat-and-part-container">
      <clef-canvas
        v-if="showClef"
        v-bind:clef="$_bar.clef"
      />
      <key-signature-component
        id="key-signature"
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
      <div
        id="repeat-ending-container"
        ref="repeatEndingContainer"
        v-if="!$_isBarRepeatEndingEmpty"
        v-bind:style="$data.$_barRepeatEndingStyle"
      >
        <bar-repeat-ending-component
          v-bind:bar-repeat-ending="$_bar.repeatEnding"
          v-on:update-bar-repeat-ending="$_onBarRepeatEndingUpdate"
        />
      </div>
      <div
        id="part-container"
        ref="partContainer"
      >
        <part-in-bar-component
          v-for="(part, partIdx) in $_bar.parts"
          v-bind:key="partIdx"
          v-bind:score="score"
          v-bind:section-idx="sectionIdx"
          v-bind:bar-idx="barIdx"
          v-bind:part-idx="partIdx"
          v-bind:selected-note-idx="$_getSelectedNoteIdxInPart(partIdx)"
          v-on:note-elements-update="$_onNoteElementsUpdate(partIdx, $event)"
          v-on:note-chord-elements-update="$_onNoteChordElementsUpdate(partIdx, $event)"
          v-on:tie-point-update="$_onPartTiePointUpdate(partIdx, $event)"
          v-on:click-note="$_onClickNote(partIdx, $event)"
        />
      </div>
      <bar-line-canvas
        v-bind:bar-line="$_bar.lineEnd"
      />
    </div>

    <v-menu
      open-on-hover
      close-on-click
      close-on-content-click
      bottom
      offset-y
      v-bind:disabled="!isHoverMenuEnabled"
    >
      <template v-slot:activator="{ on, attrs }">
        <staff-canvas
          ref="staffCanvas"
          v-bind="attrs"
          v-bind:background-color="$_staffBackgroundColor"
          v-bind:style="$_staffCanvasStyle"
          v-on="on"
          v-on:mousedown.stop="$_onMousedownStaff"
          v-on:mouseup.stop="$_onMouseupStaff"
        />
      </template>
      
      <bar-hover-menu
        v-bind:section-idx="sectionIdx"
        v-bind:bar-idx="barIdx"
      />
    </v-menu>
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
  position: relative;
  flex-shrink: 0;
  z-index: 1;
}

#repeat-ending-container {
  display: flex;
  position: relative;
  border-left: 1px solid #000000;
  border-top: 1px solid #000000;
  margin-left: -1px;
}

#part-container {
  flex-grow: 1;
  margin: 0 10px;
}
</style>

<script>
import PartInBarComponent from '../components/PartInBarComponent.vue';
import StaffCanvas from './canvases/StaffCanvas.vue';
import ClefCanvas from './canvases/ClefCanvas.vue';
import BarLineCanvas from './canvases/BarLineCanvas.vue';
import BeatComponent from './BeatComponent.vue';
import BarRepeatEndingComponent from './BarRepeatEndingComponent.vue';
import KeySignatureComponent from './KeySignatureComponent.vue';
import BarHoverMenu from './parts/BarHoverMenu.vue'
import Score from '../modules/Score.js';
import BarRepeatEnding from '../modules/BarRepeatEnding.js';
import BarBreak from '../modules/BarBreak.js';
import Color from '../modules/Color.js';

const selectedBarStaffBackgroundColor = new Color(0, 0, 0, 0.2);

export default {
  components: {
    BeatComponent,
    PartInBarComponent,
    StaffCanvas,
    ClefCanvas,
    BarLineCanvas,
    BarRepeatEndingComponent,
    KeySignatureComponent,
    BarHoverMenu,
  },

  watch: {
    $_numParts: {
      handler(newNumParts, oldNumParts) {
        if (oldNumParts === undefined) oldNumParts = 0;
        if (newNumParts > oldNumParts) {
          for (let partIdx = oldNumParts; partIdx < newNumParts; ++partIdx) {
            this.$data.$_partNoteElements.push(new Array());
            this.$data.$_partNoteChordElements.push(null);
            this.$data.$_partTieStartPointOffsets.push(null);
            this.$data.$_partTieEndPointOffsets.push(null);
          }
        } else if(newNumParts < oldNumParts) {
          this.$data.$_partNoteElements.splice(newNumParts);
          this.$data.$_partNoteChordElements.splice(newNumParts);
          this.$data.$_partTieStartPointOffsets.splice(newNumParts);
          this.$data.$_partTieEndPointOffsets.splice(newNumParts);
        }
      },
      immediate: true,
    },
  },

  mounted() {
    this.$emit('bar-element-update', this.$el);
    this.$data.$_barElementResizeObserver.observe(this.$el);
    this.$_updatePositionAndSize();
  },

  destroyed() {
    this.$data.$_barElementResizeObserver.disconnect();
  },

  props: {
    score: { type: Score, default: null },
    sectionIdx: { type: Number, default: null },
    barIdx: { type: Number, default: null },
    selectedPartIdx: { type: Number, default: null },
    selectedNoteIdx: { type: Number, default: null },
    showBeat: { type: Boolean, default: false },
    showClef: { type: Boolean, default: false },
    showKeySignature: { type: Boolean, default: null },
    staffBackgroundColor: { type: Color, default: () => Color.transparent },
    selectedStaffBackgroundColor: { type: Color, default: () => selectedBarStaffBackgroundColor },
    isHoverMenuEnabled: { type: Boolean, default: false },
    isPrintLayoutEnabled: { type: Boolean, default: false },
  },

  data() {
    return {
      $_barElementResizeObserver: new ResizeObserver(this.$_updatePositionAndSize),
      $_partNoteElements: new Array(),
      $_partNoteChordElements: new Array(),
      $_partTieStartPointOffsets: new Array(),
      $_partTieEndPointOffsets: new Array(),
      $_barRepeatEndingElement: null,
      $_barRepeatEndingStyle: new Object(),
      $_marginTopPxMax: this.$store.state.config.systemMarginTopPx,
      $_marginBottomPxMax: this.$store.state.config.systemMarginBottomPx,
    };
  },

  computed: {
    $_section() {
      if (this.score === null) return null;
      return this.score.getSection(this.sectionIdx);
    },

    $_bar() {
      if (this.score === null) return null;
      return this.score.getBar(this.sectionIdx, this.barIdx);
    },

    $_numParts() {
      if (this.score === null) return null;
      return this.score.getNumParts(this.sectionIdx, this.barIdx);
    },

    $_internalMarginTopPx() {
      return this.$store.state.config.staffLineStepPx * 2;
    },

    $_internalMarginBottomPx() {
      return this.$store.state.config.staffLineStepPx * 2 + 1;
    },

    $_isBarSelected() {
      if (this.$store.state.selectedBarsFirst.sectionIdx === null) return false;
      if (this.$store.state.selectedBarsFirst.barIdx === null) return false;
      if (this.$store.state.selectedBarsLast.sectionIdx === null) return false;
      if (this.$store.state.selectedBarsLast.barIdx === null) return false;
      if (this.$store.state.selectedBarsFirst.sectionIdx > this.sectionIdx) return false;
      if (this.$store.state.selectedBarsLast.sectionIdx < this.sectionIdx) return false;
      if (this.$store.state.selectedBarsFirst.sectionIdx === this.sectionIdx) {
        if (this.$store.state.selectedBarsFirst.barIdx > this.barIdx) return false;
      }
      if (this.$store.state.selectedBarsLast.sectionIdx === this.sectionIdx) {
        if (this.$store.state.selectedBarsLast.barIdx < this.barIdx) return false;
      }
      return true;
    },

    $_isBarRepeatEndingEmpty() {
      return this.$_bar.repeatEnding.isEqualTo(BarRepeatEnding.empty);
    },

    $_staffBackgroundColor() {
      if (this.isPrintLayoutEnabled) return this.staffBackgroundColor;
      if (this.$_isBarSelected) return this.selectedStaffBackgroundColor;
      return this.staffBackgroundColor;
    },

    $_staffCanvasStyle() {
      return {
        marginTop: String(-this.$_internalMarginTopPx) + 'px',
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
        if (previousBar.break !== BarBreak.empty) return true;
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

    $_onMouseupStaff() {
      this.$emit('mouseup-staff', event);
    },

    $_onMousedownStaff(event) {
      this.$emit('mousedown-staff', event);
    },

    $_onNoteElementsUpdate(partIdx, noteElements) {
      this.$set(this.$data.$_partNoteElements, partIdx, noteElements);
      this.$_updateMarginTopAndBottom();
    },

    $_onNoteChordElementsUpdate(partIdx, chordElements) {
      this.$set(this.$data.$_partNoteChordElements, partIdx, chordElements);
      this.$_updateMarginTopAndBottom();
    },

    $_onPartTiePointUpdate(partIdx, { tieStartPointOffset, tieEndPointOffset }) {
      this.$set(this.$data.$_partTieStartPointOffsets, partIdx, tieStartPointOffset);
      this.$set(this.$data.$_partTieEndPointOffsets, partIdx, tieEndPointOffset);
      this.$_emitTiePointUpdate();
    },

    $_onBarRepeatEndingUpdate(barRepeatEndingElement) {
      this.$data.$_barRepeatEndingElement = barRepeatEndingElement;
    },

    $_updatePositionAndSize() {
      this.$_emitTiePointUpdate();
      this.$_updateMarginTopAndBottom();
      this.$_updateBarRepeatEndingStyle();
    },

    $_emitTiePointUpdate() {
      let partContainerElementBoundingClientRect = this.$refs.partContainer.getBoundingClientRect();
      let barElementBoundingClientRect = this.$el.getBoundingClientRect();
      this.$emit(
        'tie-point-update',
        {
          tieStartPointOffsets: this.$data.$_partTieStartPointOffsets.map(
            partTieStartPointOffset => {
              if (partTieStartPointOffset === null) return null;
              return new DOMPoint(
                partContainerElementBoundingClientRect.x + partTieStartPointOffset.x - barElementBoundingClientRect.x,
                partTieStartPointOffset.y,
              )
            },
          ),
          tieEndPointOffsets: this.$data.$_partTieEndPointOffsets.map(
            partTieEndPointOffset => {
              if (partTieEndPointOffset === null) return null;
              return new DOMPoint(
                partContainerElementBoundingClientRect.x + partTieEndPointOffset.x - barElementBoundingClientRect.x,
                partTieEndPointOffset.y,
              );
            },
          ),
        },
      );
    },

    $_updateMarginTopAndBottom() {
      let maxTopOffsetPx = this.$_internalMarginTopPx + this.$store.state.config.systemMarginTopPx;
      let maxBottomOffsetPx = this.$_internalMarginBottomPx + this.$store.state.config.systemMarginBottomPx;
      let topBiasPx = this.$el.getBoundingClientRect().y;
      let bottomBiasPx = this.$el.getBoundingClientRect().y;
      for (let partIdx = 0; partIdx < this.$_numParts; ++partIdx) {
        let partNoteElements = [ ...this.$data.$_partNoteElements[partIdx], this.$data.$_partNoteChordElements[partIdx] ];
        if (!partNoteElements) continue;
        for (let noteElements of partNoteElements) {
          if (!noteElements) continue;
          for (let noteElement of noteElements) {
            if (!noteElement) continue;
            if (noteElement.clientHeight === 0) continue;
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
      this.$data.$_marginTopPxMax = maxTopOffsetPx;
      this.$data.$_marginBottomPxMax = maxBottomOffsetPx;
      this.$emit('margin-top-px-update', this.$data.$_marginTopPxMax);
      this.$emit('margin-bottom-px-update', this.$data.$_marginBottomPxMax);
    },

    $_updateBarRepeatEndingStyle() {
      if (this.$data.$_barRepeatEndingElement === null) return 0;
      let barElementBoundingClientRect = this.$el.getBoundingClientRect();
      let barRepeatEndingElementBoundingClientRect = this.$data.$_barRepeatEndingElement.getBoundingClientRect();
      let barRepeatEndingRightOffsetPx = barRepeatEndingElementBoundingClientRect.x + barRepeatEndingElementBoundingClientRect.width - barElementBoundingClientRect.x;
      this.$data.$_barRepeatEndingStyle = {
        marginTop: String(-this.$data.$_marginTopPxMax) + 'px',
        marginRight: String(-(barElementBoundingClientRect.width - barRepeatEndingRightOffsetPx)) + 'px',
        height: String(this.$data.$_marginTopPxMax - this.$_internalMarginTopPx) + 'px',
        width: String(barElementBoundingClientRect.width) + 'px',
      };
    },

    $_onClickNote(partIdx, noteIdx) {
      this.$emit('click-note', { partIdx, noteIdx });
    },
  },
}
</script>