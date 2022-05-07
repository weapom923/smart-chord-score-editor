<template>
  <div
    id="note-base-component"
    v-bind="$attrs"
    v-bind:style="$_noteBaseComponentStyle"
  >
    <div
      id="chord-component-container"
      v-if="$_isPartTypeChord && !$_isChordNull"
    >
      <chord-component
        v-bind:chord="note.pitchOrChord"
        v-bind:style="$_chordStyle"
        v-on:note-element-update="$_onChordComponentElementUpdate"
        v-on:click="$_onClickNote"
      />
    </div>
    <div id="split-divisible-notes-container">
      <div
        class="split-divisible-note-container"
        v-for="(splitNote, splitNoteIdx) in $_splitNotes"
        v-bind:key="splitNoteIdx"
        v-bind:style="$_splitNoteContainerStyles[splitNoteIdx]"
        v-on:click="$_onClickNote"
      >
        <template v-if="$_isNormalNote(splitNote.type)">
          <template v-if="$_isPartTypeChord">
            <chord-note-canvas
              v-bind:note="splitNote"
              v-bind:invert-stem-direction="true"
              v-bind:color="$_noteColor"
              v-on:element-update="$_onNoteElementUpdate(splitNoteIdx, $event)"
              v-on:width-update="$_onNoteWidthUpdate(splitNoteIdx, $event)"
              v-on:tie-point-update="$_onNoteTiePointUpdate(splitNoteIdx, $event)"
            />
            <tie-canvas
              v-if="!$_isLastSplitNote(splitNoteIdx)"
              v-bind="$data.$_tieProps[splitNoteIdx]"
              v-bind:style="$data.$_tieStyles[splitNoteIdx]"
            />
          </template>
        </template>
        <rest-note-canvas
          v-if="$_isRestNote(splitNote.type)"
          v-bind:note-value="splitNote.value"
          v-bind:rest-note-pitch="restNotePitch"
          v-bind:color="$_noteColor"
          v-on:element-update="$_onNoteElementUpdate(splitNoteIdx, $event)"
          v-on:width-update="$_onNoteWidthUpdate(splitNoteIdx, $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
#note-base-component {
  position: relative;
  flex-shrink: 0;
}

#note-spacer {
  height: 3px;
  background-color: #000;
  position: relative;
}

#split-divisible-notes-container {
  display: flex;
  flex-direction: row;
}

.split-divisible-note-container {
  position: relative;
}

#chord-component-container {
  position: absolute;
  left: 0;
  bottom: 0;
}
</style>

<script>
import PartInBar from '../modules/PartInBar.js'
import Note from '../modules/Note.js'
import NoteValue from '../modules/NoteValue.js'
import NotePitch from '../modules/NotePitch.js'
import ChordComponent from './ChordComponent.vue'
import ChordNoteCanvas from './canvases/ChordNoteCanvas.vue'
import RestNoteCanvas from './canvases/RestNoteCanvas.vue'
import TieCanvas from './canvases/TieCanvas.vue'
import Color from '../modules/Color.js'
import utils from '../modules/utils.js'

