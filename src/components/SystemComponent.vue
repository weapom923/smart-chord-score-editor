<template>
  <div
    id="system"
    v-if="$data.$_renderComponent"
    v-bind:style="$_systemStyle"
  >
    <staff-canvas
      id="staff-canvas"
      v-bind:style="$_staffCanvasStyle"
    />
    <template v-for="partIdx of $_partIdcs[systemDefinition.firstBarIdx]">
      <tie-canvas
        v-if="$data.$_isTiedFromPreviousPartNote && $data.$_isTiedFromPreviousPartNote[partIdx]"
        v-bind:key="'tie-barkward-' + systemDefinition.firstBarIdx + '-' + partIdx"
        v-bind="$data.$_firstTieProps[partIdx]"
        v-bind:style="$data.$_firstTieStyles[partIdx]"
      />
    </template>
    <template v-for="barIdx of $_barIdcs">
      <bar-component
        v-bind:key="barIdx"
        v-bind:score="score"
        v-bind:section-idx="systemDefinition.sectionIdx"
        v-bind:bar-idx="barIdx"
        v-bind:selected-part-idx="selectedPartIdx"
        v-bind:selected-note-idx="selectedNoteIdx"
        v-bind:show-clef="$_getShowClef(barIdx)"
        v-bind:show-beat="$_getShowBeat(barIdx)"
        v-bind:staff-background-color="staffBackgroundColor"
        v-bind:selected-staff-background-color="selectedStaffBackgroundColor"
        v-bind:is-hover-menu-enabled="isBarHoverMenuEnabled"
        v-bind:is-print-layout-enabled="isPrintLayoutEnabled"
        v-on:bar-element-update="$_onBarElementsUpdate(barIdx, $event)"
        v-on:tie-point-update="$_onTiePointUpdate(barIdx, $event)"
        v-on:margin-top-px-update="$_onMarginTopPxUpdate(barIdx, $event)"
        v-on:margin-bottom-px-update="$_onMarginBottomPxUpdate(barIdx, $event)"
        v-on:click-note="$_onClickNote(barIdx, $event)"
        v-on:mousedown-staff="$_onMousedownStaff(barIdx, $event)"
        v-on:mouseup-staff="$_onMouseupStaff(barIdx, $event)"
      />
      <template v-for="partIdx of $_partIdcs[barIdx]">
        <tie-canvas
          v-if="$data.$_isTiedToNextPartNote && $data.$_isTiedToNextPartNote[barIdx][partIdx]"
          v-bind:key="'tie-' + barIdx + '-' +  partIdx"
          v-bind="$data.$_tieProps[barIdx][partIdx]"
          v-bind:style="$data.$_tieStyles[barIdx][partIdx]"
        />
      </template>
    </template>
  </div>
</template>

<style scoped>
#system {
  display: flex;
  flex-direction: row;
  width: 100%;
  position: relative;
}

#system * {
  flex-grow: 1;
}

#staff-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
</style>

<script>
import BarComponent from '../components/BarComponent.vue';
import StaffCanvas from './canvases/StaffCanvas.vue';
import Score from '../modules/Score.js';
import BarBreak from '../modules/BarBreak.js';
import Note from '../modules/Note.js';
import Color from '../modules/Color.js';
import utils from '../modules/utils.js';
import TieCanvas from './canvases/TieCanvas';

class SystemDefinition {
  constructor(sectionIdx, firstBarIdx, lastBarIdx, showBeatOnFirstBar) {
    this.sectionIdx = sectionIdx;
    this.firstBarIdx = firstBarIdx;
    this.lastBarIdx = lastBarIdx;
    this.showBeatOnFirstBar = showBeatOnFirstBar;
  }

  get numBars() {
    return this.lastBarIdx - this.firstBarIdx + 1;
  }

  get barIdcs() {
    let barIdcs = new Array();
    for (let barIdx = this.firstBarIdx; barIdx <= this.lastBarIdx; ++barIdx) {
      barIdcs.push(barIdx);
    }
    return barIdcs;
  }
}

export {
  SystemDefinition,
}

