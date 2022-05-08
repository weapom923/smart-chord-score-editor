<template>
  <v-snackbar
    timeout="2000"
    v-model="$_shows"
  >
    {{ message }}
    <template v-slot:action="{ attrs }">
      <v-btn
        color="indigo"
        text
        v-bind="attrs"
        v-on:click="$_updateShows(false)"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  model: {
    prop: 'shows',
    event: 'update',
  },

  props: {
    shows: { type: Boolean },
    message: { type: String },
  },

  computed: {
    $_shows: {
      get() { return this.shows; },
      set(shows) { this.$_updateShows(shows) },
    }
  },

  methods: {
    $_updateShows(shows) {
      this.$emit('update', shows);
    },
  }
}
</script>