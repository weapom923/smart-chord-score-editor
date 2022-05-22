<template>
  <v-card
    outlined
    id="editor-component"
  >
    <bar-editor-toolbar
      v-bind:score="score"
      v-bind:selected-bars-first="$_selectedBarsFirst"
      v-bind:selected-bars-last="$_selectedBarsLast"
      v-bind:selected-part-idx="$data.$_selectedPartIdx"
      v-on:update-selected-part-idx="$_onUpdateSelectedPartIdx"
    />
    <v-container id="editor-container">
      <v-row>
        <v-col cols="3">
          <v-card>
            <v-card-text class="pa-0">
              <bar-detail-editor-component v-bind:score="score" />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          cols="9"
          id="bar-component-container"
          ref="barComponentContainer"
          v-show="$_isSingleBarSelected"
        >
          <bar-editor-component
            ref="barEditorComponent"
            flat tile class="pa-0"
            v-bind:score="score"
            v-bind:temporal-selected-part="$data.$_temporalSelectedPart"
            v-bind:selected-section-idx="$_singlySelectedSectionIdx"
            v-bind:selected-bar-idx="$_singlySelectedBarIdx"
            v-bind:selected-part-idx="$data.$_selectedPartIdx"
            v-bind:selected-note-idx="$data.$_selectedNoteIdx"
            v-on:insert-note="$_onInsertNote"
            v-on:select-note="$_onSelectNote"
            v-on:register-component="$_registerBarEditorComponentInstance"
          />
          <note-editor-component
            flat tile class="pa-0"
            v-bind:score="score"
            v-bind:temporal-selected-part="$data.$_temporalSelectedPart"
            v-bind:selected-section-idx="$_singlySelectedSectionIdx"
            v-bind:selected-bar-idx="$_singlySelectedBarIdx"
            v-bind:selected-part-idx="$data.$_selectedPartIdx"
            v-bind:selected-note-idx="$data.$_selectedNoteIdx"
            v-on:update-part="$_onUpdatePart"
            v-on:set-temporal-part="$_onSetTemporalPart"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<style>
#editor-component {
  max-height: 70vh;
  width: 100%;
}

#editor-container {
  max-height: 70vh;
  overflow-y: scroll;
  overflow-x: hidden;
}

#bar-component-container {
  position: relative;
}
</style>

<script>
import BarEditorToolbar from '../footer_editor/BarEditorToolbar.vue';
import BarEditorComponent from '../footer_editor/BarEditorComponent.vue';
import NoteEditorComponent from '../footer_editor/NoteEditorComponent.vue';
import BarDetailEditorComponent from '../footer_editor/BarDetailEditorComponent.vue';
import Score from '../../modules/Score.js';
import { keyEventTypeEnum } from '../../modules/KeyEventType.js';

