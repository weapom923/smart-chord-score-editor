<template>
  <v-card v-bind="$attrs" v-if="$_selectedNote">
    <v-card-text class="pa-0">
      <v-range-slider
        ticks dense hide-details
        v-model="$data.$_noteValueSliderValues"
        v-bind:min="0"
        v-bind:max="$_numSliderTicks"
        v-on:change="$_onChangeValues"
        v-on:input="$_onInputValues"
      />
      <note-value-selector-buttons
        v-model="$data.$_noteValueSliderUnitValue"
        v-bind:safe-unit-value="$_safeNoteValueSliderUnitValue"
      />
      <template v-if="$_isChordNoteAvailable">
        <chord-editor-component
          class="mt-3"
          v-bind:note-type="$_selectedNote.type"
          v-bind:chord="$_selectedNote.pitchOrChord"
          v-on:change="$_onChangeSelectedNotePitchOrChord"
        />
      </template>
    </v-card-text>
  </v-card>
</template>

<script>
import Score from '../../modules/Score.js'
import PartInBar from '../../modules/PartInBar.js'
import Note from '../../modules/Note.js'
import NoteValue from '../../modules/NoteValue.js'
import NoteValueSelectorButtons from '../parts/NoteValueSelectorButtons.vue'
import ChordEditorComponent from '../footer_editor/ChordEditorComponent.vue'

