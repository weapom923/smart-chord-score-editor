<template>
  <dialog-base v-model="$_shows">
    <template v-slot:body>
      <v-card-title>Help</v-card-title>

      <v-card-text>
        <v-simple-table dense class="text-left">
          <thead>
            <tr><th>Keys</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td>ArrowRight</td><td>Select a next bar.</td></tr>
            <tr><td>Shift+ArrowRight</td><td>Select(expand) a next bar.</td></tr>
            <tr><td>ArrowLeft</td><td>Select a previous bar.</td></tr>
            <tr><td>Shift+ArrowLeft</td><td>Select(expand) a previous bar.</td></tr>
            <tr><td>Ctrl+Shift+ArrowRight</td><td>Select a next note.</td></tr>
            <tr><td>Ctrl+Shift+ArrowLeft</td><td>Select a previous note.</td></tr>
            <tr><td>Ctrl+Z</td><td>Undo a change.</td></tr>
            <tr><td>Ctrl+Shift+Z</td><td>Redo a change.</td></tr>
            <tr><td>Ctrl+S</td><td>Save a score to local storage.</td></tr>
            <tr><td>Ctrl+C</td><td>Copy selected bars.</td></tr>
            <tr><td>Ctrl+V</td><td>Paste copied bars on a selected bar.</td></tr>
            <tr><td>Ctrl+N</td><td>Insert a new bar after selected bars.</td></tr>
            <tr><td>Ctrl+Shift+N</td><td>Insert a new bar before selected bars.</td></tr>
            <tr><td>Ctrl+M</td><td>Insert a new section after selected sections.</td></tr>
            <tr><td>Ctrl+Shift+M</td><td>Insert a new section before selected sections.</td></tr>
            <tr><td>Delete</td><td>Delete selected bars.</td></tr>
            <tr><td>Enter</td><td>Break a system before a selected bar.</td></tr>
            <tr><td>Shift+Enter</td><td>Break a page before a selected bar.</td></tr>
            <tr><td>Backspace</td><td>Remove a break before a selected bar.</td></tr>
            <tr><td>E</td><td>Open/Close a bar editor.</td></tr>
            <tr><td>H</td><td>Show a help dialog.</td></tr>
            <tr><td>P</td><td>Enable a print layout.</td></tr>
          </tbody>
        </v-simple-table>
      </v-card-text>
    </template>
  </dialog-base>
</template>

<script>
import DialogBase from './DialogBase.vue';

export default {
  model: {
    prop: 'shows',
    event: 'update',
  },

  components: {
    DialogBase,
  },

  props: {
    shows: { type: Boolean, default: false },
  },

  computed: {
    $_shows: {
      get()      { return this.shows },
      set(shows) { this.$emit('update', shows) },
    },
  },
}
</script>