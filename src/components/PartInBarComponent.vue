<template>
  <div id="part-in-bar">
    <template v-for="(note, noteIdx) in $_part.notes">
      <note-base-component
        v-bind:key="noteIdx"
        v-bind:offset-note-value="$_offsetNoteValues[noteIdx]"
        v-bind:note="note"
        v-bind:part-type="$_part.type"
        v-bind:rest-note-pitch="$_part.restNotePitch"
        v-bind:is-selected="$_isNoteSelected(noteIdx)"
        v-on:split-note-elements-update="$_onSplitNoteElementsUpdate(noteIdx, $event)"
        v-on:note-chord-element-update="$_onNoteChordElementUpdate(noteIdx, $event)"
        v-on:tie-point-update="$_onNoteTiePointUpdate(noteIdx, $event)"
        v-on:click-note="$_onClickNote(noteIdx)"
      />
      <tie-canvas
        v-if="$data.$_isTiedToNextNote && $data.$_isTiedToNextNote[noteIdx]"
        v-bind:key="'tie' + noteIdx"
        v-bind="$data.$_tieProps[noteIdx]"
        v-bind:style="$data.$_tieStyles[noteIdx]"
      />
    </template>
  </div>
</template>

<style scoped>
#part-in-bar {
  display: flex;
  flex-direction: row;
  position: relative;
}
</style>

<script>
import NoteBaseComponent from './NoteBaseComponent.vue'
import TieCanvas from './canvases/TieCanvas.vue'
import Score from '../modules/Score.js'
import NoteValue from '../modules/NoteValue.js'
import utils from '../modules/utils.js'

