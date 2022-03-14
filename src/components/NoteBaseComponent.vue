<template>
  <div
    id="note-base-component"
    v-bind="$attrs"
    v-bind:style="$_noteComponentStyle"
  >
    <div
      id="chord-component-container"
      v-if="$_isPartTypeChord && !$_isChordNull"
    >
      <chord-component
        v-bind:chord="note.pitchOrChord"
        v-bind:style="$_chordStyle"
        v-on:note-element-update="$_onChordComponentElementUpdate"
      />
    </div>
    <div id="split-divisible-notes-container">
      <div
        class="split-divisible-note-container"
        v-for="(splitDivisibleNote, splitDivisibleNoteIdx) in $_splitDivisibleNotes"
        v-bind:key="splitDivisibleNoteIdx"
        v-bind:style="$_splitDivisibleNoteContainerStyles[splitDivisibleNoteIdx]"
      >
        <template v-if="$_isNormalNote(splitDivisibleNote.type)">
          <template v-if="$_isPartTypeChord">
            <chord-note-canvas
              v-if="!$_isChordNull"
              v-bind:note="splitDivisibleNote"
              v-bind:invert-stem-direction="true"
              v-bind:color="$_noteColor"
              v-on:note-element-update="$_onNoteElementUpdate(splitDivisibleNoteIdx, $event)"
            />
          </template>
        </template>
        <rest-note-canvas
          v-if="$_isRestNote(splitDivisibleNote.type)"
          v-bind:note-value="splitDivisibleNote.value"
          v-bind:rest-note-pitch="restNotePitch"
          v-bind:color="$_noteColor"
          v-on:note-element-update="$_onNoteElementUpdate(splitDivisibleNoteIdx, $event)"
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
import Color from '../modules/Color.js'
import utils from '../modules/utils.js'

export default {
  components: {
    ChordComponent,
    ChordNoteCanvas,
    RestNoteCanvas,
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
      $_splitNoteElementWidthPxs: new Object(),
      $_noteSubElements: new Object(),
    };
  },

  computed: {
    $_noteComponentStyle() {
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
      for (let splitNoteElementWidthPx of Object.values(this.$data.$_splitNoteElementWidthPxs)) {
        totalNoteElementWidthPx += splitNoteElementWidthPx;
      }
      return utils.max(chordElementWidthPx, totalNoteElementWidthPx);
    },

    $_splitDivisibleNoteValues() {
      return this.note.value.splitIntoDivisibleNoteValues(this.offsetNoteValue, this.$store.state.config.gridNoteValue);
    },

    $_splitDivisibleNotes() {
      return this.$_splitDivisibleNoteValues.map(
        splitDivisibleNoteValue => {
          return new Note(this.note.pitchOrChord, splitDivisibleNoteValue, this.note.type);
        }
      );
    },

    $_numSplitDivisibleNotes() {
      return this.$_splitDivisibleNotes.length;
    },

    $_splitDivisibleNoteContainerStyles() {
      let splitDivisibleNoteContainerStyles = new Array();
      for (let splitDivisibleNoteIdx = 0; splitDivisibleNoteIdx < this.$_numSplitDivisibleNotes; ++splitDivisibleNoteIdx) {
        let splitDivisibleNoteValue = this.$_splitDivisibleNoteValues[splitDivisibleNoteIdx];
        let splitDivisibleNoteElementWidthPx = this.$data.$_splitNoteElementWidthPxs[splitDivisibleNoteIdx];
        splitDivisibleNoteContainerStyles.push({
          flexGrow: splitDivisibleNoteValue.divide(NoteValue.divisible.sixtyFourth).toNumber(),
          flexBasis: String(utils.max(splitDivisibleNoteElementWidthPx, this.$data.$_chordElementWidthPx)) + 'px',
        });
      }
      return splitDivisibleNoteContainerStyles;
    },
  },

  methods: {
    $_isNormalNote(noteType) {
      return noteType === Note.Type.normal;
    },

    $_isRestNote(noteType) {
      return noteType === Note.Type.rest;
    },

    $_onChordComponentElementUpdate(chordComponentElement) {
      if (chordComponentElement === null) {
        this.$delete(this.$data.$_noteSubElements, 'chordComponent');
        this.$data.$_chordElementWidthPx = null;
      } else {
        this.$set(this.$data.$_noteSubElements, 'chordComponent', chordComponentElement);
        this.$data.$_chordElementWidthPx = chordComponentElement.getBoundingClientRect().width;
      }
      this.$emit('note-elements-update', this.$data.$_noteSubElements);
    },

    $_onNoteElementUpdate(divisibleSplitNoteIdx, { element, widthPx }) {
      let noteElementKey = 'chordNoteCanvas' + String(divisibleSplitNoteIdx);
      if (element === null) {
        this.$delete(this.$data.$_noteSubElements, noteElementKey);
      } else {
        this.$set(this.$data.$_noteSubElements, noteElementKey, element);
      }
      if (widthPx === null) {
        this.$delete(this.$data.$_splitNoteElementWidthPxs, noteElementKey);
      } else {
        this.$set(this.$data.$_splitNoteElementWidthPxs, noteElementKey, widthPx);
      }
      this.$emit('note-elements-update', this.$data.$_noteSubElements);
    },
  }
}
</script>