<template>
  <dialog-base v-model="$_shows">
    <template v-slot:body>
      <v-card-title>Smart Chord Score Editor</v-card-title>
      <v-card-text>
        Version {{ $_appVersion.major }}.{{ $_appVersion.minor }}.{{ $_appVersion.patch }}
      </v-card-text>
    </template>
  </dialog-base>
</template>

<script>
import DialogBase from './DialogBase.vue';
import AppVersion from '../../modules/AppVersion.js';

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

    $_appVersion() {
      return AppVersion;
    },
  },
}
</script>