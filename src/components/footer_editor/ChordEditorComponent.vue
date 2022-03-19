<template>
  <div id="chord-component-selector-container">
    <v-btn-toggle
      mandatory tile
      class="chord-component-selector root"
      v-bind:value="$data.$_rootNoteSymbolIdx"
      v-on:change="$_updateRootNoteSymbol"
    >
      <v-btn
        small
        class="chord-component-selector-button"
        v-for="(rootNoteSymbolText, rootNoteSymbolIdx) in $_rootNoteSymbolTexts"
        v-bind:key="rootNoteSymbolIdx"
      >
        {{ rootNoteSymbolText }}
      </v-btn>
    </v-btn-toggle>

    <v-btn-toggle
      mandatory tile
      class="chord-component-selector accidental-sign"
      v-bind:value="$data.$_rootNoteAccidentalSignIdx"
      v-on:change="$_updateRootNoteAccidentalSign"
    >
      <v-btn
        small
        class="chord-component-selector-button"
        v-for="(noteAccidentalSign, noteAccidentalSignIdx) in $_noteAccidentalSigns"
        v-bind:key="noteAccidentalSignIdx"
      >
        {{ noteAccidentalSign }}
      </v-btn>
    </v-btn-toggle>

    <v-btn-toggle
      mandatory tile
      class="chord-component-selector"
      v-bind:value="$data.$_triadIdx"
      v-on:change="$_updateTriad"
    >
      <v-btn
        small
        class="chord-component-selector-button"
        v-for="(triadText, triadIdx) in $_triadTexts"
        v-bind:key="triadIdx"
      >
        {{ triadText }}
      </v-btn>
    </v-btn-toggle>

    <v-btn-toggle
      mandatory tile
      class="chord-component-selector"
      v-bind:value="$data.$_sixthOrSeventhIdx"
      v-on:change="$_updateSixthOrSeventh"
    >
      <v-btn
        small
        class="chord-component-selector-button"
        v-for="(sixthOrSeventhText, sixthOrSeventhIdx) in $_sixthOrSeventhTexts"
        v-bind:key="sixthOrSeventhIdx"
      >
        {{ sixthOrSeventhText }}
      </v-btn>
    </v-btn-toggle>

    <v-btn-toggle
      multiple tile
      class="chord-component-selector"
      v-bind:value="$data.$_tensionIdcs"
      v-on:change="$_updateTensions"
    >
      <v-btn
        small
        class="chord-component-selector-button"
        v-for="(tensionText, tensionIdx) in $_tensionTexts"
        v-bind:key="tensionIdx"
      >
        {{ tensionText }}
      </v-btn>
    </v-btn-toggle>

    <v-btn-toggle
      mandatory tile
      class="chord-component-selector"
      v-bind:value="$data.$_bassNoteSymbolIdx"
      v-on:change="$_updateBassNoteSymbol"
    >
      <v-btn
        small
        class="chord-component-selector-button"
        v-for="(bassNoteSymbolText, bassNoteSymbolIdx) in $_bassNoteSymbolTexts"
        v-bind:key="bassNoteSymbolIdx"
      >
        {{ bassNoteSymbolText }}
      </v-btn>
    </v-btn-toggle>

    <v-btn-toggle
      mandatory tile
      class="chord-component-selector accidental-sign"
      v-if="$_isChordWithBass"
      v-bind:value="$data.$_bassNoteAccidentalSignIdx"
      v-on:change="$_updateBassNoteAccidentalSign"
    >
      <v-btn
        small
        class="chord-component-selector-button"
        v-for="(noteAccidentalSign, noteAccidentalSignIdx) in $_noteAccidentalSigns"
        v-bind:key="noteAccidentalSignIdx"
      >
        {{ noteAccidentalSign }}
      </v-btn>
    </v-btn-toggle>

  </div>
</template>

<style scoped>
#chord-component-selector-container {
  display: flex;
  flex-direction: row;
}

.chord-component-selector {
  flex-direction: column;
  height: 300px;
}

.chord-component-selector-button {
  flex-grow: 1;
}

.chord-component-selector:not(.accidental-sign):not(.root) {
  flex-grow: 1;
}

.chord-component-selector.root {
  flex-grow: 2;
}

.chord-component-selector.accidental-sign {
  flex-grow: 0;
}
</style>

<script>
import Chord from '@/modules/Chord.js'
import TensionNotePitch from '@/modules/TensionNotePitch.js'
import NotePitch from '@/modules/NotePitch.js'
import NotePitchSymbol from '@/modules/NotePitchSymbol.js'

function first(x) {
  return x[0];
}

function second(x) {
  return x[1];
}

