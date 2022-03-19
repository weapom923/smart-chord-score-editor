<template>
  <v-card v-bind="$attrs">
    <v-card-text class="pa-0">
      <v-card-subtitle>Note</v-card-subtitle>
      <note-selector-buttons
        v-bind:noteIdx="noteIdx"
        v-bind:partType="partType"
        v-bind:notes="notes"
        v-on:change="$_onChangeNoteIdx"
      />
    </v-card-text>
  </v-card>
</template>

<script>
import NoteSelectorButtons from '@/components/footer_editor/parts/NoteSelectorButtons.vue';

export default {
  components: {
    NoteSelectorButtons,
  },

  model: {
    prop: 'noteIdx',
    event: 'change',
  },

  props: {
    noteIdx: { type: Number },
    partType: { type: String },
    notes: { type: Array },
  },

  methods: {
    $_onChangeNoteIdx(noteIdx) {
      this.$emit('change', noteIdx);
    },
  },
}
</script>