export default {
  components: {
    NoteValueSelectorButtons,
    ChordEditorComponent,
  },

  watch: {
    selectedSectionIdx() { this.$_initialize() },
    selectedBarIdx() { this.$_initialize() },
    selectedPartIdx() { this.$_initialize() },
    selectedNoteIdx() { this.$_initialize() },
    $_selectedNote() { this.$_initialize() },
    '$data.$_noteValueSliderUnitValue': {
      handler() { this.$_setNoteValueSliderValues() },
      deep: true,
    },
  },

  props: {
    score: { type: Score },
    temporalSelectedPart: { type: PartInBar },
    selectedSectionIdx: { type: Number },
    selectedBarIdx: { type: Number },
    selectedPartIdx: { type: Number },
    selectedNoteIdx: { type: Number },
  },

  data() {
    return {
      $_noteValueSliderUnitValue: NoteValue.divisible.eighth,
      $_noteValueSliderValues: [ 0, 0 ],
      $_temporalSelectedPart: null,
      $_isChangingNoteValue: false,
    };
  },

  computed: {
    $_selectedBar() {
      if (this.score === null) return null;
      if (this.selectedSectionIdx === null) return null;
      if (this.selectedBarIdx === null) return null;
      return this.score.sections[this.selectedSectionIdx].bars[this.selectedBarIdx];
    },

    $_selectedPart() {
      if (this.$_selectedBar === null) return null;
      if (this.temporalSelectedPart !== null) return this.temporalSelectedPart;
      return this.$_selectedBar.parts[this.selectedPartIdx];
    },

    $_selectedNote() {
      if (this.$_selectedPart === null) return null;
      if (this.selectedNoteIdx >= this.$_numNotes) return null;
      return this.$_selectedPart.notes[this.selectedNoteIdx];
    },

    $_selectedNoteType() {
      if (this.$_selectedNote === null) return null;
      return this.$_selectedNote.type;
    },

    $_isChordNoteAvailable() {
      if (this.$_selectedPart === null) return false;
      if (this.$_selectedPart.type !== PartInBar.Type.chord) return false;
      if (this.$_selectedNote === null) return false;
      return true;
    },

    $_numSliderTicks() {
      if (this.$_selectedBar === null) return 0;
      return this.$_selectedBar.value.divide(this.$data.$_noteValueSliderUnitValue).toNumber();
    },
    $_noteValueSliderValueLow() {
      return this.$data.$_noteValueSliderValues[0];
    },
    $_noteValueSliderValueHigh() {
      return this.$data.$_noteValueSliderValues[1];
    },
    $_numNotes() {
      if (this.$_selectedPart === null) return 0;
      return this.$_selectedPart.notes.length;
    },
    $_lastNoteIdx()       { return this.$_numNotes - 1 },
    $_previousNoteIdx()   { return (this.selectedNoteIdx > 0)? (this.selectedNoteIdx - 1) : null },
    $_previousNoteValue() { return (this.$_previousNoteIdx !== null)? this.$_selectedPart.notes[this.$_previousNoteIdx].value : null },
    $_nextNoteIdx()       { return (this.selectedNoteIdx < this.$_lastNoteIdx)? (this.selectedNoteIdx + 1) : null },
    $_nextNoteValue()     { return (this.$_nextNoteIdx !== null)? this.$_selectedPart.notes[this.$_nextNoteIdx].value : null },

    $_noteValueSliderValueMin() {
      if (this.$_previousNoteValue !== null) {
        return this.$_noteValueToSliderValue(this.$_preNoteAccumulatedValue.subtract(this.$_previousNoteValue));
      } else {
        return 0;
      }
    },

    $_noteValueSliderValueMax() {
      if (this.$_nextNoteValue !== null) {
        return this.$_noteValueToSliderValue(this.$_postNoteAccumulatedValue.add(this.$_nextNoteValue));
      } else {
        return this.$_noteValueToSliderValue(this.$_selectedBar.value);
      }
    },

    $_postNoteAccumulatedValue() {
      return this.$_preNoteAccumulatedValue.add(this.$_selectedNote.value);
    },

    $_preNoteAccumulatedValue() {
      let beforeNoteValue = new NoteValue(0, 1);
      if (this.$_selectedPart !== null) {
        for (let currentNoteIdx = 0; currentNoteIdx < this.selectedNoteIdx; ++currentNoteIdx) {
          let currentNote = this.$_selectedPart.notes[currentNoteIdx];
          beforeNoteValue = beforeNoteValue.add(currentNote.value);
        }
      }
      return beforeNoteValue;
    },

    $_initialNoteValueSliderValues() {
      if (this.$_selectedNote === null) return [ 0, this.$_numSliderTicks ];
      let noteValueSliderValueLow = Math.floor(
        this.$_preNoteAccumulatedValue
          .divide(this.$data.$_noteValueSliderUnitValue)
          .toNumber()
      );
      let noteValueSliderValueHigh = Math.floor(
        this.$_preNoteAccumulatedValue
          .add(this.$_selectedNote.value)
          .divide(this.$data.$_noteValueSliderUnitValue)
          .toNumber()
      );
      return [
        noteValueSliderValueLow,
        noteValueSliderValueHigh,
      ];
    },

    $_safeNoteValueSliderUnitValue() {
      if (this.$_selectedPart === null) return NoteValue.divisible.whole;
      if (this.$_numNotes === 0) return NoteValue.divisible.whole;
      let safeSliderUnitValueDenominator = this.$_selectedPart.notes[0].value.reduce().denominator;
      for (let note of this.$_selectedPart.notes) {
        let currentNoteValueDenominator = note.value.reduce().denominator;
        if (safeSliderUnitValueDenominator < currentNoteValueDenominator) {
          safeSliderUnitValueDenominator = currentNoteValueDenominator;
        }
      }
      return new NoteValue(1, safeSliderUnitValueDenominator);
    },
  },

  inject: [
    'replaceNote',
    'openChordTextEditorDialog',
  ],

  mounted() {
    this.$_initialize();
  },

  methods: {
    $_noteValueToSliderValue(noteValue) {
      return noteValue.divide(this.$data.$_noteValueSliderUnitValue).toNumber();
    },

    $_initialize() {
      if (!this.$data.$_isChangingNoteValue) {
        if (this.$data.$_noteValueSliderUnitValue.isGreaterThan(this.$_safeNoteValueSliderUnitValue)) {
          this.$data.$_noteValueSliderUnitValue = this.$_safeNoteValueSliderUnitValue;
        }
      }
      this.$_setNoteValueSliderValues();
    },

    $_setNoteValueSliderValues() {
      this.$data.$_noteValueSliderValues = this.$_initialNoteValueSliderValues;
    },

    $_onChangeNoteType(noteType) {
      let notes = new Array(...this.$_selectedPart.notes);
      switch (noteType) {
        case Note.Type.normal:
          switch (this.$_selectedPart.type) {
            case PartInBar.Type.chord:
              notes[this.selectedNoteIdx] = new Note(
                this.$store.state.config.defaultChord,
                this.$_selectedNote.value,
                noteType,
                this.$_selectedNote.tied,
              );
              break;
          }
          break;
        case Note.Type.rest:
          notes[this.selectedNoteIdx] = new Note(
            null,
            this.$_selectedNote.value,
            noteType,
            false,
          );
          break;
      }
      let newPart = new PartInBar(notes, this.$_selectedPart.type);
      this.$emit('update-part', newPart, this.selectedNoteIdx);
    },

    $_onChangeValues() {
      let newNotes = new Array();
      let newSelectedNoteIdx = this.selectedNoteIdx;
      for (let currentNoteIdx = 0; currentNoteIdx < this.$_numNotes; ++currentNoteIdx) {
        let note = this.$_selectedPart.notes[currentNoteIdx];
        if (note.value.isGreaterThan(0)) {
          newNotes.push(note);
        } else {
          if (currentNoteIdx < this.selectedNoteIdx) {
            --newSelectedNoteIdx;
          }
          if (newSelectedNoteIdx < 0) {
            newSelectedNoteIdx = 0;
          }
        }
      }
      let newPart = new PartInBar(newNotes, this.$_selectedPart.type);
      this.$emit('update-part', newPart, newSelectedNoteIdx);
      this.$data.$_isChangingNoteValue = false;
    },

    $_onChangeSelectedNotePitchOrChord(pitchOrChord) {
      let newNote = this.$_selectedNote.clone();
      newNote.pitchOrChord = pitchOrChord;
      this.replaceNote(
        this.selectedSectionIdx,
        this.selectedBarIdx,
        this.selectedPartIdx,
        this.selectedNoteIdx,
        newNote,
      );
    },

    $_onInputValues([ noteValueSliderValueLow, noteValueSliderValueHigh ]) {
      this.$data.$_isChangingNoteValue = true;
      if (noteValueSliderValueLow < this.$_noteValueSliderValueMin) {
        noteValueSliderValueLow = this.$_noteValueSliderValueMin;
      }
      if (noteValueSliderValueHigh > this.$_noteValueSliderValueMax) {
        noteValueSliderValueHigh = this.$_noteValueSliderValueMax;
      }
      let numNotesInPart = this.$_selectedPart.notes.length;
      let isTargetNoteFirstNote = (this.selectedNoteIdx === 0);

      let oldValueLow = this.$_initialNoteValueSliderValues[0];
      let newValueLow = noteValueSliderValueLow;
      let oldValueHigh = this.$_initialNoteValueSliderValues[1];
      let newValueHigh = noteValueSliderValueHigh;

      let targetNoteValue = this.$data.$_noteValueSliderUnitValue.multiply(newValueHigh - newValueLow);
      let leftNoteValueDifference = this.$data.$_noteValueSliderUnitValue.multiply(newValueLow - oldValueLow);
      let rightNoteValueDifference = this.$data.$_noteValueSliderUnitValue.multiply(newValueHigh - oldValueHigh);
      let isValueLowChanged = (newValueLow !== oldValueLow);

      let newNotes = new Array();
      let newSelectedNoteIdx = this.selectedNoteIdx;
      let insertRestNoteToFront = isValueLowChanged && isTargetNoteFirstNote;
      if (insertRestNoteToFront) {
        let noteValue = leftNoteValueDifference;
        newNotes.push(new Note(null, noteValue, Note.Type.rest, false));
        ++newSelectedNoteIdx;
      }
      for (let currentNoteIdx = 0; currentNoteIdx < numNotesInPart; ++currentNoteIdx) {
        let currentNote = this.$_selectedPart.notes[currentNoteIdx];
        if (currentNoteIdx === this.selectedNoteIdx) {
          newNotes.push(new Note(currentNote.pitchOrChord, targetNoteValue, currentNote.type, currentNote.tied));
        } else if (currentNoteIdx === (this.$_previousNoteIdx)) {
          let preTargetNoteValue = currentNote.value.add(leftNoteValueDifference);
          newNotes.push(new Note(currentNote.pitchOrChord, preTargetNoteValue, currentNote.type, currentNote.tied));
        } else if (currentNoteIdx === (this.$_nextNoteIdx)) {
          let postTargetNoteValue = currentNote.value.subtract(rightNoteValueDifference);
          newNotes.push(new Note(currentNote.pitchOrChord, postTargetNoteValue, currentNote.type, currentNote.tied));
        } else {
          newNotes.push(currentNote);
        }
      }
      this.$emit('set-temporal-part', new PartInBar(newNotes, this.$_selectedPart.type), newSelectedNoteIdx);
    },
  },
}
</script>