export default {
  components: {
    BarComponent,
    StaffCanvas,
    TieCanvas,
  },

  watch: {
    $_bars: {
      handler(newBars, oldBars) {
        if (!areBarsEqualTo(newBars, oldBars)) {
          this.$_rerenderSystem();
        }

        function areBarsEqualTo(thisBars, thatBars) {
          let thisBarIdcs = Object.keys(thisBars);
          let thatBarIdcs = Object.keys(thatBars);
          if (thisBarIdcs.length !== thatBarIdcs.length) return false;
          let thisSortedBars = getValuesSortedByKey(thisBars);
          let thatSortedBars = getValuesSortedByKey(thatBars);
          for (let idxOfBars = 0; idxOfBars < thisSortedBars.length; ++idxOfBars) {
            let newBar = thisSortedBars[idxOfBars];
            let oldBar = thatSortedBars[idxOfBars];
            if (!newBar.isEqualTo(oldBar)) return false;
          }
          return true;

          function getValuesSortedByKey(object) {
            return Object.entries(object).sort((a, b) => (Number(a[0]) - Number(b[0]))).map(a => a[1]);
          }
        }
      },
      deep: true,
    },

    $_barIdcs: {
      handler(newBarIdcs, oldBarIdcs) {
        if (oldBarIdcs === undefined) oldBarIdcs = new Array();
        let addedBarIdcs = newBarIdcs.filter(newBarIdx => (!oldBarIdcs.includes(newBarIdx)));
        let removedBarIdcs = oldBarIdcs.filter(oldBarIdx => (!newBarIdcs.includes(oldBarIdx)));
        for (let barIdx of removedBarIdcs) {
          delete this.$data.$_barElements[barIdx];
          delete this.$data.$_barNoteTieStartPointOffsets[barIdx];
          delete this.$data.$_barNoteTieEndPointOffsets[barIdx];
          delete this.$data.$_isTiedToNextPartNote[barIdx];
        }
        for (let barIdx of addedBarIdcs) {
          this.$data.$_barElements[barIdx] = null;
          this.$data.$_barNoteTieStartPointOffsets[barIdx] = null;
          this.$data.$_barNoteTieEndPointOffsets[barIdx] = null;
          this.$data.$_isTiedToNextPartNote[barIdx] = new Array();
        }
      },
      immediate: true,
    },
  },

  props: {
    score: { type: Score },
    systemDefinition: { type: SystemDefinition },
    selectedPartIdx: { type: Number, default: null },
    selectedNoteIdx: { type: Number, default: null },
    staffBackgroundColor: { type: Color },
    selectedStaffBackgroundColor: { type: Color },
    isBarHoverMenuEnabled: { type: Boolean, default: false },
    isPrintLayoutEnabled: { type: Boolean, default: false },
  },

  data() {
    return {
      $_renderComponent: true,
      $_systemElementResizeObserver: new ResizeObserver(() => {
        this.$_rerenderSystem();
        this.$_updatePositionAndSize();
      }),
      $_marginTopPxMax: this.$store.state.config.systemMarginTopPx,
      $_marginBottomPxMax: this.$store.state.config.systemMarginBottomPx,
      $_marginTopPx: new Object(),
      $_marginBottomPx: new Object(),
      $_barElements: new Object(),
      $_barNoteTieStartPointOffsets: new Object(),
      $_barNoteTieEndPointOffsets: new Object(),
      $_firstTieProps: null,
      $_firstTieStyles: null,
      $_tieProps: null,
      $_tieStyles: null,
      $_isTiedToNextPartNote: new Object(),
      $_isTiedFromPreviousPartNote: new Array(),
    };
  },

  computed: {
    $_bars() {
      let bars = new Object();
      for (let barIdx of this.$_barIdcs) {
        bars[barIdx] = this.score.getBar(this.systemDefinition.sectionIdx, barIdx);
      }
      return bars;
    },

    $_numBars() {
      return this.systemDefinition.numBars;
    },

    $_barIdcs() {
      return this.systemDefinition.barIdcs;
    },

    $_partIdcs() {
      let partIdcs = new Object();
      if (this.score === null) return partIdcs;
      for (let barIdx of this.$_barIdcs) {
        let bar = this.score.getBar(this.systemDefinition.sectionIdx, barIdx);
        if (bar === null) continue;
        partIdcs[barIdx] = Array.from(Array(bar.parts.length), (v, k) => k);
      }
      return partIdcs;
    },

    $_internalMarginTopPx() {
      return this.$store.state.config.staffLineStepPx * 2;
    },

    $_staffHeightPx() {
      return this.$store.state.config.staffLineStepPx * 4 + 1;
    },

    $_staffCanvasStyle() {
      return {
        marginTop: String(-this.$_internalMarginTopPx) + 'px',
        height: String(this.$_staffHeightPx) + 'px',
      };
    },

    $_systemStyle() {
      return {
        marginTop: String(this.$data.$_marginTopPxMax) + 'px',
        marginBottom: String(this.$data.$_marginBottomPxMax) + 'px',
      };
    },
  },

  mounted() {
    this.$data.$_systemElementResizeObserver.observe(this.$el);
    this.$_updatePositionAndSize();
  },

  destroyed() {
    this.$data.$_systemElementResizeObserver.disconnect();
  },

  methods: {
    $_rerenderSystem() {
      this.$data.$_renderComponent = false;
      this.$nextTick(() => {
        this.$data.$_renderComponent = true;
      })
    },

    $_getShowClef(barIdx) {
      if (barIdx === 0) {
        return true;
      } else {
        let currentBar = this.score.getBar(this.systemDefinition.sectionIdx, barIdx);
        let previousBar = this.score.getBar(this.systemDefinition.sectionIdx, barIdx - 1);
        if (previousBar.break !== BarBreak.empty) return true;
        let currentClef = currentBar.clef;
        let previousClef = previousBar.clef;
        if (!currentClef.isEqualTo(previousClef)) return true;
        return false;
      }
    },

    $_getShowBeat(barIdx) {
      if (barIdx === 0) {
        return this.systemDefinition.showBeatOnFirstBar;
      } else {
        let currentBarValue = this.score.getBar(this.systemDefinition.sectionIdx, barIdx).value;
        let previousBarValue = this.score.getBar(this.systemDefinition.sectionIdx, barIdx - 1).value;
        if (currentBarValue.numerator !== previousBarValue.numerator) return true;
        if (currentBarValue.denominator !== previousBarValue.denominator) return true;
        return false;
      }
    },

    $_onBarElementsUpdate(barIdx, barElement) {
      this.$set(this.$data.$_barElements, barIdx, barElement);
      this.$_updateTiePropsAndStyles();
    },

    $_onTiePointUpdate(barIdx, { tieStartPointOffsets, tieEndPointOffsets }) {
      this.$set(this.$data.$_barNoteTieStartPointOffsets, barIdx, tieStartPointOffsets);
      this.$set(this.$data.$_barNoteTieEndPointOffsets, barIdx, tieEndPointOffsets);
      this.$_updateTiePropsAndStyles();
    },

    $_onMarginTopPxUpdate(barIdx, marginTopPx) {
      if (marginTopPx === null) {
        this.$delete(this.$data.$_marginTopPx, barIdx);
      } else {
        this.$set(this.$data.$_marginTopPx, barIdx, marginTopPx);
      }
      this.$nextTick(() => {
        this.$data.$_marginTopPxMax = utils.max(
          this.$store.state.config.systemMarginTopPx,
          ...Object.values(this.$data.$_marginTopPx),
        );
      });
    },

    $_onMarginBottomPxUpdate(barIdx, marginBottomPx) {
      if (marginBottomPx === null) {
        this.$delete(this.$data.$_marginBottomPx, barIdx);
      } else {
        this.$set(this.$data.$_marginBottomPx, barIdx, marginBottomPx);
      }
      this.$nextTick(() => {
        this.$data.$_marginBottomPxMax = utils.max(
          this.$store.state.config.systemMarginBottomPx,
          ...Object.values(this.$data.$_marginBottomPx),
        );
      });
    },

    $_onClickNote(barIdx, { partIdx, noteIdx }) {
      this.$emit('select-note', { barIdx, partIdx, noteIdx });
    },

    $_onMousedownStaff(barIdx, event) {
      this.$emit('mousedown-staff', { barIdx, event });
    },

    $_onMouseupStaff(barIdx, event) {
      this.$emit('mouseup-staff', { barIdx, event });
    },

    $_updatePositionAndSize() {
      this.$_updateTiePropsAndStyles();
    },

    $_updateTiePropsAndStyles() {
      let firstTieProps = new Object();
      let firstTieStyles = new Object();
      let isTiedFromPreviousPartNote = new Object();
      let tieProps = new Object();
      let tieStyles = new Object();
      let isTiedToNextPartNote = new Object();
      let firstBar = this.score.getBar(this.systemDefinition.sectionIdx, this.systemDefinition.firstBarIdx);
      if (this.$el.nodeType === Node.COMMENT_NODE) return;
      let systemElementBoundingClientRect = this.$el.getBoundingClientRect();
      for (let firstPartIdx of this.$_partIdcs[this.systemDefinition.firstBarIdx]) {
        let firstPart = firstBar.parts[firstPartIdx]
        let firstNoteIdxOfFirstPart = 0;
        if (firstPart.notes.length === 0) continue;
        let firstNoteOfFirstPart = firstPart.notes[firstNoteIdxOfFirstPart];
        if (firstNoteOfFirstPart.tied) {
          let {
            sectionIdx: previousSectionIdx,
            barIdx: previousBarIdx,
            partIdx: previousPartIdx,
          } = this.score.findSameTypedPartIndexInPreviousBar({
            sectionIdx: this.systemDefinition.sectionIdx,
            barIdx: this.systemDefinition.firstBarIdx,
            partIdx: firstNoteIdxOfFirstPart,
          });
          if ((previousSectionIdx === null) || (previousBarIdx === null) || (previousPartIdx === null)) continue;
          let firstBarNoteTieEndOffsets = this.$data.$_barNoteTieEndPointOffsets[this.systemDefinition.firstBarIdx];
          if (utils.isNullOrUndefined(firstBarNoteTieEndOffsets)) continue;
          let firstBarNoteTieEndOffset = firstBarNoteTieEndOffsets[firstPartIdx];
          if (utils.isNullOrUndefined(firstBarNoteTieEndOffset)) continue;

          let firstBarElement = this.$data.$_barElements[this.systemDefinition.firstBarIdx];
          if (utils.isNullOrUndefined(firstBarElement)) continue;
          let firstBarElementBoundingClientRect = firstBarElement.getBoundingClientRect();

          let firstTieEndHorizontalOffsetPx = firstBarElementBoundingClientRect.x + firstBarNoteTieEndOffset.x - systemElementBoundingClientRect.x;
          let firstTieEndVerticalOffsetPx = firstBarNoteTieEndOffset.y;
          let firstTieStartHorizontalOffsetPx = firstTieEndHorizontalOffsetPx - 20;
          let firstTieStartVerticalOffsetPx = firstBarNoteTieEndOffset.y;
          firstTieProps[firstPartIdx] = {
            startVerticalOffsetPx: firstTieStartVerticalOffsetPx,
            endVerticalOffsetPx: firstTieEndVerticalOffsetPx,
            widthPx: firstTieEndHorizontalOffsetPx - firstTieStartHorizontalOffsetPx,
          };
          firstTieStyles[firstPartIdx] = {
            position: 'absolute',
            left: String(firstTieStartHorizontalOffsetPx) + 'px',
          };
          isTiedFromPreviousPartNote[firstPartIdx] = true;
        }
      }

      for (let currentBarIdx of this.$_barIdcs) {
        let currentBar = this.score.getBar(this.systemDefinition.sectionIdx, currentBarIdx);
        if (currentBar === null) continue;
        tieProps[currentBarIdx] = new Array(currentBar.parts.length);
        tieProps[currentBarIdx].fill(null);
        tieStyles[currentBarIdx] = new Array(currentBar.parts.length);
        tieStyles[currentBarIdx].fill(null);
        isTiedToNextPartNote[currentBarIdx] = new Array(currentBar.parts.length);
        isTiedToNextPartNote[currentBarIdx].fill(false);
        for (let currentPartIdx of this.$_partIdcs[currentBarIdx]) {
          let currentPart = currentBar.parts[currentPartIdx];
          let numNotesOfCurrentPart = currentPart.notes.length;
          if (numNotesOfCurrentPart === 0) continue;
          let lastNoteOfCurrentPart = currentPart.notes[numNotesOfCurrentPart - 1];
          if (lastNoteOfCurrentPart.type === Note.Type.rest) continue;
          let {
            sectionIdx: nextSectionIdx,
            barIdx: nextBarIdx,
            partIdx: nextPartIdx,
          } = this.score.findSameTypedPartIndexInNextBar({
            sectionIdx: this.systemDefinition.sectionIdx,
            barIdx: currentBarIdx,
            partIdx: currentPartIdx,
          });
          if ((nextSectionIdx === null) || (nextBarIdx === null) || (nextPartIdx === null)) continue;
          let nextPart = this.score.getPart(nextSectionIdx, nextBarIdx, nextPartIdx);
          if (nextPart.notes.length === 0) continue;
          let firstNoteIdxOfNextPart = 0;
          let firstNoteOfNextPart = nextPart.notes[firstNoteIdxOfNextPart];
          if (firstNoteOfNextPart.tied) {
            let currentBarNoteTieStartOffsets = this.$data.$_barNoteTieStartPointOffsets[currentBarIdx];
            if (utils.isNullOrUndefined(currentBarNoteTieStartOffsets)) continue;
            let currentBarNoteTieStartOffset = currentBarNoteTieStartOffsets[currentPartIdx];
            if (utils.isNullOrUndefined(currentBarNoteTieStartOffset)) continue;

            let currentBarElement = this.$data.$_barElements[currentBarIdx];
            if (utils.isNullOrUndefined(currentBarElement)) continue;
            let currentBarElementBoundingClientRect = currentBarElement.getBoundingClientRect();

            let tieStartHorizontalOffsetPx = currentBarElementBoundingClientRect.x + currentBarNoteTieStartOffset.x - systemElementBoundingClientRect.x;
            let tieStartVerticalOffsetPx = currentBarNoteTieStartOffset.y;

            let tieEndHorizontalOffsetPx;
            let tieEndVerticalOffsetPx;
            if (currentBarIdx < this.systemDefinition.lastBarIdx) {
              let nextBarNoteTieEndOffsets = this.$data.$_barNoteTieEndPointOffsets[nextBarIdx];
              if (utils.isNullOrUndefined(nextBarNoteTieEndOffsets)) continue;
              let barNoteTieEndOffset = nextBarNoteTieEndOffsets[nextPartIdx];
              if (utils.isNullOrUndefined(barNoteTieEndOffset)) continue;
              let nextBarElement = this.$data.$_barElements[nextBarIdx];
              if (utils.isNullOrUndefined(nextBarElement)) continue;
              let nextBarElementBoundingClientRect = nextBarElement.getBoundingClientRect();
              tieEndHorizontalOffsetPx = nextBarElementBoundingClientRect.x + barNoteTieEndOffset.x - systemElementBoundingClientRect.x;
              tieEndVerticalOffsetPx = barNoteTieEndOffset.y;
            } else {
              tieEndHorizontalOffsetPx = currentBarElementBoundingClientRect.x + currentBarElementBoundingClientRect.width - systemElementBoundingClientRect.x;
              tieEndVerticalOffsetPx = currentBarNoteTieStartOffset.y;
            }

            tieProps[currentBarIdx][currentPartIdx] = {
              startVerticalOffsetPx: tieStartVerticalOffsetPx,
              endVerticalOffsetPx: tieEndVerticalOffsetPx,
              widthPx: tieEndHorizontalOffsetPx - tieStartHorizontalOffsetPx,
            };
            tieStyles[currentBarIdx][currentPartIdx] = {
              position: 'absolute',
              left: String(tieStartHorizontalOffsetPx) + 'px',
            };
            isTiedToNextPartNote[currentBarIdx][currentPartIdx] = true;
          }
        }
      }
      this.$data.$_firstTieProps = firstTieProps;
      this.$data.$_firstTieStyles = firstTieStyles;
      this.$data.$_tieProps = tieProps;
      this.$data.$_tieStyles = tieStyles;
      this.$data.$_isTiedToNextPartNote = isTiedToNextPartNote;
      this.$data.$_isTiedFromPreviousPartNote = isTiedFromPreviousPartNote;
    },
  },
}
</script>