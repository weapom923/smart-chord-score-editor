<template>
  <dialog-base
    v-model="$_shows"
    v-bind:ok-callback="$_ok"
    v-bind:ok-disabled="!$data.$_valid"
  >
    <template v-slot:body>
      <v-card-title>Global Config</v-card-title>
  
      <v-card-text>
        <v-form v-model="$data.$_valid">
          <v-container>
            <v-row>
              <v-col sm="4" cols="12">
                <v-text-field
                  number
                  type="number"
                  v-model="$data.$_staffLineStepPx"
                  v-bind:rules="$_rules.staffLineStepPx"
                  v-bind:max="$_staffLineStaffPxMax"
                  v-bind:min="$_staffLineStaffPxMin"
                  label="Staff Line Step(px)"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <v-text-field
                  number
                  type="number"
                  v-model="$data.$_systemMarginTopPx"
                  v-bind:rules="$_rules.systemMarginTopPx"
                  v-bind:min="$_systemMarginTopPxMin"
                  label="System Margin Top(px)"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <v-text-field
                  number
                  type="number"
                  v-model="$data.$_systemMarginBottomPx"
                  v-bind:rules="$_rules.systemMarginBottomPx"
                  v-bind:min="$_systemMerginBottomPxMin"
                  label="Staff Margin Bottom(px)"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <grid-note-selector
                  v-model="$data.$_gridNoteValue"
                  v-bind:rules="$_rules.gridNoteValue"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <v-text-field
                  number
                  type="number"
                  v-model="$data.$_chordFontSizePx"
                  v-bind:rules="$_rules.chordFontSizePx"
                  v-bind:min="$_chordFontSizePxMin"
                  label="Chord Font Size(px)"
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
import GridNoteSelector from '../parts/GridNoteSelector.vue';
import input_utils from '../../modules/input_utils.js';

const staffLineStaffPxMin = 5;
const staffLineStaffPxMax = 15;
const systemMarginTopPxMin = 0;
const systemMerginBottomPxMin = 0;
const chordFontSizePxMin = 6;

export default {
  model: {
    prop: 'shows',
    event: 'update',
  },

  components: {
    DialogBase,
    GridNoteSelector,
  },

  props: {
    shows: { type: Boolean, default: false },
  },

  data() {
    return {
      $_valid: true,
      $_staffLineStepPx: this.$store.state.config.staffLineStepPx,
      $_systemMarginTopPx: this.$store.state.config.systemMarginTopPx,
      $_systemMarginBottomPx: this.$store.state.config.systemMarginBottomPx,
      $_gridNoteValue: this.$store.state.config.gridNoteValue,
      $_chordFontSizePx: this.$store.state.config.chordFontSizePx,
      // $_defaultChord: this.$store.state.config.defaultChord,
      // $_selectedNoteColor: this.$store.state.config.selectedNoteColor,
    };
  },

  computed: {
    $_shows: {
      get()      { return this.shows },
      set(shows) { this.$emit('update', shows) },
    },

    $_staffLineStaffPxMin() { return staffLineStaffPxMin },

    $_staffLineStaffPxMax() { return staffLineStaffPxMax },

    $_systemMarginTopPxMin() { return systemMarginTopPxMin },

    $_systemMerginBottomPxMin() { return systemMerginBottomPxMin },

    $_chordFontSizePxMin() { return chordFontSizePxMin },

    $_rules() {
      return {
        staffLineStepPx: [
          input_utils.isTextFieldNotEmpty,
          staffLineStepPx => {
            if (staffLineStepPx < staffLineStaffPxMin) {
              return 'Staff line staff must be more than or equal to ' + String(staffLineStaffPxMin) + '.';
            } else if (staffLineStepPx > staffLineStaffPxMax) {
              return 'Staff line staff must be less than or equal to ' + String(staffLineStaffPxMax) + '.';
            }
            return true;
          },
        ],

        systemMarginTopPx: [
          input_utils.isTextFieldNotEmpty,
          systemMarginTopPx => {
            if (systemMarginTopPx < systemMarginTopPxMin) {
              return 'System margin must be more than or equal to ' + String(systemMarginTopPxMin) + '.';
            }
            return true;
          },
        ],

        systemMarginBottomPx: [
          input_utils.isTextFieldNotEmpty,
          systemMarginBottomPx => {
            if (systemMarginBottomPx < systemMerginBottomPxMin) {
              return 'System margin must be more than or equal to ' + String(systemMerginBottomPxMin) + '.';
            }
            return true;
          },
        ],

        gridNoteValue: [
          input_utils.isTextFieldNotEmpty,
          () => { return true },
        ],

        chordFontSizePx: [
          input_utils.isTextFieldNotEmpty,
          chordFontSizePx => {
            if (chordFontSizePx < chordFontSizePxMin) {
              return 'Chord font size must be more than or equal to ' + String(chordFontSizePxMin) + '.';
            }
            return true;
          },
        ],

        // defaultChord: [
        //   () => { return true }
        // ],

        // selectedNoteColor: [
        //   () => { return true }
        // ],
      };
    },
  },

  methods: {
    $_ok() {
      this.$store.dispatch(
        'setConfig',
        {
          staffLineStepPx: Number(this.$data.$_staffLineStepPx),
          systemMarginTopPx: Number(this.$data.$_systemMarginTopPx),
          systemMarginBottomPx: Number(this.$data.$_systemMarginBottomPx),
          gridNoteValue: this.$data.$_gridNoteValue,
          chordFontSizePx: Number(this.$data.$_chordFontSizePx),
        },
      )
    },
  },
}
</script>