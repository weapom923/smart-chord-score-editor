<template>
  <dialog-base
    v-model="$_shows"
    v-bind:ok-callback="$_ok"
    v-bind:initialize-callback="$_initialize"
    v-bind:ok-disabled="!$data.$_valid"
  >
    <template v-slot:body>
      <v-card-title>Score Metadata</v-card-title>
  
      <v-card-text>
        <v-form v-model="$data.$_valid">
          <v-container>
            <v-row>
              <v-col sm="4" cols="12">
                <v-text-field
                  v-model="$data.$_metadata.title"
                  v-bind:rules="$_rules.title"
                  label="Title"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <v-text-field
                  v-model="$data.$_metadata.composerName"
                  v-bind:rules="$_rules.composerName"
                  label="Composer Name"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <v-text-field
                  v-model="$data.$_metadata.arrangerName"
                  v-bind:rules="$_rules.arrangerName"
                  label="Arranger Name"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <v-text-field
                  v-model="$data.$_metadata.lyricistName"
                  v-bind:rules="$_rules.lyricistName"
                  label="Lyricist Name"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
    </template>
  </dialog-base>
</template>

<script>
import DialogBase from './DialogBase.vue';
import Score from '../../modules/Score.js';
import input_utils from '../../modules/input_utils.js';

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
    callback: { type: Function, default: null },
    metadata: { type: Score.Metadata },
  },

  data() {
    return {
      $_valid: true,
      $_metadata: null,
    };
  },

  computed: {
    $_shows: {
      get()      { return this.shows },
      set(shows) { this.$emit('update', shows) },
    },

    $_rules() {
      return {
        title: [
          input_utils.anythingIsOk,
        ],

        composerName: [
          input_utils.anythingIsOk,
        ],

        arrangerName: [
          input_utils.anythingIsOk,
        ],

        lyricistName: [
          input_utils.anythingIsOk,
        ],
      };
    },
  },

  methods: {
    $_initialize() {
      this.$data.$_metadata = this.metadata.clone();
    },

    $_ok() {
      if (this.callback) {
        this.callback(
          new Score.Metadata(
            this.$data.$_metadata.title,
            this.$data.$_metadata.composerName,
            this.$data.$_metadata.arrangerName,
            this.$data.$_metadata.lyricistName,
          ),
        );
      }
    },
  },
}
</script>