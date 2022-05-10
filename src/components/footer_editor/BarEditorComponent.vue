<template>
  <v-card v-bind="$attrs">
    <v-card-actions>
      <v-btn
        small icon
        v-on:click="$_insertEmptyBarBeforeSelectedBar"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn
        small icon
        v-bind:disabled="$_isSelectPreviousBarButtonDisabled"
        v-on:click="selectPreviousBar"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-spacer />
      <v-btn
        small icon
        v-if="$_selectedNote"
        v-bind:disabled="!$_isSelectedNoteTypeTogglable"
        v-on:click="$_toggleSelectedNoteType"
      >
        <v-icon v-if="$_isSelectedNoteTypeRest">mdi-music-note-quarter</v-icon>
        <v-icon v-else>mdi-music-rest-quarter</v-icon>
      </v-btn>
      <v-btn
        small icon
        v-if="$_selectedNote"
        v-bind:disabled="!$_isSelectedNoteTieable"
        v-on:click="$_toggleSelectedNoteTied"
      >
        <template v-if="$_isSelectedNoteTied">Untie</template>
        <template v-else>Tie</template>
      </v-btn>
      <v-btn
        small icon
        v-on:click="$_removeSelectedBar"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
      <v-btn
        small icon
        v-bind:disabled="$_isFillBarWithNoteButtonDisabled"
        v-on:click="$_fillBarWithNote($event.shiftKey)"
      >
        <v-icon>mdi-music-note-plus</v-icon>
      </v-btn>
      <v-spacer />
      <v-btn
        small icon
        v-bind:disabled="$_isSelectNextBarButtonDisabled"
        v-on:click="selectNextBar"
      >
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>
      <v-btn
        small icon
        v-on:click="$_insertEmptyBarAfterSelectedBar"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-card-actions>
    <v-card-text class="pa-0">
      <system-component
        v-if="$data.$_tempScore"
        v-bind:score="$data.$_tempScore"
        v-bind:system-definition="$_systemDefinition"
        v-bind:selected-part-idx="0"
        v-bind:selected-note-idx="selectedNoteIdx"
        v-bind:staff-background-color="$_colorTransparent"
        v-bind:selected-staff-background-color="$_colorTransparent"
        v-on:select-note="$_onSelectNote"
      />
    </v-card-text>
  </v-card>
</template>

<script>
import SystemComponent from '../SystemComponent.vue';
import { SystemDefinition } from '../SystemComponent.vue';
import Score from '../../modules/Score.js';
import Section from '../../modules/Section.js';
import PartInBar from '../../modules/PartInBar.js';
import Note from '../../modules/Note.js';
import NoteValue from '../../modules/NoteValue.js';
import Color from '../../modules/Color.js';
import { keyEventTypeEnum } from '../../modules/KeyEventType.js';

