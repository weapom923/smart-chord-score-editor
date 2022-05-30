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
        <v-form
          ref="form"
          v-model="$data.$_valid"
          v-on:submit.prevent
        >
          <v-container>
            <v-row>
              <v-col sm="4" cols="12">
                <dialog-text-field
                  autofocus
                  v-model="$data.$_name"
                  v-bind:rules="$_rules.name"
                  label="Section Name"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <bar-value-text-area-and-selector
                  v-model="$data.$_barValue"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <clef-selector
                  v-model="$data.$_clef"
                  label="Clef Sign"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <scale-selector
                  v-model="$data.$_scale"
                />
              </v-col>

              <v-col sm="4" cols="12">
                <part-in-bar-type-selector
                  v-model="$data.$_partInBarTypes"
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
import DialogTextField from '../parts/DialogTextField.vue';
import ScaleSelector from '../parts/ScaleSelector.vue';
import ClefSelector from '../parts/ClefSelector.vue';
import BarValueTextAreaAndSelector from '../parts/BarValueTextAreaAndSelector.vue';
import PartInBarTypeSelector from '../parts/PartInBarTypeSelector.vue';
import Section from '../../modules/Section.js';
import Clef from '../../modules/Clef.js';
import Scale from '../../modules/Scale.js';
import NoteValue from '../../modules/NoteValue.js';
import PartInBar from '../../modules/PartInBar.js';
import input_utils from '../../modules/input_utils.js';

const partInBarTypeNameToInstances = {
  // normal: PartInBar.Type.normal,
  // rhythm: PartInBar.Type.rhythm,
  chord: PartInBar.Type.chord,
};

export default {
  model: {
    prop: 'shows',
    event: 'update',
  },

  components: {
    DialogBase,
    DialogTextField,
    ScaleSelector,
    ClefSelector,
    BarValueTextAreaAndSelector,
    PartInBarTypeSelector,
  },

  props: {
    shows: { type: Boolean, default: false },
    section: { type: Section, default: null },
    callback: { type: Function, default: null },
    barValue: { type: NoteValue, default: null },
    clef: { type: Clef, default: null },
    scale: { type: Scale, default: null },
    partInBarTypes: { type: Array, default: null },
    gridNoteValue: { type: NoteValue, default: null },
  },

  data() {
    return {
      $_valid: true,
      $_name: null,
      $_barValue: null,
      $_clef: null,
      $_scale: null,
      $_partInBarTypes: null,
    };
  },

  computed: {
    $_shows: {
      get()      { return this.shows },
      set(shows) { this.$emit('update', shows) },
    },

    $_allPartInBarTypeNames() { return Object.keys(partInBarTypeNameToInstances) },

    $_rules() {
      return {
        name: [
          input_utils.isTextFieldNotEmpty,
        ],
      };
    },
  },

  methods: {
    $_initialize() {
      let clef = (this.clef === null)? this.$store.state.config.defaultClef : this.clef;
      let scale = (this.scale === null)? this.$store.state.config.defaultScale : this.scale;
      let barValue = (this.barValue === null)? this.$store.state.config.defaultBarValue : this.barValue;
      let partInBarTypes = (this.partInBarTypes === null)? this.$store.state.config.defaultPartInBarTypes : this.partInBarTypes;
      let gridNoteValue = (this.gridNoteValue === null)? this.$store.state.config.defaultGridNoteValue : this.gridNoteValue;
      this.$data.$_name = '';
      this.$data.$_barValue = barValue;
      this.$data.$_clef = clef;
      this.$data.$_scale = scale;
      this.$data.$_partInBarTypes = partInBarTypes;
      this.$data.$_gridNoteValue = gridNoteValue;
    },

    $_ok() {
      if (this.callback) {
        this.callback(
          Section.generateNew(
            this.$data.$_name,
            this.$data.$_barValue,
            this.$data.$_clef,
            this.$data.$_scale,
            this.$data.$_partInBarTypes,
            this.$data.$_gridNoteValue,
          ),
        );
      }
    },
  },
}
</script>