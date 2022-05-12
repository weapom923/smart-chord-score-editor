<template>
  <v-select
    v-model="$_scaleName"
    v-bind="$attrs"
    v-bind:items="$_scaleNames"
    v-on:keydown.stop
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

  computed: {
    $_scaleNames() { return Object.keys(scaleNameToInstances) },

    $_scaleName: {
      get() {
        return Object.keys(scaleNameToInstances).find(
          scaleName => scaleNameToInstances[scaleName].isEqualTo(this.value),
        );
      },

      set(scaleName) {
        this.$emit('update', scaleNameToInstances[scaleName]);
      },
    }
  },
}
</script>