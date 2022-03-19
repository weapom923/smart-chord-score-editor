<template>
  <v-dialog v-bind:value="show">
    <v-card>
      <v-card-title>Global Config</v-card-title>
  
      <v-card-text>
        <v-form
          ref="form"
          v-model="$data.$_valid"
        >
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
                <v-select
                  v-model="$data.$_gridNoteValueName"
                  v-bind:items="$_gridNoteValueNames"
                  v-bind:rules="$_rules.gridNoteValue"
                  label="Grid Note Value"
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

      <v-card-actions>
        <v-spacer />
        <v-btn
          text secondary
          v-on:click="$_cancel"
        >
          Cancel
        </v-btn>
        <v-btn
          text primary
          v-on:click="$_submit"
          v-bind:disabled="!$data.$_valid"
        >
          OK
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import NoteValue from '@/modules/NoteValue.js';
import input_utils from '@/modules/input_utils.js';

const staffLineStaffPxMin = 5;
const staffLineStaffPxMax = 15;
const systemMarginTopPxMin = 0;
const systemMerginBottomPxMin = 0;
const chordFontSizePxMin = 6;

const gridNoteValueNameToInstances = {
  'Whole': NoteValue.divisible.whole,
  'Half': NoteValue.divisible.half,
  'Quarter': NoteValue.divisible.quarter,
};

export default {
  model: {
    prop: 'show',
    event: 'update',
  },

  props: {
    show: { type: Boolean, default: false },
  },

  data() {
    let gridNoteValueName = Object.keys(gridNoteValueNameToInstances)
      .find(gritNoteValueName => {
        let gridNoteValue = gridNoteValueNameToInstances[gritNoteValueName];
        return (this.$store.state.config.gridNoteValue === gridNoteValue);
      });
    return {
      $_valid: true,
      $_staffLineStepPx: this.$store.state.config.staffLineStepPx,
      $_systemMarginTopPx: this.$store.state.config.systemMarginTopPx,
      $_systemMarginBottomPx: this.$store.state.config.systemMarginBottomPx,
      $_gridNoteValueName: gridNoteValueName,
      $_chordFontSizePx: this.$store.state.config.chordFontSizePx,
      // $_defaultChord: this.$store.state.config.defaultChord,
      // $_selectedNoteColor: this.$store.state.config.selectedNoteColor,
    };
  },

  computed: {
    $_staffLineStaffPxMin() { return staffLineStaffPxMin },

    $_staffLineStaffPxMax() { return staffLineStaffPxMax },

    $_systemMarginTopPxMin() { return systemMarginTopPxMin },

    $_systemMerginBottomPxMin() { return systemMerginBottomPxMin },

    $_chordFontSizePxMin() { return chordFontSizePxMin },

    $_gridNoteValueNames() {
      return Object.keys(gridNoteValueNameToInstances);
    },

    $_rules() {
      return {
        staffLineStepPx: [
          input_utils.isTextFieldEmpty,
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
          input_utils.isTextFieldEmpty,
          systemMarginTopPx => {
            if (systemMarginTopPx < systemMarginTopPxMin) {
              return 'System margin must be more than or equal to ' + String(systemMarginTopPxMin) + '.';
            }
            return true;
          },
        ],

        systemMarginBottomPx: [
          input_utils.isTextFieldEmpty,
          systemMarginBottomPx => {
            if (systemMarginBottomPx < systemMerginBottomPxMin) {
              return 'System margin must be more than or equal to ' + String(systemMerginBottomPxMin) + '.';
            }
            return true;
          },
        ],

        gridNoteValue: [
          input_utils.isTextFieldEmpty,
          () => { return true },
        ],

        chordFontSizePx: [
          input_utils.isTextFieldEmpty,
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
    $_close() {
      this.$emit('update', false);
    },

    $_cancel() {
      this.$_close();
    },

    $_submit() {
      this.$store.dispatch(
        'setConfig',
        {
          staffLineStepPx: Number(this.$data.$_staffLineStepPx),
          systemMarginTopPx: Number(this.$data.$_systemMarginTopPx),
          systemMarginBottomPx: Number(this.$data.$_systemMarginBottomPx),
          gridNoteValue: gridNoteValueNameToInstances[this.$data.$_gridNoteValueName],
          chordFontSizePx: Number(this.$data.$_chordFontSizePx),
        },
      )
      this.$_close();
    },
  },
}
</script>