export default {
  components: {
    ChordComponent,
    ChordNoteCanvas,
    RestNoteCanvas,
    TieCanvas,
  },

  watch: {
    $_numSplitNotes: {
      handler(newNumSplitNotes, oldNumSplitNotes) {
        if (newNumSplitNotes > oldNumSplitNotes) {
          for (
            let splitNoteIdx = oldNumSplitNotes;
            splitNoteIdx < newNumSplitNotes;
            ++splitNoteIdx
          )
          {
            this.$data.$_splitNoteElementWidthPxs.push(0);
            this.$data.$_splitNoteTieStartOffsets.push(null);
            this.$data.$_splitNoteTieEndOffsets.push(null);
            this.$data.$_splitNoteElements.push(null);
          }
        } else if(newNumSplitNotes < oldNumSplitNotes) {
          this.$data.$_splitNoteElementWidthPxs.splice(newNumSplitNotes);
          this.$data.$_splitNoteTieStartOffsets.splice(newNumSplitNotes);
          this.$data.$_splitNoteTieEndOffsets.splice(newNumSplitNotes);
          this.$data.$_splitNoteElements.splice(newNumSplitNotes);
        }
      },
      immediate: true,
    }
  },

  props: {
    offsetNoteValue: { type: NoteValue },
    note: { type: Note },
    partType: { type: String },
    restNotePitch: { type: NotePitch, default: null },
    isSelected: { type: Boolean, default: false },
  },

  data() {
    return {
      $_chordElementWidthPx: null,
      $_splitNoteElementWidthPxs: new Array(),
      $_splitNoteTieStartOffsets: new Array(),
      $_splitNoteTieEndOffsets: new Array(),
      $_splitNoteElements: new Array(),
      $_chordElement: null,
      $_tieProps: new Array(),
      $_tieStyles: new Array(),
    };
  },

  computed: {
    $_noteBaseComponentStyle() {
      return {
        flexGrow: this.note.value.divide(NoteValue.divisible.sixtyFourth).toNumber(),
        width: String(this.$_maximumSubComponentWidthPx) + 'px',
      };
    },

    $_chordStyle() {
      return {
        marginBottom: String(this.$store.state.config.staffLineStepPx * 2) + 'px',
      };
    },

    $_noteColor() {
      return (this.isSelected)? this.$store.state.config.selectedNoteColor : Color.black;
    },

    $_isPartTypeChord() { return this.partType === PartInBar.Type.chord },

    $_isChordNull() { return this.note.pitchOrChord === null },

    $_maximumSubComponentWidthPx() {
      let chordElementWidthPx = (this.$data.$_chordElementWidthPx !== null)? this.$data.$_chordElementWidthPx : 0;
      let totalNoteElementWidthPx = 0;
      for (let splitNoteElementWidthPx of this.$data.$_splitNoteElementWidthPxs) {
        totalNoteElementWidthPx += splitNoteElementWidthPx;
      }
      return utils.max(chordElementWidthPx, totalNoteElementWidthPx);
    },

    $_splitNoteValues() {
      return this.note.value.splitIntoDivisibleNoteValues(this.offsetNoteValue, this.$store.state.config.gridNoteValue);
    },

    $_splitNotes() {
      return this.$_splitNoteValues.map(
        splitNoteValue => {
          return new Note(this.note.pitchOrChord, splitNoteValue, this.note.type, this.note.tied);
        }
      );
    },

    $_numSplitNotes() {
      return this.$_splitNotes.length;
    },

    $_lastSplitNoteIdx() {
      return this.$_numSplitNotes - 1;
    },

    $_splitNoteContainerStyles() {
      let splitNoteContainerStyles = new Array();
      for (let splitNoteIdx = 0; splitNoteIdx < this.$_numSplitNotes; ++splitNoteIdx) {
        let splitNoteValue = this.$_splitNoteValues[splitNoteIdx];
        let splitNoteElementWidthPx = this.$data.$_splitNoteElementWidthPxs[splitNoteIdx];
        splitNoteContainerStyles.push({
          flexGrow: splitNoteValue.divide(NoteValue.divisible.sixtyFourth).toNumber(),
          flexBasis: String(splitNoteElementWidthPx) + 'px',
          width: String(splitNoteElementWidthPx) + 'px',
        });
      }
      return splitNoteContainerStyles;
    },

    $_noteTieStartOffset() {
      return this.$data.$_splitNoteTieStartOffsets[0];
    },

    $_noteTieEndOffset() {
      let lastNoteTieEndOffsetsIdx = this.$data.$_splitNoteTieEndOffsets.length - 1;
      return this.$data.$_splitNoteTieEndOffsets[lastNoteTieEndOffsetsIdx];
    },
  },

  methods: {
    $_isNormalNote(noteType) {
      return noteType === Note.Type.normal;
    },

    $_isRestNote(noteType) {
      return noteType === Note.Type.rest;
    },

    $_isLastSplitNote(splitNoteIdx) {
      return splitNoteIdx === this.$_lastSplitNoteIdx;
    },

    $_onChordComponentElementUpdate(chordComponentElement) {
      if (chordComponentElement === null) {
        this.$data.$_chordElement = null;
        this.$data.$_chordElementWidthPx = null;
      } else {
        this.$data.$_chordElement = chordComponentElement;
        this.$data.$_chordElementWidthPx = chordComponentElement.getBoundingClientRect().width;
      }
      this.$emit('note-chord-element-update', this.$data.$_chordElement);
    },

    $_onNoteElementUpdate(splitNoteIdx, element) {
      this.$set(this.$data.$_splitNoteElements, splitNoteIdx, element);
      this.$emit('split-note-elements-update', this.$data.$_splitNoteElements);
    },

    $_onNoteWidthUpdate(splitNoteIdx, widthPx) {
      this.$set(this.$data.$_splitNoteElementWidthPxs, splitNoteIdx, widthPx);
    },

    $_onNoteTiePointUpdate(splitNoteIdx, { tieStartPointOffset, tieEndPointOffset }) {
      this.$set(this.$data.$_splitNoteTieStartOffsets, splitNoteIdx, tieStartPointOffset);
      this.$set(this.$data.$_splitNoteTieEndOffsets, splitNoteIdx, tieEndPointOffset);
      this.$nextTick(() => {
        this.$_updateTiePropsAndStyles();
        this.$emit(
          'tie-point-update',
          {
            tieStartPointOffset: this.$_noteTieStartOffset,
            tieEndPointOffset: this.$_noteTieEndOffset,
          },
        );
      });
    },

    $_onClickNote() {
      this.$emit('click-note');
    },

    $_updateTiePropsAndStyles() {
      let tieProps = new Array();
      let tieStyles = new Array();
      for (let splitNoteIdx = 0; splitNoteIdx < this.$_lastSplitNoteIdx; ++splitNoteIdx) {
        let nextSplitNoteIdx = splitNoteIdx + 1;
        let tieProp = new Object();
        let tieStyle = new Object();
        if (
          (this.$data.$_splitNoteElements[splitNoteIdx] !== null) && 
          (this.$data.$_splitNoteElements[nextSplitNoteIdx] !== null) && 
          (this.$data.$_splitNoteTieStartOffsets[splitNoteIdx] !== null) && 
          (this.$data.$_splitNoteTieEndOffsets[nextSplitNoteIdx] !== null))
        {
          let noteBaseElementBoundingClientRect = this.$el.getBoundingClientRect();
          let currentSplitNoteElementBoundingClientRect = this.$data.$_splitNoteElements[splitNoteIdx].getBoundingClientRect();
          let splitNoteTieStartOffset = this.$data.$_splitNoteTieStartOffsets[splitNoteIdx];
          let nextSplitNoteElementBoundingClientRect = this.$data.$_splitNoteElements[nextSplitNoteIdx].getBoundingClientRect();
          let splitNoteTieEndOffset = this.$data.$_splitNoteTieEndOffsets[nextSplitNoteIdx];
          let relativeTieStartHorizontalOffsetPx = (currentSplitNoteElementBoundingClientRect.x - noteBaseElementBoundingClientRect.x) + splitNoteTieStartOffset.x;
          let relativeTieStartVerticalOffsetPx = splitNoteTieStartOffset.y;
          let relativeTieEndHorizontalOffsetPx = (nextSplitNoteElementBoundingClientRect.x - noteBaseElementBoundingClientRect.x) + splitNoteTieEndOffset.x;
          let relativeTieEndVerticalOffsetPx = splitNoteTieEndOffset.y;
          tieProp['startVerticalOffsetPx'] = relativeTieStartVerticalOffsetPx;
          tieProp['endVerticalOffsetPx'] = relativeTieEndVerticalOffsetPx;
          tieProp['widthPx'] = relativeTieEndHorizontalOffsetPx - relativeTieStartHorizontalOffsetPx;
          tieStyle['position'] = 'absolute';
          tieStyle['left'] = String(splitNoteTieStartOffset.x) + 'px';
        }
        tieProps.push(tieProp);
        tieStyles.push(tieStyle);
      }
      this.$data.$_tieProps = tieProps;
      this.$data.$_tieStyles = tieStyles;
    },
  }
}
</script>