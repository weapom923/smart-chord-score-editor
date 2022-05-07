<template>
  <dialog-base
    v-model="$_shows"
    v-bind:ok-callback="$_ok"
    v-bind:initialize-callback="$_initialize"
    v-bind:ok-disabled="!$data.$_valid"
  >
    <template v-slot:body>
      <v-card-title>Section</v-card-title>

      <v-card-text>
        <v-form v-model="$data.$_valid">
          <v-container>
            <v-row>
              <v-col sm="4" cols="12">
                <v-text-field
                  v-model="$data.$_sectionName"
                  v-bind:rules="$_rules.sectionName"
                  label="Name"
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
    score: { type: Score },
    sectionIdx: { type: Number },
  },

  data() {
    return {
      $_valid: true,
      $_sectionName: '',
    };
  },

  computed: {
    $_shows: {
      get()      { return this.shows },
      set(shows) { this.$emit('update', shows) },
    },

    $_rules() {
      return {
        sectionName: [
          input_utils.isTextFieldNotEmpty,
        ],
      };
    },
  },

  methods: {
    $_initialize() {
      this.$data.$_sectionName = this.score.sections[this.sectionIdx].name;
    },

    $_ok() {
      if (this.callback) {
        this.callback({ sectionName: this.$data.$_sectionName });
      }
    },
  },
}
</script>