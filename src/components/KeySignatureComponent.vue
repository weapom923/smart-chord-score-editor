<template>
  <div
    id="key-signature-component"
    v-bind:style="$_keySignatureComponentStyle"
  >
    <div
      v-for="(notePitch, keySignatureIdx) in $_keySignatureNotePitches"
      v-bind:key="keySignatureIdx"
      v-bind:style="$_keySignatureStyle(notePitch, keySignatureIdx)"
      v-bind:class="$_keySignatureClass(notePitch)"
    />
  </div>
</template>

<style scoped>
#key-signature-component {
  position: relative;
  display: flex;
  flex-direction: row;
}

.key-signature {
  display: flex;
  flex-direction: row;
  position: absolute;
  width: 5px;
}

.sharp:after {
  content: "♯";
}

.flat:after {
  content: "♭";
}

.natural:after {
  content: "♮";
}
</style>

<script>
import NotePitch from '../modules/NotePitch.js'
import NotePitchSymbol from '../modules/NotePitchSymbol.js'
import Scale from '../modules/Scale.js'
import Clef from '../modules/Clef.js'

const keySignatureWidthPx = 5;
const fontSizeRate = 1.8;

export default {
  props: {
    clef: { type: Clef, defualt: Clef.Type.treble },
    scale: { type: Scale, default: null },
  },

  data() {
    return {
      $_numeratorElement: null,
      $_denominatorElement: null,
      $_beatComponentContainerWidthPx: null,
    };
  },

  computed: {
    $_staffLineStepPx() {
      return this.$store.state.config.staffLineStepPx;
    },

    $_keySignatureFontSize() {
      return this.$_staffLineStepPx * fontSizeRate;
    },

    $_keySignatureComponentStyle() {
      let keySignatureComponentStyle = new Object();
      if (this.$_keySignatureNotePitches.length > 0) {
        keySignatureComponentStyle.marginRight = String(10) + 'px';
      }
      if (this.clef.type == Clef.Type.bass) {
        keySignatureComponentStyle.marginTop = String(this.$_staffLineStepPx) + 'px';
      }
      keySignatureComponentStyle.width = String(keySignatureWidthPx * this.$_numKeySignatures) + 'px';
      return keySignatureComponentStyle;
    },

    $_keySignatureNotePitches() {
      let keySignatureNotePitches = new Array();
      if (this.scale !== null) {
        if (this.scale.numSharps > 0) {
          if (this.scale.numSharps >= 1) keySignatureNotePitches.push(NotePitch.fSharp);
          if (this.scale.numSharps >= 2) keySignatureNotePitches.push(NotePitch.cSharp);
          if (this.scale.numSharps >= 3) keySignatureNotePitches.push(NotePitch.gSharp);
          if (this.scale.numSharps >= 4) keySignatureNotePitches.push(NotePitch.dSharp);
          if (this.scale.numSharps >= 5) keySignatureNotePitches.push(NotePitch.aSharp);
          if (this.scale.numSharps >= 6) keySignatureNotePitches.push(NotePitch.eSharp);
          if (this.scale.numSharps >= 7) keySignatureNotePitches.push(NotePitch.bSharp);
        } else if (this.scale.numFlats > 0) {
          if (this.scale.numFlats >= 1) keySignatureNotePitches.push(NotePitch.bFlat);
          if (this.scale.numFlats >= 2) keySignatureNotePitches.push(NotePitch.eFlat);
          if (this.scale.numFlats >= 3) keySignatureNotePitches.push(NotePitch.aFlat);
          if (this.scale.numFlats >= 4) keySignatureNotePitches.push(NotePitch.dFlat);
          if (this.scale.numFlats >= 5) keySignatureNotePitches.push(NotePitch.gFlat);
          if (this.scale.numFlats >= 6) keySignatureNotePitches.push(NotePitch.cFlat);
          if (this.scale.numFlats >= 7) keySignatureNotePitches.push(NotePitch.fFlat);
        }
      }
      return keySignatureNotePitches;
    },

    $_numKeySignatures() {
      return this.$_keySignatureNotePitches.length;
    },
  },

  methods: {
    $_keySignatureStyle(notePitch, keySignatureIdx) {
      return {
        left: String(keySignatureIdx * keySignatureWidthPx) + 'px',
        top: String(getTopOffsetPx(this.$_staffLineStepPx, notePitch) - (this.$_keySignatureFontSize / 2)) + 'px',
        fontSize: String(this.$_keySignatureFontSize) + 'px',
        lineHeight: String(this.$_keySignatureFontSize) + 'px',
        height: String(this.$_keySignatureFontSize) + 'px',
      }

      function getTopOffsetPx(staffLineStepPx, notePitch) {
        if (notePitch.isSharp) {
          switch (notePitch.symbol) {
          case NotePitchSymbol.c:
            return -staffLineStepPx * 1 / 2;
          case NotePitchSymbol.d:
            return -staffLineStepPx * 2 / 2;
          case NotePitchSymbol.e:
            return -staffLineStepPx * 3 / 2;
          case NotePitchSymbol.f:
            return -staffLineStepPx * 4 / 2;
          case NotePitchSymbol.g:
            return -staffLineStepPx * 5 / 2;
          case NotePitchSymbol.a:
            return staffLineStepPx * 1 / 2;
          case NotePitchSymbol.b:
          default:
            break;
          }
        } else if (notePitch.isFlat) {
          switch (notePitch.symbol) {
          case NotePitchSymbol.e:
            return -staffLineStepPx * 3 / 2;
          case NotePitchSymbol.d:
            return -staffLineStepPx * 2 / 2;
          case NotePitchSymbol.c:
            return -staffLineStepPx * 1 / 2;
          case NotePitchSymbol.a:
            return staffLineStepPx * 1 / 2;
          case NotePitchSymbol.g:
            return staffLineStepPx * 2 / 2;
          case NotePitchSymbol.f:
            return staffLineStepPx * 3 / 2;
          case NotePitchSymbol.b:
          default:
            break;
          }
        }
        return 0;
      }
    },

    $_keySignatureClass(notePitch) {
      let keySignatureClass = new Array();
      keySignatureClass.push('key-signature');
      if (notePitch.isSharp) keySignatureClass.push('sharp');
      if (notePitch.isFlat) keySignatureClass.push('flat');
      return keySignatureClass;
    },
  },
}
</script>