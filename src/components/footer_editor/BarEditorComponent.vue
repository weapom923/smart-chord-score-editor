<template>
  <v-card v-bind="$attrs">
    <v-card-actions>
      <v-btn
        small tile
        v-on:click="$_insertEmptyBarBeforeSelectedBar"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn
        small tile
        v-bind:disabled="$_isSelectPreviousBarButtonDisabled"
        v-on:click="$_selectPreviousBar"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-spacer />
      <v-btn
        small tile
        v-on:click="$_removeSelectedBar"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
      <v-btn
        small tile
        v-bind:disabled="$_isFillBarWithNoteButtonDisabled"
        v-on:click="$_fillBarWithNote"
      >
        <v-icon>mdi-music-note-plus</v-icon>
      </v-btn>
      <v-spacer />
      <v-btn
        small tile
        v-bind:disabled="$_isSelectNextBarButtonDisabled"
        v-on:click="$_selectNextBar"
      >
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>
      <v-btn
        small tile
        v-on:click="$_insertEmptyBarAfterSelectedBar"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-card-actions>
    <v-card-text class="pa-0">
      <bar-component
        v-bind:score="score"
        v-bind:section-idx="$_selectedSectionIdx"
        v-bind:bar-idx="$_selectedBarIdx"
        v-bind:show-key-signature="true"
        v-bind:show-beat="true"
        v-bind:selected-part-idx="selectedPartIdx"
        v-bind:selected-note-idx="selectedNoteIdx"
        v-on:select-note="$_onSelectNote"
      />
    </v-card-text>
  </v-card>
</template>

<script>
import BarComponent from '@/components/BarComponent.vue';
import Score from '@/modules/Score.js';
import PartInBar from '@/modules/PartInBar.js';
import Note from '@/modules/Note.js';
import NoteValue from '@/modules/NoteValue.js';

export default {
  components: {
    BarComponent,
  },

  props: {
    score: { type: Score },
    selectedPartIdx: { type: Number },
    selectedNoteIdx: { type: Number },
  },

  computed: {
    $_score() {
      return this.$store.state.score;
    },

    $_selectedSectionIdx() {
      return this.$store.state.selectedSectionIdx;
    },

    $_selectedSection() {
      if (this.score === null) return null;
      return this.score.sections[this.$_selectedSectionIdx];
    },

    $_selectedBarIdx() {
      return this.$store.state.selectedBarIdx;
    },

    $_selectedBar() {
      if (this.score === null) return null;
      return this.score.sections[this.$_selectedSectionIdx].bars[this.$_selectedBarIdx];
    },

    $_selectedPart() {
      if (this.$_selectedBar === null) return null;
      return this.$_selectedBar.parts[this.selectedPartIdx];
    },

    $_isSelectNextBarButtonDisabled() {
      let numSections = this.score.sections.length;
      let isSelectedSectionLastSection = (this.$_selectedSectionIdx === (numSections - 1));
      let numBars = this.$_selectedSection.bars.length;
      let isSelectedBarLastBar = (this.$_selectedBarIdx === (numBars - 1));
      return (isSelectedSectionLastSection && isSelectedBarLastBar);
    },

    $_isSelectPreviousBarButtonDisabled() {
      let isSelectedSectionFirstSection = (this.$_selectedSectionIdx === 0);
      let isSelectedBarFirstBar = (this.$_selectedBarIdx === 0);
      return (isSelectedSectionFirstSection && isSelectedBarFirstBar);
    },

    $_remainingNoteValue() {
      let barValue = this.$_selectedBar.value;
      let totalExistingNoteValue = new NoteValue(0);
      for (let note of this.$_selectedPart.notes) {
        totalExistingNoteValue = totalExistingNoteValue.add(note.value);
      }
      return barValue.subtract(totalExistingNoteValue);
    },

    $_isFillBarWithNoteButtonDisabled() {
      return this.$_remainingNoteValue.isLessThanOrEqualTo(0);
    },
  },

  methods: {
    $_insertEmptyBarBeforeSelectedBar() {
      this.$emit('insert-bar', this.$_selectedSectionIdx, this.$_selectedBarIdx, this.$_selectedBarIdx);
    },

    $_insertEmptyBarAfterSelectedBar() {
      this.$emit('insert-bar', this.$_selectedSectionIdx, this.$_selectedBarIdx, this.$_selectedBarIdx + 1);
    },

    $_removeSelectedBar() {
      this.$emit('remove-bar', this.$_selectedSectionIdx, this.$_selectedBarIdx);
    },

    async $_selectNextBar() {
      await this.$store.dispatch(
        'selectBar',
        this.score.getNextSectionAndBarIdx({
          sectionIdx: this.$_selectedSectionIdx,
          barIdx: this.$_selectedBarIdx
        }),
      );
    },

    async $_selectPreviousBar() {
      await this.$store.dispatch(
        'selectBar',
        this.score.getPreviousSectionAndBarIdx({
          sectionIdx: this.$_selectedSectionIdx,
          barIdx: this.$_selectedBarIdx
        }),
      );
    },

    $_fillBarWithNote(event) {
      let remainingNoteValue = this.$_remainingNoteValue;
      let numExistingNotes = this.$_selectedPart.notes.length;
      let note = null;
      if (event.shiftKey) {
        note = new Note(null, remainingNoteValue, Note.Type.rest);
      } else {
        switch (this.$_selectedPart.type) {
          case PartInBar.Type.chord:
            note = new Note(this.$store.state.config.defaultChord, remainingNoteValue, Note.Type.normal);
            break;
        }
      }
      this.$emit(
        'insert-note',
        this.$_selectedSectionIdx,
        this.$_selectedBarIdx,
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