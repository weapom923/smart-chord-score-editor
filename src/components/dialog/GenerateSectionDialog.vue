<template>
  <v-dialog v-bind:value="show">
    <v-card>
      <v-card-title>Section</v-card-title>
  
      <v-card-text>
        <v-form
          ref="form"
          v-model="$data.$_valid"
        >
          <v-container>
            <v-row>
              <v-col sm="4" cols="12">
                <v-text-field
                  v-model="$data.$_name"
                  v-bind:rules="$_rules.name"
                  label="Section Name"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <v-text-field
                  number
                  type="number"
                  v-model="$data.$_barValueNumerator"
                  v-bind:rules="$_rules.barValueNumerator"
                  v-bind:min="$_barValueNumeratorMin"
                  label="Bar Value"
                />
                <hr />
                <v-select
                  v-model="$data.$_barValueDenominator"
                  v-bind:items="$_barValueDenominators"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <v-select
                  v-model="$data.$_clefTypeName"
                  v-bind:items="$_clefTypeNames"
                  label="Clef Sign"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <v-select
                  v-model="$data.$_scaleName"
                  v-bind:items="$_allScaleNames"
                  label="Part Type"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <v-select
                  multiple
                  v-model="$data.$_partInBarTypeNameArray"
                  v-bind:items="$_allPartInBarTypeNames"
                  v-bind:rules="$_rules.partInBarTypeNameArray"
                  label="Part Type"
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
import Section from '@/modules/Section.js';
import Clef from '@/modules/Clef.js';
import Scale from '@/modules/Scale.js';
import NoteValue from '@/modules/NoteValue.js';
import PartInBar from '@/modules/PartInBar.js';
import input_utils from '@/modules/input_utils.js';

const barValueNumeratorMin = 1;

const clefTypeNameToInstances = {
  treble: Clef.Type.treble,
  bass:   Clef.Type.bass,
};

const partInBarTypeNameToInstances = {
  // normal: PartInBar.Type.normal,
  // rhythm: PartInBar.Type.rhythm,
  chord: PartInBar.Type.chord,
};

const scaleNameToInstances = {
  'C Major': Scale.cMajor,
  'G Major': Scale.gMajor,
  'D Major': Scale.dMajor,
  'A Major': Scale.aMajor,
  'E Major': Scale.eMajor,
  'B Major': Scale.bMajor,
  'F♯ Major': Scale.fSharpMajor,
  'G♭ Major': Scale.gFlatMajor,
  'C♯ Major': Scale.cSharpMajor,
  'D♭ Major': Scale.dFlatMajor,
  'A♭ Major': Scale.aFlatMajor,
  'E♭ Major': Scale.eFlatMajor,
  'B♭ Major': Scale.bFlatMajor,
  'F Major': Scale.fMajor,
  'A Minor': Scale.aMinor,
  'D Minor': Scale.dMinor,
  'G Minor': Scale.gMinor,
  'C Minor': Scale.cMinor,
  'F Minor': Scale.fMinor,
  'B♭ Minor': Scale.bFlatMinor,
  'E♭ Minor': Scale.eFlatMinor,
  'G♯ Minor': Scale.gSharpMinor,
  'C♯ Minor': Scale.cSharpMinor,
  'F♯ Minor': Scale.fSharpMinor,
  'B Minor': Scale.bMinor,
  'E Minor': Scale.eMinor,
};

export default {
  watch: {
    show: {
      handler() { this.$_loadData() },
      immediate: true,
    },
  },

  model: {
    prop: 'show',
    event: 'update',
  },

  props: {
    show: { type: Boolean, default: false },
    section: { type: Section, default: null },
    callback: { type: Function, default: null },
    barValue: { type: NoteValue, default: null },
    clef: { type: Clef, default: null },
    scale: { type: Scale, default: null },
    partInBarTypes: { type: Array, default: null },
  },

  data() {
    return {
      $_valid: true,
      $_name: null,
      $_barValueNumerator: null,
      $_barValueDenominator: null,
      $_clefTypeName: null,
      $_scaleName: null,
      $_partInBarTypeNameArray: null,
    };
  },

  computed: {
    $_barValueDenominators() { return [ 4, 8, 16, 32 ] },

    $_clefTypeNames() { return Object.keys(clefTypeNameToInstances) },

    $_allScaleNames() { return Object.keys(scaleNameToInstances) },

    $_allPartInBarTypeNames() { return Object.keys(partInBarTypeNameToInstances) },

    $_scaleNames() { return Object.keys(scaleNameToInstances) },

    $_barValueNumeratorMin() { return barValueNumeratorMin },

    $_rules() {
      return {
        name: [
          input_utils.isTextFieldEmpty,
        ],

        barValueNumerator: [
          input_utils.isTextFieldEmpty,
          barValueNumerator => {
            if (barValueNumerator < barValueNumeratorMin) {
              return 'Bar value numerator must be more than or equal to ' + String(barValueNumeratorMin) + '.';
            }
            return true;
          },
        ],

        partInBarTypeNameArray: [
          partInBarTypeNameArray => {
            if (partInBarTypeNameArray.length === 0) {
              return 'At least 1 part type must be selected.';
            }
            return true;
          },
        ],
      };
    },
  },

  methods: {
    $_loadData() {
      let clefTypeName = this.$_clefTypeNames.find(
        clefTypeName => (clefTypeNameToInstances[clefTypeName] === this.$store.state.config.defaultClef),
      );
      let scale = (this.scale === null)? this.$store.state.config.defaultScale : this.scale;
      let scaleName = this.$_scaleNames.find(
        scaleName => (scaleNameToInstances[scaleName] === scale),
      );
      let barValue = (this.barValue === null)? this.$store.state.config.defaultBarValue : this.barValue;
      let partInBarTypes = (this.partInBarTypes === null)? this.$store.state.config.defaultPartInBarTypes : this.partInBarTypes;
      let partInBarTypeNameArray = partInBarTypes.map(
        partInBarType => {
          return this.$_allPartInBarTypeNames.find(
            partInBarTypeName => ( partInBarType === partInBarTypeNameToInstances[partInBarTypeName])
          )
        },
      );
      this.$data.$_name = '';
      this.$data.$_barValueNumerator = barValue.numerator;
      this.$data.$_barValueDenominator = barValue.denominator;
      this.$data.$_clefTypeName = clefTypeName;
      this.$data.$_scaleName = scaleName;
      this.$data.$_partInBarTypeNameArray = partInBarTypeNameArray;
    },

    $_close() {
      this.$emit('update', false);
    },

    $_cancel() {
      this.$_close();
    },

    $_submit() {
      if (this.callback) {
        this.callback(
          Section.generateNew(
            this.$data.$_name,
            new NoteValue(Number(this.$data.$_barValueNumerator), Number(this.$data.$_barValueDenominator)),
            clefTypeNameToInstances[this.$data.$_clefTypeName],
            scaleNameToInstances[this.$data.$_scaleName],
            this.$data.$_partInBarTypeNameArray.map(partInBarTypeName => partInBarTypeNameToInstances[partInBarTypeName]),
          ),
        );
      }
      this.$_close();
    },
  },
}
</script>