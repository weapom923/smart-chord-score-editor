<template>
  <v-card
    outlined
    id="editor-component"
  >
    <v-toolbar
      dark dense
      height="20"
    >
      <v-spacer />
      <v-btn
        small icon
        v-on:click="$_unsetCurrentBar"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>

    <v-container>
      <v-row>
        <v-col cols="3">
          <v-card>
            <v-card-text class="pa-0">
              <v-list dense>
                <v-list-item-group
                  mandatory
                  v-model="$data.$_selectedPartIdx"
                >
                  <v-list-item
                    v-for="(part, partIdx) in $_selectedBar.parts"
                    v-bind:key="partIdx"
                  >
                    {{ part.type }}
                  </v-list-item>
                </v-list-item-group>
              </v-list>
            </v-card-text>
          </v-card>

          <v-card>
            <v-card-text class="pa-0">
              <bar-detail-editor-component
                v-bind:score="score"
                v-on:replace-bar="$_onReplaceBar"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          cols="9"
          id="bar-component-container"
          ref="barComponentContainer"
        >
          <bar-editor-component
            flat tile class="pa-0"
            v-bind:score="score"
            v-bind:selected-part-idx="$data.$_selectedPartIdx"
            v-bind:selected-note-idx="$data.$_selectedNoteIdx"
            v-on:insert-bar="$_onInsertBar"
            v-on:remove-bar="$_onRemoveBar"
            v-on:insert-note="$_onInsertNote"
            v-on:select-note="$_onSelectNote"
          />
          <note-editor-component
            flat tile class="pa-0"
            v-bind:score="score"
            v-bind:selected-part-idx="$data.$_selectedPartIdx"
            v-bind:selected-note-idx="$data.$_selectedNoteIdx"
            v-on:update-part="$_onUpdatePart"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<style>
#editor-component {
  width: 100%;
}

#bar-component-container {
  height: 70vh;
  overflow-y: scroll;
  position: relative;
}
</style>

<script>
import BarEditorComponent from '@/components/footer_editor/BarEditorComponent.vue';
import NoteEditorComponent from '@/components/footer_editor/NoteEditorComponent.vue';
import BarDetailEditorComponent from '@/components/footer_editor/BarDetailEditorComponent.vue';
import Score from '@/modules/Score.js';

export default {
  components: {
    BarEditorComponent,
    NoteEditorComponent,
    BarDetailEditorComponent,
  },

  watch: {
    $_selectedSectionIdx() {
      this.$_resetSelection();
    },
    $_selectedBarIdx() {
      this.$_resetSelection();
    },
  },

  props: {
    score: { type: Score },
  },

  data() {
    return {
      $_selectedPartIdx: 0,
      $_selectedNoteIdx: 0,
    };
  },

  computed: {
    $_selectedSectionIdx() {
      return this.$store.state.selectedSectionIdx;
    },

    $_selectedBarIdx() {
      return this.$store.state.selectedBarIdx;
    },

    $_selectedBar() {
      if (this.$_selectedSectionIdx === null) return null;
      if (this.$_selectedBarIdx === null) return null;
      return this.score.sections[this.$_selectedSectionIdx].bars[this.$_selectedBarIdx];
    },

    $_selectedPart() {
      if (this.$_selectedBar === null) return null;
      return this.$_selectedBar.parts[this.$data.$_selectedPartIdx];
    },

    $_numNotesInSelectedPart() {
      if (this.$_selectedPart === null) return null;
      return this.$_selectedPart.notes.length;
    },
  },

  methods: {
    $_resetSelection() {
      this.$data.$_selectedPartIdx = 0;
      this.$data.$_selectedNoteIdx = 0;
    },

    async $_unsetCurrentBar() {
      await this.$store.dispatch('unselectBar');
    },

    $_onInsertBar(sectionIdx, baseBarIdx, barIdx) {
      this.$emit('insert-bar', sectionIdx, baseBarIdx, barIdx);
    },

    $_onRemoveBar(sectionIdx, barIdx) {
      this.$emit('remove-bar', sectionIdx, barIdx);
    },

    $_onReplaceBar(sectionIdx, barIdx, bar) {
      this.$emit('replace-bar', sectionIdx, barIdx, bar);
    },

    $_onInsertNote(sectionIdx, barIdx, partIdx, noteIdx, note) {
      this.$data.$_selectedNoteIdx = noteIdx;
      this.$emit('insert-note', sectionIdx, barIdx, partIdx, noteIdx, note);
    },

    $_onSelectNote({ partIdx, noteIdx }) {
      this.$data.$_selectedPartIdx = partIdx;
      this.$data.$_selectedNoteIdx = noteIdx;
    },

    $_onUpdatePart(sectionIdx, barIdx, partIdx, part, newSelectedNoteIdx) {
      this.$data.$_selectedNoteIdx = newSelectedNoteIdx;
      this.$emit('update-part', sectionIdx, barIdx, partIdx, part);
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