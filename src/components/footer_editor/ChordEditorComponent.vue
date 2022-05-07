<template>
  <div>
    <v-switch
      dense hide-details
      label="Chord"
      v-if="!$_isNoteRest"
      v-bind:input-value="$_chordExists"
      v-bind:true-value="true"
      v-bind:false-value="false"
      v-on:change="$_onChangeChordExists"
    />
    <div
      id="chord-component-selector-container"
      v-if="$_chordExists"
    >
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
        tile
        class="chord-component-selector"
        v-bind:value="$data.$_sixthOrSeventhIdx"
        v-on:change="$_updateSixthOrSeventh"
      >
        <v-btn
          small
          class="chord-component-selector-button"
          v-for="(sixthOrSeventhText, sixthOrSeventhIdx) in $_sixthOrSeventhTexts"
          v-bind:key="sixthOrSeventhIdx"
          v-bind:disabled="$_isSixthOrSeventhDisabled[sixthOrSeventhIdx]"
        >
          {{ sixthOrSeventhText }}
        </v-btn>
      </v-btn-toggle>

      <v-btn-toggle
        multiple tile
        class="chord-component-selector"
        v-bind:value="$data.$_tensionNotePitchIdcs"
        v-on:change="$_updateTensionNotePitches"
      >
        <v-btn
          small
          class="chord-component-selector-button"
          v-for="(tensionNotePitchText, tensionNotePitchIdx) in $_tensionNotePitchTexts"
          v-bind:key="tensionNotePitchIdx"
          v-bind:disabled="$_isTensionNotePitchDisabled[tensionNotePitchIdx]"
        >
          {{ tensionNotePitchText }}
        </v-btn>
      </v-btn-toggle>

      <v-btn-toggle
        tile
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
        v-bind:value="$data.$_bassNoteAccidentalSignIdx"
        v-on:change="$_updateBassNoteAccidentalSign"
      >
        <v-btn
          small
          class="chord-component-selector-button"
          v-bind:disabled="!$_isChordWithBass"
          v-for="(noteAccidentalSign, noteAccidentalSignIdx) in $_noteAccidentalSigns"
          v-bind:key="noteAccidentalSignIdx"
        >
          {{ noteAccidentalSign }}
        </v-btn>
      </v-btn-toggle>
  
    </div>
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
import Chord from '../../modules/Chord.js'
import TensionNotePitch from '../../modules/TensionNotePitch.js'
import Note from '../../modules/Note.js'
import NotePitch from '../../modules/NotePitch.js'
import NotePitchSymbol from '../../modules/NotePitchSymbol.js'

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

    '$data.$_triadIdx'() {
      let sixthOrSeventhIdx = this.$data.$_sixthOrSeventhIdx;
      if (this.$_isSixthOrSeventhDisabled[sixthOrSeventhIdx]) {
        sixthOrSeventhIdx = this.$_sixthOrSevenths.findIndex(
          sixthOrSeventh => (sixthOrSeventh === null)
        );
      }
      let sixthOrSeventh = this.$_sixthOrSevenths[sixthOrSeventhIdx];
      let tensionNotePitchIdcs = [ ...this.$data.$_tensionNotePitchIdcs ];
      for (let tensionNotePitchIdx of tensionNotePitchIdcs) {
        if (this.$_isTensionNotePitchDisabled[tensionNotePitchIdx]) {
          let idxInTensionNotePitchIdcs = tensionNotePitchIdcs.findIndex(
            currentTensionNotePitchIdx => (currentTensionNotePitchIdx === tensionNotePitchIdx)
          );
          tensionNotePitchIdcs.splice(idxInTensionNotePitchIdcs, 1);
        }
      }
      let tensionNotePitches = new Set();
      for (let tensionNotePitchIdx of tensionNotePitchIdcs) {
        tensionNotePitches.add(this.$_tensionNotePitches[tensionNotePitchIdx]);
      }
      let newChord = new Chord(
        this.chord.root,
        this.chord.triad,
        sixthOrSeventh,
        tensionNotePitches,
        this.chord.bass,
      )
      this.$emit('change', newChord);
    },
  },

  props: {
    noteType: { type: String },
    chord: { type: Chord },
  },

  data() {
    return {
      $_rootNoteSymbolIdx: null,
      $_rootNoteAccidentalSignIdx: null,
      $_triadIdx: null,
      $_sixthOrSeventhIdx: null,
      $_tensionNotePitchIdcs: [],
      $_bassNoteSymbolIdx: null,
      $_bassNoteAccidentalSignIdx: null,
    };
  },

  computed: {
    $_chordExists() {
      return (this.chord !== null);
    },

    $_isNoteRest() {
      return this.noteType === Note.Type.rest;
    },

    $_isChordWithBass() {
      if (!this.$_chordExists) return false;
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
        [ '/A', NotePitchSymbol.a ],
        [ '/B', NotePitchSymbol.b ],
        [ '/C', NotePitchSymbol.c ],
        [ '/D', NotePitchSymbol.d ],
        [ '/E', NotePitchSymbol.e ],
        [ '/F', NotePitchSymbol.f ],
        [ '/G', NotePitchSymbol.g ],
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
        [ '', undefined ],
        [ '6', Chord.SixthOrSeventh.sixth ],
        [ '7', Chord.SixthOrSeventh.dominantSeventh ],
        [ 'M7', Chord.SixthOrSeventh.majorSeventh ],
        [ 'dim7', Chord.SixthOrSeventh.diminishedSeventh ],
      ];
    },
    $_sixthOrSeventhTexts() { return this.$_sixthOrSeventhTextToInstance.map(first) },
    $_sixthOrSevenths() { return this.$_sixthOrSeventhTextToInstance.map(second) },

    $_tensionNotePitchTextToInstance() {
      return [
        [ '', undefined ],
        [ '♭9', TensionNotePitch.flatNinth ],
        [ '9', TensionNotePitch.ninth ],
        [ '♯9', TensionNotePitch.sharpNinth ],
        [ '11', TensionNotePitch.eleventh ],
        [ '♯11', TensionNotePitch.sharpEleventh ],
        [ '♭13', TensionNotePitch.flatThirteenth ],
        [ '13', TensionNotePitch.thirteenth ],
      ];
    },
    $_tensionNotePitchTexts() { return this.$_tensionNotePitchTextToInstance.map(first) },
    $_tensionNotePitches() { return this.$_tensionNotePitchTextToInstance.map(second) },

    $_isSixthOrSeventhDisabled() {
      let isSixthOrSeventhDisabled = new Array(this.$_sixthOrSevenths.length);
      isSixthOrSeventhDisabled.fill(false);

      let disable = (targetSixthOrSeventh) => {
        let targetSixthOrSeventhIdx = this.$_sixthOrSevenths.findIndex(sixthOrSeventh => {
          return targetSixthOrSeventh === sixthOrSeventh;
        });
        isSixthOrSeventhDisabled[targetSixthOrSeventhIdx] = true;
      };

      let triad = this.$_triads[this.$data.$_triadIdx];
      switch (triad) {
        case Chord.Triad.suspendedFourth:
          disable(Chord.SixthOrSeventh.sixth);
          disable(Chord.SixthOrSeventh.majorSeventh);
          disable(Chord.SixthOrSeventh.diminishedSeventh);
          break;
        case Chord.Triad.suspendedSecond:
          disable(Chord.SixthOrSeventh.sixth);
          disable(Chord.SixthOrSeventh.diminishedSeventh);
          disable(Chord.SixthOrSeventh.dominantSeventh);
          disable(Chord.SixthOrSeventh.majorSeventh);
          break;
        case Chord.Triad.diminished:
          disable(Chord.SixthOrSeventh.sixth);
          disable(Chord.SixthOrSeventh.majorSeventh);
          break;
        case Chord.Triad.augumented:
          disable(Chord.SixthOrSeventh.diminishedSeventh);
          disable(Chord.SixthOrSeventh.sixth);
          break;
      }
      return isSixthOrSeventhDisabled;
    },
    
    $_isTensionNotePitchDisabled() {
      let isTensionNotePitchDisabled = new Array(this.$_tensionNotePitches.length);
      isTensionNotePitchDisabled.fill(false);

      let disable = (targetTensionNotePitch) => {
        let targetTensionNotePitchIdx = this.$_tensionNotePitches.findIndex(tensionNotePitch => {
          if (tensionNotePitch === undefined) return false;
          return targetTensionNotePitch.isEqualTo(tensionNotePitch);
        });
        isTensionNotePitchDisabled[targetTensionNotePitchIdx] = true;
      };

      let triad = this.$_triads[this.$data.$_triadIdx];
      switch (triad) {
        case Chord.Triad.major:
          disable(TensionNotePitch.eleventh);
          break;
        case Chord.Triad.minor:
          disable(TensionNotePitch.sharpNinth);
          break;
        case Chord.Triad.suspendedFourth:
          disable(TensionNotePitch.eleventh);
          disable(TensionNotePitch.sharpEleventh);
          break;
        case Chord.Triad.suspendedSecond:
          disable(TensionNotePitch.ninth);
          disable(TensionNotePitch.sharpNinth);
          disable(TensionNotePitch.flatNinth);
          break;
        case Chord.Triad.diminished:
          disable(TensionNotePitch.sharpNinth);
          disable(TensionNotePitch.flatNinth);
          disable(TensionNotePitch.sharpEleventh);
          break;
        case Chord.Triad.augumented:
          disable(TensionNotePitch.flatNinth);
          disable(TensionNotePitch.thirteenth);
          break;
      }

      let sixthOrSeventh = this.$_sixthOrSevenths[this.$data.$_sixthOrSeventhIdx];
      switch (sixthOrSeventh) {
        case Chord.SixthOrSeventh.diminishedSeventh:
          disable(TensionNotePitch.thirteenth);
          break;
      }

      for (let tensionNotePitchIdx of this.$data.$_tensionNotePitchIdcs) {
        let tensionNotePitch = this.$_tensionNotePitches[tensionNotePitchIdx];
        switch (tensionNotePitch) {
          case TensionNotePitch.ninth:
            disable(TensionNotePitch.flatNinth);
            disable(TensionNotePitch.sharpNinth);
            break;
          case TensionNotePitch.flatNinth:
            disable(TensionNotePitch.ninth);
            break;
          case TensionNotePitch.sharpNinth:
            disable(TensionNotePitch.ninth);
            break;
          case TensionNotePitch.eleventh:
            disable(TensionNotePitch.sharpEleventh);
            break;
          case TensionNotePitch.sharpEleventh:
            disable(TensionNotePitch.eleventh);
            break;
          case TensionNotePitch.thirteenth:
            disable(TensionNotePitch.flatThirteenth);
            break;
          case TensionNotePitch.flatThirteenth:
            disable(TensionNotePitch.thirteenth);
            break;
        }
      }

      return isTensionNotePitchDisabled;
    },
  },

  methods: {
    $_loadChord() {
      if (!this.$_chordExists) return;
      this.$data.$_rootNoteSymbolIdx = this.$_rootNoteSymbols.findIndex(rootNoteSymbol => {
        return rootNoteSymbol === this.chord.root.symbol;
      });
      this.$data.$_rootNoteAccidentalSignIdx = this.$_notePitchShifts.findIndex(rootNotePitchShift => {
        return rootNotePitchShift === this.chord.root.shift;
      });
      this.$data.$_triadIdx = this.$_triads.findIndex(triad => {
        return triad === this.chord.triad;
      });
      if (this.chord.sixthOrSeventh !== null) {
        this.$data.$_sixthOrSeventhIdx = this.$_sixthOrSevenths.findIndex(sixthOrSeventh => {
          return sixthOrSeventh === this.chord.sixthOrSeventh;
        });
      } else {
        this.$data.$_sixthOrSeventhIdx = null;
      }
      this.$data.$_tensionNotePitchIdcs = this.$_tensionNotePitches
        .filter(tensionNotePitch => {
          return this.chord.tensions.has(tensionNotePitch);
        })
        .map(tensionNotePitch => {
          return this.$_tensionNotePitches.findIndex(_tensionNotePitch => {
            return _tensionNotePitch === tensionNotePitch;
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
        this.$data.$_bassNoteSymbolIdx = null;
      }
    },

    $_onChangeChordExists(chordExists) {
      if (chordExists) {
        this.$emit('change', this.$store.state.config.defaultChord.clone());
      } else {
        this.$emit('change', null);
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
      if (sixthOrSeventh === undefined) sixthOrSeventh = null;
      let newChord = new Chord(
        this.chord.root,
        this.chord.triad,
        sixthOrSeventh,
        this.chord.tensions,
        this.chord.bass,
      )
      this.$emit('change', newChord);
    },

    $_updateTensionNotePitches(tensionNotePitchIdcs) {
      let tensionNotePitches = new Set();
      for (let tensionNotePitchIdx of tensionNotePitchIdcs) {
        let tensionNotePitch = this.$_tensionNotePitches[tensionNotePitchIdx];
        tensionNotePitches.add(tensionNotePitch)
      }
      if (tensionNotePitches.has(undefined)) {
        let newChord = new Chord(
          this.chord.root,
          this.chord.triad,
          this.chord.sixthOrSeventh,
          new Set(),
          this.chord.bass,
        )
        this.$emit('change', newChord);
      } else {
        let newChord = new Chord(
          this.chord.root,
          this.chord.triad,
          this.chord.sixthOrSeventh,
          tensionNotePitches,
          this.chord.bass,
        )
        this.$emit('change', newChord);
      }
    },

    $_updateBassNoteSymbol(bassNoteSymbolIdx) {
      let bassNoteSymbol = this.$_bassNoteSymbols[bassNoteSymbolIdx];
      if (bassNoteSymbol === undefined) bassNoteSymbol = null;
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

    $_clearTensionNotePitches() {
      this.$data.$_tensionNotePitchIdcs.splice(0);
    },
  },
}
</script>
