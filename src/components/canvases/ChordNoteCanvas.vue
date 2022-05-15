<template>
  <canvas
    id="note-canvas-container"
    v-bind:style="$_style"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<style src="./styles/note_canvas.css">
</style>

<script>
import CanvasBase from './mixins/CanvasBase.js'
import Note from '../../modules/Note.js'
import NoteValue from '../../modules/NoteValue.js'
import utils from '../../modules/utils.js'

const noteStemLegnthRate = 3.5;
const noteFlagWidthRate = 2;
const noteHeadHorizontalOffsetPx = 0.5;
const noteHeadSlideWidthPx = 8;
const noteHeadWidthPx = 8;
const noteDotRadiusRate = 0.15;
const noteDotMarginPx = 2;

export default {
  mixins: [
    CanvasBase,
  ],

  watch: {
    note: {
      handler() {
        this.$_setDirty(true);
        this.$emit('width-update', this.$_noteWidthPx);
        this.$emit(
          'tie-point-update',
          {
            tieStartPointOffset: this.$_tieStartPointOffset,
            tieEndPointOffset: this.$_tieEndPointOffset,
          },
        );
      },
      deep: true,
      immediate: true,
    },

    invertStemDirection() { this.$_setDirty(true) },

    $_noteWidthPx(newCanvasWidthPx) {
      this.$_setCanvasWidthPx(newCanvasWidthPx);
      this.$emit('width-update', newCanvasWidthPx);
      this.$emit(
        'tie-point-update',
        {
          tieStartPointOffset: this.$_tieStartPointOffset,
          tieEndPointOffset: this.$_tieEndPointOffset,
        },
      );
    },

    $_noteHeightPx(newCanvasHeightPx) {
      this.$_setCanvasHeightPx(newCanvasHeightPx);
    },
  },

  mounted() {
    this.$_setCanvasWidthPx(this.$_noteWidthPx);
    this.$_setCanvasHeightPx(this.$_noteHeightPx);
    this.$emit('element-update', this.$el);
    this.$emit('width-update', this.$_noteWidthPx);
    this.$emit(
      'tie-point-update',
      {
        tieStartPointOffset: this.$_tieStartPointOffset,
        tieEndPointOffset: this.$_tieEndPointOffset,
      },
    );
  },

  props: {
    note: { type: Note },
    invertStemDirection: { type: Boolean, default: false },
  },

  computed: {
    $_isNoteHeadOutlined() { return this.$_undottedNoteValue.isGreaterThanOrEqualTo(NoteValue.divisible.half) },
    $_isDotted()           { return this.note.value.isDottedOfDivisible() },
    $_undottedNoteValue()  { return (this.$_isDotted)? this.note.value.undot() : this.note.value },
    $_hasNoteStem()        { return this.$_undottedNoteValue.isLessThanOrEqualTo(NoteValue.divisible.half) },
    $_noteStemLengthPx() {
      if (this.$_numNoteFlags === 0) {
        return this.$_staffLineStepPx * noteStemLegnthRate;
      } else {
        return this.$_staffLineStepPx * (noteStemLegnthRate + (this.$_numNoteFlags - 1));
      }
    },
    $_noteStemHorizontalOffsetPx() {
      if (this.invertStemDirection) {
        return noteHeadHorizontalOffsetPx;
      } else {
        return noteHeadHorizontalOffsetPx + noteHeadWidthPx + noteHeadSlideWidthPx;
      }
    },
    $_noteStemBeginPointVerticalOffsetPx() {
      if (this.invertStemDirection) {
        return this.$_noteHeadHeightPx;
      } else {
        return this.$_noteStemLengthPx;
      }
    },
    $_noteStemEndPointVerticalOffsetPx() {
      if (this.invertStemDirection) {
        return this.$_noteStemBeginPointVerticalOffsetPx + this.$_noteStemLengthPx;
      } else {
        return this.$_noteStemBeginPointVerticalOffsetPx - this.$_noteStemLengthPx;
      }
    },
    $_noteDotRadiusPx() { return this.$_staffLineStepPx * noteDotRadiusRate; },
    $_hasNoteFlag() { return (this.$_numNoteFlags > 0) },
    $_noteFlagWidthPx() { return this.$_staffLineStepPx * noteFlagWidthRate },
    $_numNoteFlags() {
      if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.eighth)) return 1;
      if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.sixteenth)) return 2;
      if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.thirtySecond)) return 3;
      if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.sixtyFourth)) return 4;
      return 0;
    },
    $_noteHeadVerticalOffsetPx()   {
      if (!this.invertStemDirection && this.$_hasNoteStem) {
        return this.$_noteHeadHeightPx + this.$_noteStemLengthPx;
      } else {
        return this.$_noteHeadHeightPx;
      }
    },
    $_noteHeadHeightPx() {
      return this.$_staffLineStepPx * 2;
    },
    $_noteWidthPx() {
      if (this.$_isDotted) {
        let noteBaseWidthPx = noteHeadHorizontalOffsetPx + noteHeadWidthPx + noteHeadSlideWidthPx;
        let noteExpandedWidthPx = utils.max(this.$_noteDotRadiusPx * 2 + noteDotMarginPx, this.$_noteFlagWidthPx);
        return noteBaseWidthPx + noteExpandedWidthPx;
      } else {
        let noteBaseWidthPx = noteHeadHorizontalOffsetPx;
        let noteExpandedWidthPx = utils.max(noteHeadWidthPx + noteHeadSlideWidthPx, this.$_noteFlagWidthPx);
        return noteBaseWidthPx + noteExpandedWidthPx;
      }
    },
    $_noteHeightPx() {
      if (this.$_hasNoteStem) {
        return this.$_noteHeadHeightPx + this.$_noteStemLengthPx;
      } else {
        return this.$_noteHeadHeightPx;
      }
    },
    $_tieStartPointOffset() {
      return new DOMPoint(
        noteHeadHorizontalOffsetPx + noteHeadWidthPx + noteHeadSlideWidthPx,
        -(this.$_noteHeadHeightPx / 2),
      );
    },
    $_tieEndPointOffset() {
      return new DOMPoint(
        noteHeadHorizontalOffsetPx + noteHeadSlideWidthPx,
        -(this.$_noteHeadHeightPx / 2),
      );
    },
    $_style() {
      if (this.$_hasNoteStem && !this.invertStemDirection) {
        return { marginTop: String(-((this.$_noteHeadHeightPx / 2) + this.$_noteStemLengthPx)) + 'px' };
      } else {
        return { marginTop: String(-this.$_noteHeadHeightPx / 2) + 'px' };
      }
    },
  },

  methods: {
    /* public */
    draw() {
      this.$_draw(canvasElement => {
        let canvas = canvasElement.getContext('2d');
        if (this.$_isNoteHeadOutlined) {
          drawChordNoteHeadOutline(this, canvas);
        } else {
          drawChordNoteHead(this, canvas);
        }
        if (this.$_isDotted) {
          drawNoteDot(this, canvas);
        }
        if (this.$_hasNoteStem) {
          drawNoteStem(this, canvas);
          if (this.$_hasNoteFlag) {
            drawNoteFlag(this, canvas);
          }
        }
      });

      function drawChordNoteHeadOutline(self, canvas) {
        canvas.strokeStyle = self.color.getStyleString();
        canvas.lineWidth = 2;
        canvas.beginPath();
        canvas.moveTo(noteHeadHorizontalOffsetPx + noteHeadWidthPx, self.$_noteHeadVerticalOffsetPx - (self.$_noteHeadHeightPx));
        canvas.lineTo(noteHeadHorizontalOffsetPx, self.$_noteHeadVerticalOffsetPx);
        canvas.stroke();
        canvas.beginPath();
        canvas.moveTo(noteHeadHorizontalOffsetPx + noteHeadWidthPx + noteHeadSlideWidthPx, self.$_noteHeadVerticalOffsetPx - (self.$_noteHeadHeightPx));
        canvas.lineTo(noteHeadHorizontalOffsetPx + noteHeadSlideWidthPx, self.$_noteHeadVerticalOffsetPx);
        canvas.stroke();
        canvas.beginPath();
        canvas.moveTo(noteHeadHorizontalOffsetPx + noteHeadSlideWidthPx, self.$_noteHeadVerticalOffsetPx - (self.$_noteHeadHeightPx - 1));
        canvas.lineTo(noteHeadHorizontalOffsetPx + noteHeadWidthPx + noteHeadSlideWidthPx, self.$_noteHeadVerticalOffsetPx - (self.$_noteHeadHeightPx - 1));
        canvas.stroke();
        canvas.beginPath();
        canvas.moveTo(noteHeadHorizontalOffsetPx, self.$_noteHeadVerticalOffsetPx);
        canvas.lineTo(noteHeadHorizontalOffsetPx + noteHeadWidthPx, self.$_noteHeadVerticalOffsetPx);
        canvas.stroke();
      }

      function drawChordNoteHead(self, canvas) {
        canvas.beginPath();
        canvas.fillStyle = self.color.getStyleString();
        canvas.lineWidth = 1;
        canvas.moveTo(noteHeadHorizontalOffsetPx + noteHeadSlideWidthPx, self.$_noteHeadVerticalOffsetPx - self.$_noteHeadHeightPx);
        canvas.lineTo(noteHeadHorizontalOffsetPx + noteHeadWidthPx + noteHeadSlideWidthPx, self.$_noteHeadVerticalOffsetPx - self.$_noteHeadHeightPx);
        canvas.lineTo(noteHeadHorizontalOffsetPx + noteHeadWidthPx, self.$_noteHeadVerticalOffsetPx);
        canvas.lineTo(noteHeadHorizontalOffsetPx, self.$_noteHeadVerticalOffsetPx);
        canvas.fill();
      }

      function drawNoteDot(self, canvas) {
        canvas.beginPath();
        canvas.fillStyle = self.color.getStyleString();
        canvas.lineWidth = 1;
        canvas.arc(
          noteHeadHorizontalOffsetPx + noteHeadWidthPx + noteHeadSlideWidthPx + noteDotMarginPx + self.$_noteDotRadiusPx,
          self.$_noteHeadVerticalOffsetPx - (self.$_staffLineStepPx / 2),
          self.$_noteDotRadiusPx, 0, 2 * Math.PI);
        canvas.fill();
      }

      function drawNoteStem(self, canvas) {
        canvas.strokeStyle = self.color.getStyleString();
        canvas.lineWidth = 1;
        canvas.beginPath();
        canvas.moveTo(self.$_noteStemHorizontalOffsetPx, self.$_noteStemBeginPointVerticalOffsetPx);
        canvas.lineTo(self.$_noteStemHorizontalOffsetPx, self.$_noteStemEndPointVerticalOffsetPx);
        canvas.stroke();
      }

      function drawNoteFlag(self, canvas) {
        let noteFlagDirection = (self.invertStemDirection)? -1: 1;
        canvas.strokeStyle = self.color.getStyleString();
        canvas.lineWidth = 2;
        for (let noteFlagIdx = 0; noteFlagIdx < self.$_numNoteFlags; ++noteFlagIdx) {
          let currentNoteFlagBeginVerticalOffsetPx = self.$_noteStemEndPointVerticalOffsetPx + noteFlagIdx * noteFlagDirection * self.$_staffLineStepPx;
          canvas.beginPath();
          canvas.moveTo(
            self.$_noteStemHorizontalOffsetPx,
            currentNoteFlagBeginVerticalOffsetPx,
          );
          canvas.lineTo(
            self.$_noteStemHorizontalOffsetPx + self.$_noteFlagWidthPx,
            currentNoteFlagBeginVerticalOffsetPx + noteFlagDirection * self.$_noteFlagWidthPx,
          );
          canvas.stroke();
        }
      }
    },
  }
}
</script>