<template>
  <v-select
    v-model="$data.$_scaleName"
    v-bind="$attrs"
    v-bind:items="$_scaleNames"
    v-on:input="$_onInput"
    label="Scale"
  />
</template>

<script>
import Scale from '../../modules/Scale.js';

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
  model: {
    prop: 'value',
    event: 'update',
  },

  props: {
    value: { type: Scale },
  },

  data() {
    let scaleName = Object.keys(scaleNameToInstances).find(
      scaleName => (scaleNameToInstances[scaleName] === this.value),
    );
    return {
      $_scaleName: scaleName,
    };
  },

  computed: {
    $_scaleNames() { return Object.keys(scaleNameToInstances) },
  },

  methods: {
    $_onInput(scaleName) {
      this.$emit('update', scaleNameToInstances[scaleName]);
    },
  },
}
</script>