export default {
  components: {
    NoteBaseComponent,
    TieCanvas,
  },

  watch: {
    $_numNotes: {
      handler(newNumNotes, oldNumNotes) {
        if (oldNumNotes === undefined) oldNumNotes = 0;
        if (newNumNotes > oldNumNotes) {
          for (let noteIdx = oldNumNotes; noteIdx < newNumNotes; ++noteIdx) {
            this.$data.$_splitNoteElements.push(null);
            this.$data.$_noteChordElements.push(null);
            this.$data.$_noteTieStartOffsets.push(null);
            this.$data.$_noteTieEndOffsets.push(null);
          }
        } else if(newNumNotes < oldNumNotes) {
          this.$data.$_splitNoteElements.splice(newNumNotes);
          this.$data.$_noteChordElements.splice(newNumNotes);
          this.$data.$_noteTieStartOffsets.splice(newNumNotes);
          this.$data.$_noteTieEndOffsets.splice(newNumNotes);
        }
      },
      immediate: true,
    },
  },

  props: {
    score: { type: Score },
    sectionIdx: { type: Number },
    barIdx: { type: Number },
    partIdx: { type: Number },
    selectedNoteIdx: { type: Number, default: null },
  },

  data() {
    return {
      $_partInBarElementResizeObserver: new ResizeObserver(this.$_updatePositionAndSize),
      $_resizeObserver: null,
      $_noteTieStartOffsets: new Array(),
      $_noteTieEndOffsets: new Array(),
      $_splitNoteElements: new Array(),
      $_noteChordElements: new Array(),
      $_tieProps: null,
      $_tieStyles: null,
      $_isTiedToNextNote: null,
    };
  },

  computed: {
    $_part() {
      if (this.score === null) return null;
      return this.score.getPart(this.sectionIdx, this.barIdx, this.partIdx);
    },

    $_previousBar() {
      if (this.score === null) return null;
      let {
        sectionIdx: previousSectionIdx,
        barIdx: previousBarIdx,
      } = this.score.getPreviousSectionAndBarIdx({
        sectionIdx: this.sectionIdx,
        barIdx: this.barIdx
      });
      return this.getBar(previousSectionIdx, previousBarIdx);
    },

    $_previousPart() {
      if (this.score === null) return null;
      let {
        sectionIdx: previousSectionIdx,
        barIdx: previousBarIdx,
        partIdx: previousPartIdx,
      } = this.score.findSameTypedPartIndexInPreviousBar({
        sectionIdx: this.sectionIdx,
        barIdx: this.barIdx,
        partIdx: this.partIdx,
      });
      return this.score.getPart(previousSectionIdx, previousBarIdx, previousPartIdx);
    },

    $_numNotes() {
      return this.score.getNumNotes(this.sectionIdx, this.barIdx, this.partIdx);
    },

    $_firstNoteIdx() {
      return this.score.getFirstNoteIdx(this.sectionIdx, this.barIdx, this.partIdx);
    },

    $_lastNoteIdx() {
      return this.score.getLastNoteIdx(this.sectionIdx, this.barIdx, this.partIdx);
    },

    $_offsetNoteValues() {
      let offsetNoteValues = new Array();
      let accumulatedNoteValue = new NoteValue(0);
      for (let note of this.$_part.notes) {
        offsetNoteValues.push(accumulatedNoteValue);
        accumulatedNoteValue = accumulatedNoteValue.add(note.value);
      }
      return offsetNoteValues;
    },
  },

  mounted() {
    this.$data.$_partInBarElementResizeObserver.observe(this.$el);
    this.$_updatePositionAndSize();
  },

  destroyed() {
    this.$data.$_partInBarElementResizeObserver.disconnect();
  },

  methods: {
    $_isNoteSelected(noteIdx) {
      if (this.selectedNoteIdx === null) return false;
      return this.selectedNoteIdx === noteIdx;
    },

    $_onSplitNoteElementsUpdate(noteIdx, splitNoteElements) {
      this.$set(this.$data.$_splitNoteElements, noteIdx, splitNoteElements);
      this.$emit('note-elements-update', this.$data.$_splitNoteElements);
      this.$_updatePositionAndSize();
    },

    $_onNoteChordElementUpdate(noteIdx, noteChordElement) {
      this.$set(this.$data.$_noteChordElements, noteIdx, noteChordElement);
      this.$emit('note-chord-elements-update', this.$data.$_noteChordElements);
    },

    $_onNoteTiePointUpdate(noteIdx, { tieStartPointOffset, tieEndPointOffset }) {
      this.$set(this.$data.$_noteTieStartOffsets, noteIdx, tieStartPointOffset);
      this.$set(this.$data.$_noteTieEndOffsets, noteIdx, tieEndPointOffset);
      this.$_updatePositionAndSize();
    },

    $_onClickNote(noteIdx) {
      this.$emit('click-note', noteIdx);
    },

    $_updatePositionAndSize() {
      this.$_updateTiePropsAndStyles();
      this.$_emitTiePointUpdate();
    },

    $_emitTiePointUpdate() {
      let firstSplitNoteElements = this.$data.$_splitNoteElements[this.$_firstNoteIdx];
      if (utils.isNullOrUndefined(firstSplitNoteElements)) return;
      let firstNoteElement = firstSplitNoteElements[0];
      if (utils.isNullOrUndefined(firstNoteElement)) return;
      let lastSplitNoteElements = this.$data.$_splitNoteElements[this.$_lastNoteIdx];
      if (utils.isNullOrUndefined(lastSplitNoteElements)) return;
      let lastSplitNoteIdxOfLastNote = lastSplitNoteElements.length - 1;
      let lastNoteElement = lastSplitNoteElements[lastSplitNoteIdxOfLastNote];
      if (utils.isNullOrUndefined(lastNoteElement)) return;
      let partElementBoundingClientRect = this.$el.getBoundingClientRect();
      let firstNoteElementBoundingClientRect = firstNoteElement.getBoundingClientRect();
      let lastNoteElementBoundingClientRect = lastNoteElement.getBoundingClientRect();
      let firstNoteTieEndOffset = this.$data.$_noteTieEndOffsets[0];
      let partTieEndPointOffset = null;
      if (firstNoteTieEndOffset !== null) {
        partTieEndPointOffset = new DOMPoint(
          firstNoteElementBoundingClientRect.x + firstNoteTieEndOffset.x - partElementBoundingClientRect.x,
          firstNoteTieEndOffset.y,
        );
      }
      let lastNoteTieStartOffset = this.$data.$_noteTieStartOffsets[this.$_lastNoteIdx];
      let partTieStartPointOffset = null;
      if (lastNoteTieStartOffset !== null) {
        partTieStartPointOffset = new DOMPoint(
          lastNoteElementBoundingClientRect.x + lastNoteTieStartOffset.x - partElementBoundingClientRect.x,
          lastNoteTieStartOffset.y,
        );
      }
      this.$emit(
        'tie-point-update',
        {
          tieEndPointOffset: partTieEndPointOffset,
          tieStartPointOffset: partTieStartPointOffset,
        },
      );
    },

    $_updateTiePropsAndStyles() {
      let tieProps = new Array(this.$_numNotes);
      tieProps.fill(null);
      let tieStyles = new Array(this.$_numNotes);
      tieStyles.fill(null);
      let isTiedToNextNote = new Array(this.$_numNotes);
      isTiedToNextNote.fill(false);
      for (let noteIdx = 0; noteIdx < this.$_lastNoteIdx; ++noteIdx) {
        let nextNoteIdx = noteIdx + 1;
        if (
          !utils.isNullOrUndefined(this.$data.$_splitNoteElements[noteIdx]) && 
          !utils.isNullOrUndefined(this.$data.$_splitNoteElements[nextNoteIdx]) && 
          !utils.isNullOrUndefined(this.$data.$_noteTieStartOffsets[noteIdx]) && 
          !utils.isNullOrUndefined(this.$data.$_noteTieEndOffsets[nextNoteIdx]) &&
          (this.$_part.notes[nextNoteIdx].tied))
        {
          let partElementBoundingClientRect = this.$el.getBoundingClientRect();
          let lastNoteIdxOfCurrentNote = this.$data.$_splitNoteElements[noteIdx].length - 1;
          let lastNoteElementOfCurrentNote = this.$data.$_splitNoteElements[noteIdx][lastNoteIdxOfCurrentNote];
          let currentNoteElementBoundingClientRect = lastNoteElementOfCurrentNote.getBoundingClientRect();
          let noteTieStartOffset = this.$data.$_noteTieStartOffsets[noteIdx];
          let firstNoteElementOfNextNote = this.$data.$_splitNoteElements[nextNoteIdx][0];
          let nextNoteElementBoundingClientRect = firstNoteElementOfNextNote.getBoundingClientRect();
          let noteTieEndOffset = this.$data.$_noteTieEndOffsets[nextNoteIdx];
          let tieStartHorizontalOffsetPx = (currentNoteElementBoundingClientRect.x - partElementBoundingClientRect.x) + noteTieStartOffset.x;
          let tieStartVerticalOffsetPx = noteTieStartOffset.y;
          let tieEndHorizontalOffsetPx = (nextNoteElementBoundingClientRect.x - partElementBoundingClientRect.x) + noteTieEndOffset.x;
          let tieEndVerticalOffsetPx = noteTieEndOffset.y;
          tieProps[noteIdx] = {
            startVerticalOffsetPx: tieStartVerticalOffsetPx,
            endVerticalOffsetPx: tieEndVerticalOffsetPx,
            widthPx: tieEndHorizontalOffsetPx - tieStartHorizontalOffsetPx,
          }
          tieStyles[noteIdx] = {
            position: 'absolute',
            left: String(tieStartHorizontalOffsetPx) + 'px',
          };
          isTiedToNextNote[noteIdx] = true;
        }
      }
      this.$data.$_tieProps = tieProps;
      this.$data.$_tieStyles = tieStyles;
      this.$data.$_isTiedToNextNote = isTiedToNextNote;
    },
  },
}
</script>