export default {
  model: {
    prop: 'chord',
    event: 'change',
  },

  watch: {
    chord: {
      handler() { this.$_loadChord() },
      immediate: true,
    },
  },

  props: {
    chord: { type: Chord },
  },

  data() {
    return {
      $_rootNoteSymbolIdx: null,
      $_rootNoteAccidentalSignIdx: null,
      $_triadIdx: null,
      $_sixthOrSeventhIdx: null,
      $_tensionIdcs: [],
      $_bassNoteSymbolIdx: null,
      $_bassNoteAccidentalSignIdx: null,
    };
  },

  computed: {
    $_isChordWithBass() {
      return (this.chord.bass !== null);
    },

    $_rootNoteSymbolTextToInstance() {
      return [
        [ 'A', NotePitchSymbol.a ],
        [ 'B', NotePitchSymbol.b ],
        [ 'C', NotePitchSymbol.c ],
        [ 'D', NotePitchSymbol.d ],
        [ 'E', NotePitchSymbol.e ],
        [ 'F', NotePitchSymbol.f ],
        [ 'G', NotePitchSymbol.g ],
      ]
    },
    $_rootNoteSymbolTexts() { return this.$_rootNoteSymbolTextToInstance.map(first) },
    $_rootNoteSymbols() { return this.$_rootNoteSymbolTextToInstance.map(second) },

    $_bassNoteSymbolTextToInstance() {
      return [
        [ '', null ],
        [ 'A', NotePitchSymbol.a ],
        [ 'B', NotePitchSymbol.b ],
        [ 'C', NotePitchSymbol.c ],
        [ 'D', NotePitchSymbol.d ],
        [ 'E', NotePitchSymbol.e ],
        [ 'F', NotePitchSymbol.f ],
        [ 'G', NotePitchSymbol.g ],
      ]
    },
    $_bassNoteSymbolTexts() { return this.$_bassNoteSymbolTextToInstance.map(first) },
    $_bassNoteSymbols() { return this.$_bassNoteSymbolTextToInstance.map(second) },

    $_noteAccidentalSignToPitchShift() {
      return [
        [ '♭', -1 ],
        [ '♮', 0 ],
        [ '♯', 1 ],
      ];
    },
    $_noteAccidentalSigns() { return this.$_noteAccidentalSignToPitchShift.map(first) },
    $_notePitchShifts() { return this.$_noteAccidentalSignToPitchShift.map(second) },

    $_triadTextToInstance() {
      return [
        [ 'maj', Chord.Triad.major ],
        [ 'min', Chord.Triad.minor ],
        [ 'sus4', Chord.Triad.suspendedFourth ],
        [ 'sus2', Chord.Triad.suspendedSecond ],
        [ 'dim', Chord.Triad.diminished ],
        [ 'aug', Chord.Triad.augumented ],
      ];
    },
    $_triadTexts() { return this.$_triadTextToInstance.map(first) },
    $_triads() { return this.$_triadTextToInstance.map(second) },

    $_sixthOrSeventhTextToInstance() {
      return [
        [ '', null ],
        [ '6', Chord.SixthOrSeventh.sixth ],
        [ '7', Chord.SixthOrSeventh.dominantSeventh ],
        [ 'M7', Chord.SixthOrSeventh.majorSeventh ],
        [ 'dim7', Chord.SixthOrSeventh.diminishedSeventh ],
      ];
    },
    $_sixthOrSeventhTexts() { return this.$_sixthOrSeventhTextToInstance.map(first) },
    $_sixthOrSevenths() { return this.$_sixthOrSeventhTextToInstance.map(second) },

    $_tensionTextToInstance() {
      return [
        [ '9', TensionNotePitch.ninth ],
        [ '♭9', TensionNotePitch.flatNinth ],
        [ '♯9', TensionNotePitch.sharpNinth ],
        [ '11', TensionNotePitch.eleventh ],
        [ '♯11', TensionNotePitch.sharpEleventh ],
        [ '13', TensionNotePitch.thirteenth ],
        [ '♭13', TensionNotePitch.flatThirteenth ],
      ];
    },
    $_tensionTexts() { return this.$_tensionTextToInstance.map(first) },
    $_tensions() { return this.$_tensionTextToInstance.map(second) },
  },

  methods: {
    $_loadChord() {
      this.$data.$_rootNoteSymbolIdx = this.$_rootNoteSymbols.findIndex(rootNoteSymbol => {
        return rootNoteSymbol === this.chord.root.symbol;
      });
      this.$data.$_rootNoteAccidentalSignIdx = this.$_notePitchShifts.findIndex(rootNotePitchShift => {
        return rootNotePitchShift === this.chord.root.shift;
      });
      this.$data.$_triadIdx = this.$_triads.findIndex(triad => {
        return triad === this.chord.triad;
      });
      this.$data.$_sixthOrSeventhIdx = this.$_sixthOrSevenths.findIndex(sixthOrSeventh => {
        return sixthOrSeventh === this.chord.sixthOrSeventh;
      });
      this.$data.$_tensionIdcs = this.$_tensions
        .filter(tension => {
          return this.chord.tensions.has(tension);
        })
        .map(tension => {
          return this.$_tensions.findIndex(_tension => {
            return _tension === tension;
          })
        });
      if (this.chord.bass !== null) {
        this.$data.$_bassNoteSymbolIdx = this.$_bassNoteSymbols.findIndex(bassNoteSymbol => {
          return bassNoteSymbol === this.chord.bass.symbol;
        });
        this.$data.$_bassNoteAccidentalSignIdx = this.$_notePitchShifts.findIndex(bassNotePitchShift => {
          return bassNotePitchShift === this.chord.bass.shift;
        });
      } else {
        this.$data.$_bassNoteSymbolIdx = this.$_bassNoteSymbols.findIndex(bassNoteSymbol => (bassNoteSymbol === null));
      }
    },

    $_updateRootNoteSymbol(rootNoteSymbolIdx) {
      let rootNoteSymbol = this.$_rootNoteSymbols[rootNoteSymbolIdx];
      let newChord = new Chord(
        NotePitch.findPredefinedNotePitch(rootNoteSymbol, this.chord.root.shift),
        this.chord.triad,
        this.chord.sixthOrSeventh,
        this.chord.tensions,
        this.chord.bass,
      )
      this.$emit('change', newChord);
    },

    $_updateRootNoteAccidentalSign(noteAccidentalSignIdx) {
      let rootNotePitchShift = this.$_notePitchShifts[noteAccidentalSignIdx];
      let newChord = new Chord(
        NotePitch.findPredefinedNotePitch(this.chord.root.symbol, rootNotePitchShift),
        this.chord.triad,
        this.chord.sixthOrSeventh,
        this.chord.tensions,
        this.chord.bass,
      )
      this.$emit('change', newChord);
    },

    $_updateTriad(triadIdx) {
      let triad = this.$_triads[triadIdx];
      let newChord = new Chord(
        this.chord.root,
        triad,
        this.chord.sixthOrSeventh,
        this.chord.tensions,
        this.chord.bass,
      )
      this.$emit('change', newChord);
    },

    $_updateSixthOrSeventh(sixthOrSeventhIdx) {
      let sixthOrSeventh = this.$_sixthOrSevenths[sixthOrSeventhIdx];
      let newChord = new Chord(
        this.chord.root,
        this.chord.triad,
        sixthOrSeventh,
        this.chord.tensions,
        this.chord.bass,
      )
      this.$emit('change', newChord);
    },

    $_updateTensions(tensionIdcs) {
      let tensions = new Set();
      for (let tensionIdx of tensionIdcs) {
        tensions.add(this.$_tensions[tensionIdx])
      }
      let newChord = new Chord(
        this.chord.root,
        this.chord.triad,
        this.chord.sixthOrSeventh,
        tensions,
        this.chord.bass,
      )
      this.$emit('change', newChord);
    },

    $_updateBassNoteSymbol(bassNoteSymbolIdx) {
      let bassNoteSymbol = this.$_bassNoteSymbols[bassNoteSymbolIdx];
      let newBass = null;
      if (this.chord.bass === null) {
        if (bassNoteSymbol !== null) {
          newBass = NotePitch.findPredefinedNotePitch(bassNoteSymbol, 0);
        }
      } else {
        if (bassNoteSymbol !== null) {
          newBass = NotePitch.findPredefinedNotePitch(bassNoteSymbol, this.chord.bass.shift);
        }
      }
      let newChord = new Chord(
        this.chord.root,
        this.chord.triad,
        this.chord.sixthOrSeventh,
        this.chord.tensions,
        newBass,
      )
      this.$emit('change', newChord);
    },

    $_updateBassNoteAccidentalSign(noteAccidentalSignIdx) {
      let bassNotePitchShift = this.$_notePitchShifts[noteAccidentalSignIdx];
      let newChord = new Chord(
        this.chord.root,
        this.chord.triad,
        this.chord.sixthOrSeventh,
        this.chord.tensions,
        NotePitch.findPredefinedNotePitch(this.chord.bass.symbol, bassNotePitchShift),
      )
      this.$emit('change', newChord);
    },
  },
}
</script>