export default {
  components: {
    BarEditorToolbar,
    BarEditorComponent,
    NoteEditorComponent,
    BarDetailEditorComponent,
  },

  watch: {
    $_selectedBarsFirst: {
      handler() {
        this.$_resetSelection();
      },
      deep: true,
    },

    $_selectedBarsLast: {
      handler() {
        this.$_resetSelection();
      },
      deep: true,
    },
  },

  props: {
    score: { type: Score },
  },

  data() {
    return {
      $_selectedPartIdx: 0,
      $_selectedNoteIdx: 0,
      $_temporalSelectedPart: null,
      $_barEditorComponentInstance: null,
    };
  },

  computed: {
    $_selectedBarsFirst() {
      return this.$store.state.selectedBarsFirst;
    },

    $_selectedBarsLast() {
      return this.$store.state.selectedBarsLast;
    },

    $_isSingleBarSelected() {
      if (this.$_selectedBarsFirst.sectionIdx === null) return false;
      if (this.$_selectedBarsFirst.barIdx === null) return false;
      if (this.$_selectedBarsFirst.sectionIdx !== this.$_selectedBarsLast.sectionIdx) return false;
      if (this.$_selectedBarsFirst.barIdx < this.$_selectedBarsLast.barIdx) return false;
      return true;
    },

    $_singlySelectedSectionIdx() {
      if (!this.$_isSingleBarSelected) return null;
      return this.$_selectedBarsFirst.sectionIdx;
    },

    $_singlySelectedSection() {
      if (this.$_singlySelectedSectionIdx === null) return null;
      return this.score.sections[this.$_singlySelectedSectionIdx];
    },

    $_singlySelectedBarIdx() {
      if (!this.$_isSingleBarSelected) return null;
      return this.$_selectedBarsFirst.barIdx;
    },

    $_singlySelectedBar() {
      if (this.$_singlySelectedSection === null) return null;
      if (this.$_singlySelectedBarIdx === null) return null;
      return this.$_singlySelectedSection.bars[this.$_singlySelectedBarIdx];
    },

    $_selectedPart() {
      if (this.$_singlySelectedBar === null) return null;
      return this.$_singlySelectedBar.parts[this.$data.$_selectedPartIdx];
    },

    $_numNotesInSelectedPart() {
      if (this.$_selectedPart === null) return null;
      return this.$_selectedPart.notes.length;
    },
  },

  mounted() {
    this.$emit('register-component', this);
  },

  destroyed() {
    this.$emit('register-component', null);
  },

  inject: [
    'insertNote',
    'updatePart',
    'selectNextBar',
    'selectPreviousBar',
  ],

  methods: {
    onKeydown(keyEventType, event) {
      if (this.$data.$_barEditorComponentInstance !== null) {
        if (this.$data.$_barEditorComponentInstance.onKeydown(keyEventType, event)) return true;
      }
      switch (keyEventType) {
        case keyEventTypeEnum.key:
          switch (event.code) {
            case 'KeyN':
              return incrementNoteIdx(this);
            case 'KeyB':
              return decrementNoteIdx(this);
          }
          break;
        case keyEventTypeEnum.repeatedKey:
          switch (event.code) {
            case 'KeyN':
              return incrementNoteIdx(this);
            case 'KeyB':
              return decrementNoteIdx(this);
          }
          break;
      }
      return false;

      function incrementNoteIdx(self) {
        if (self.$_numNotesInSelectedPart === 0) return false;
        if (self.$data.$_selectedNoteIdx === (self.$_numNotesInSelectedPart - 1)) return true;
        ++self.$data.$_selectedNoteIdx;
        return true;
      }

      function decrementNoteIdx(self) {
        if (self.$_numNotesInSelectedPart === 0) return false;
        if (self.$data.$_selectedNoteIdx === 0) return true;
        --self.$data.$_selectedNoteIdx;
        return true;
      }
    },

    $_registerBarEditorComponentInstance(barEditorComponentInstance) {
      this.$data.$_barEditorComponentInstance = barEditorComponentInstance;
    },

    $_resetSelection() {
      this.$data.$_selectedPartIdx = 0;
      this.$data.$_selectedNoteIdx = 0;
    },

    $_onInsertNote(sectionIdx, barIdx, partIdx, noteIdx, note) {
      this.$data.$_selectedNoteIdx = noteIdx;
      this.insertNote(sectionIdx, barIdx, partIdx, noteIdx, note);
    },

    $_onSelectNote({ partIdx, noteIdx }) {
      this.$data.$_selectedPartIdx = partIdx;
      this.$data.$_selectedNoteIdx = noteIdx;
    },

    $_onUpdatePart(newPart, newSelectedNoteIdx) {
      this.$data.$_selectedNoteIdx = newSelectedNoteIdx;
      this.updatePart(
        this.$_singlySelectedSectionIdx,
        this.$_singlySelectedBarIdx,
        this.$data.$_selectedPartIdx,
        newPart,
      );
      this.$data.$_temporalSelectedPart = null;
    },

    $_onUpdateSelectedPartIdx(selectedPartIdx) {
      this.$data.$_selectedPartIdx = selectedPartIdx;
    },

    $_onSetTemporalPart(newPart, newSelectedNoteIdx) {
      this.$data.$_selectedNoteIdx = newSelectedNoteIdx;
      this.$data.$_temporalSelectedPart = newPart;
    },

    $_insertEmptyBarBeforeSelectedBar() {
      this.$emit('insert-empty-bar-before-selected-bar');
    },

    $_insertEmptyBarAfterSelectedBar() {
      this.$emit('insert-empty-bar-after-selected-bar');
    },
  }
};
</script>