export default {
  components: {
    SystemComponent,
  },

  watch: {
    score: {
      handler() { this.$_updateTempScore() },
      deep: true,
      immediate: true,
    },
    temporalSelectedPart: {
      handler() { this.$_updateTempScore() },
      deep: true,
      immediate: true,
    },
    selectedSectionIdx: {
      handler() { this.$_updateTempScore() },
      immediate: true,
    },
    selectedBarIdx: {
      handler() { this.$_updateTempScore() },
      immediate: true,
    },
    selectedPartIdx: {
      handler() { this.$_updateTempScore() },
      immediate: true,
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
      $_tempScore: null,
      $_tempBarIdx: null,
    };
  },

  computed: {
    $_selectedSection() {
      if (this.score === null) return null;
      if (this.selectedSectionIdx === null) return null;
      return this.score.sections[this.selectedSectionIdx];
    },

    $_selectedBar() {
      if (this.score === null) return null;
      if (this.selectedSectionIdx === null) return null;
      if (this.selectedBarIdx === null) return null;
      return this.score.sections[this.selectedSectionIdx].bars[this.selectedBarIdx];
    },

    $_selectedPart() {
      if (this.$_selectedBar === null) return null;
      return this.$_selectedBar.parts[this.selectedPartIdx];
    },

    $_selectedNote() {
      if (this.$_selectedPart === null) return null;
      return this.$_selectedPart.notes[this.selectedNoteIdx];
    },

    $_previousBar() {
      if (this.score === null) return null;
      if (this.selectedSectionIdx === null) return null;
      if (this.selectedBarIdx === null) return null;
      if (this.selectedBarIdx === 0) {
        if (this.selectedSectionIdx === 0) {
          return null;
        } else {
          let previousSection = this.score.sections[this.selectedSectionIdx - 1];
          if (previousSection.bars.length === 0) return null;
          let lastBarIdxOfPreviousSection = previousSection.bars.length - 1;
          return previousSection.bars[lastBarIdxOfPreviousSection];
        }
      }
      return this.score.sections[this.selectedSectionIdx].bars[this.selectedBarIdx - 1];
    },

    $_previousPart() {
      if (this.$_previousBar === null) return null;
      if (this.$_previousBar.parts.length === 0) return null;
      let previousPart = this.$_previousBar.parts.find(
        partOfPreviousBar => (partOfPreviousBar.type === this.$_selectedPart.type)
      );
      if (previousPart === undefined) return null;
      return previousPart;
    },

    $_previousNote() {
      if (this.selectedNoteIdx > 0) {
        if (this.$_selectedPart === null) return null;
        return this.$_selectedPart.notes[this.selectedNoteIdx - 1];
      } else {
        if (this.$_previousPart === null) return null;
        if (this.$_previousPart.notes.length === 0) return null;
        let lastNoteIdxOfPreviousPart = this.$_previousPart.notes.length - 1;
        return this.$_previousPart.notes[lastNoteIdxOfPreviousPart];
      }
    },

    $_nextBar() {
      if (this.score === null) return null;
      if (this.selectedSectionIdx === null) return null;
      if (this.selectedBarIdx === null) return null;
      let lastBarIdxOfSelectedSection = this.$_selectedSection.bars.length - 1;
      if (this.selectedBarIdx === lastBarIdxOfSelectedSection) {
        let lastSectionIdxOfScore = this.score.sections.length - 1;
        if (this.selectedSectionIdx === lastSectionIdxOfScore) {
          return null;
        } else {
          let nextSection = this.score.sections[this.selectedSectionIdx + 1];
          if (nextSection.bars.length === 0) return null;
          return nextSection.bars[0];
        }
      }
      return this.score.sections[this.selectedSectionIdx].bars[this.selectedBarIdx + 1];
    },

    $_nextPart() {
      if (this.$_nextBar === null) return null;
      if (this.$_nextBar.parts.length === 0) return null;
      let nextPart = this.$_nextBar.parts.find(
        partOfNextBar => (partOfNextBar.type === this.$_selectedPart.type)
      );
      if (nextPart === undefined) return null;
      return nextPart;
    },

    $_nextNote() {
      if (this.$_selectedPart === null) return null;
      let lastNoteIdxOfSelectedPart = this.$_selectedPart.notes.length - 1;
      if (this.selectedNoteIdx < lastNoteIdxOfSelectedPart) {
        return this.$_selectedPart.notes[this.selectedNoteIdx + 1];
      } else {
        if (this.$_nextPart === null) return null;
        if (this.$_nextPart.notes.length === 0) return null;
        return this.$_nextPart.notes[0];
      }
    },

    $_isSelectedNoteTypeTogglable() {
      if (this.$_selectedNote === null) return null;
      if (this.$_selectedNote.type === Note.Type.rest) {
        return true;
      } else {
        if (this.$_nextNote === null) return true;
        return !this.$_nextNote.tied;
      }
    },

    $_isSelectedNoteTypeRest() {
      if (this.$_selectedNote === null) return null;
      return (this.$_selectedNote.type === Note.Type.rest);
    },

    $_isSelectedNoteTieable() {
      if (this.$_selectedNote.type === Note.Type.rest) return false;
      if (this.$_previousNote === null) return false;
      if (this.$_previousNote.type === Note.Type.rest) return false;
      return true;
    },

    $_isSelectedNoteTied() {
      if (this.$_selectedNote === null) return null;
      return this.$_selectedNote.tied;
    },

    $_isSelectNextBarButtonDisabled() {
      if (this.selectedSectionIdx === null) return true;
      if (this.selectedSectionIdx === null) return true;
      let isSelectedSectionLastSection = (this.selectedSectionIdx === this.score.lastSectionIdx);
      let isSelectedBarLastBar = (this.selectedBarIdx === this.score.getLastBarIdx(this.selectedSectionIdx));
      return (isSelectedSectionLastSection && isSelectedBarLastBar);
    },

    $_isSelectPreviousBarButtonDisabled() {
      let isSelectedSectionFirstSection = (this.selectedSectionIdx === 0);
      let isSelectedBarFirstBar = (this.selectedBarIdx === 0);
      return (isSelectedSectionFirstSection && isSelectedBarFirstBar);
    },

    $_systemDefinition() {
      return new SystemDefinition(
        0,
        this.$data.$_tempBarIdx,
        this.$data.$_tempBarIdx,
        true,
      );
    },

    $_remainingNoteValue() {
      if (this.$_selectedBar === null) return null;
      let barValue = this.$_selectedBar.value;
      let totalExistingNoteValue = new NoteValue(0);
      for (let note of this.$_selectedPart.notes) {
        totalExistingNoteValue = totalExistingNoteValue.add(note.value);
      }
      return barValue.subtract(totalExistingNoteValue);
    },

    $_isFillBarWithNoteButtonDisabled() {
      if (this.$_remainingNoteValue === null) return true;
      return this.$_remainingNoteValue.isLessThanOrEqualTo(0);
    },

    $_colorTransparent() {
      return Color.transparent;
    },
  },

  inject: [
    'insertBar',
    'replaceNote',
    'removeBars',
    'selectNextBar',
    'selectPreviousBar',
  ],

  mounted() {
    this.$emit('register-component', this);
  },

  destroyed() {
    this.$emit('register-component', null);
  },

  methods: {
    onKeydown(keyEventType, event) {
      switch (keyEventType) {
        case keyEventTypeEnum.key:
          switch (event.code) {
            case 'KeyT':
              this.$_toggleSelectedNoteTied();
              return true;
            case 'KeyF':
              if (this.$_isFillBarWithNoteButtonDisabled) break;
              this.$_fillBarWithNote(false);
              return true;
            case 'KeyR':
              this.$_toggleSelectedNoteType();
              return true;
          }
          break;
        case keyEventTypeEnum.keyWithShift:
          switch (event.code) {
            case 'KeyF':
              if (this.$_isFillBarWithNoteButtonDisabled) break;
              this.$_fillBarWithNote(true);
              return true;
          }
          break;
      }
      return false;
    },

    $_updateTempScore() {
      if (this.score === null) return;
      if (this.$_selectedBar === null) return;
      if (this.$_selectedPart === null) return;
      let tempTargetBar = this.$_selectedBar.clone();
      let tempTargetPart = (this.temporalSelectedPart !== null)? this.temporalSelectedPart : this.$_selectedPart;
      tempTargetBar.parts = [ tempTargetPart ];
      let tempBars = [ this.$_previousBar, tempTargetBar, this.$_nextBar ].filter(bar => (bar !== null));
      this.$data.$_tempScore = new Score(
        this.score.metadata,
        [
          new Section('temporalSection', tempBars),
        ],
      );
      this.$data.$_tempBarIdx = (this.$_previousBar === null)? 0 : 1;
    },

    $_insertEmptyBarBeforeSelectedBar() {
      this.insertBar(this.selectedSectionIdx, this.selectedBarIdx, this.selectedBarIdx);
    },

    $_insertEmptyBarAfterSelectedBar() {
      this.insertBar(this.selectedSectionIdx, this.selectedBarIdx, this.selectedBarIdx + 1);
    },

    $_toggleSelectedNoteType() {
      if (this.$_isSelectedNoteTypeRest) {
        let normalNote = this.$_selectedPart.generateNewNormalNote(this.$_selectedNote.value);
        this.replaceNote(this.selectedSectionIdx, this.selectedBarIdx, this.selectedPartIdx, this.selectedNoteIdx, normalNote);
      } else {
        let restNote = this.$_selectedNote.generateNewRestNote(this.$_selectedNote.value);
        this.replaceNote(this.selectedSectionIdx, this.selectedBarIdx, this.selectedPartIdx, this.selectedNoteIdx, restNote);
      }
    },

    $_toggleSelectedNoteTied() {
      let newNote = this.$_selectedNote.clone();
      newNote.tied = !newNote.tied;
      this.replaceNote(this.selectedSectionIdx, this.selectedBarIdx, this.selectedPartIdx, this.selectedNoteIdx, newNote);
    },

    $_removeSelectedBar() {
      this.removeBars(this.selectedSectionIdx, this.selectedBarIdx, this.selectedSectionIdx, this.selectedBarIdx);
    },

    $_fillBarWithNote(withShiftKey) {
      let remainingNoteValue = this.$_remainingNoteValue;
      let numExistingNotes = this.$_selectedPart.notes.length;
      let note = null;
      if (withShiftKey) {
        note = new Note(null, remainingNoteValue, Note.Type.rest, false);
      } else {
        switch (this.$_selectedPart.type) {
          case PartInBar.Type.chord:
            note = new Note(null, remainingNoteValue, Note.Type.normal, false);
            break;
        }
      }
      this.$emit(
        'insert-note',
        this.selectedSectionIdx,
        this.selectedBarIdx,
        this.selectedPartIdx,
        numExistingNotes,
        note,
      );
    },

    $_onSelectNote({ partIdx, noteIdx }) {
      this.$emit('select-note', { partIdx, noteIdx });
    },
  },
};
</script>