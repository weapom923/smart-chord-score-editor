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
import NoteValue from '../../modules/NoteValue.js'
import NotePitch from '../../modules/NotePitch.js'
import utils from '../../modules/utils.js'

const noteDotRadiusRate = 0.15;
const noteDotMarginPx = 6;
const wholeAndHalfRestNoteWidthPx = 16;
const wholeAndHalfRestNoteHeightRate = 0.4;

export default {
  mixins: [
    CanvasBase,
  ],

  watch: {
    noteValue: {
      handler() { this.$_setDirty(true) },
      deep: true,
    },

    restNotePitch: {
      handler() { this.$_setDirty(true) },
      deep: true,
    },

    $_noteWidthPx(newCanvasWidthPx) {
      this.$_setCanvasWidthPx(newCanvasWidthPx);
      this.$emit('width-update', newCanvasWidthPx);
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
  },

  props: {
    noteValue: { type: NoteValue },
    restNotePitch: { type: NotePitch, default: null },
  },

  computed: {
    $_isDotted()          { return this.noteValue.isDottedOfDivisible() },
    $_undottedNoteValue() { return (this.$_isDotted)? this.noteValue.undot() : this.noteValue },
    $_anchorHorizontalOffsetPx() {
      if (this.$_undottedNoteValue.isGreaterThanOrEqualTo(NoteValue.divisible.quarter)) {
        return 0;
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.eighth)) {
        return this.$_staffLineStepPx * 0.6;
      } else {
        return this.$_staffLineStepPx * 0.9;
      }
    },
    $_anchorVerticalOffsetPx() {
      if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.whole)) {
        return 0;
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.half)) {
        return this.$_noteHeightPx;
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.quarter)) {
        return this.$_staffLineStepPx * 1.5;
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.eighth)) {
        return this.$_staffLineStepPx * 1;
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.sixteenth)) {
        return this.$_staffLineStepPx * 1;
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.thirtySecond)) {
        return this.$_staffLineStepPx * 1.8;
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.sixtyFourth)) {
        return this.$_staffLineStepPx * 2.6;
      } else {
        return null;
      }
    },
    $_noteWithoutDotWidthPx() {
      if (this.$_undottedNoteValue.isGreaterThanOrEqualTo(NoteValue.divisible.half)) {
        return wholeAndHalfRestNoteWidthPx;
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.quarter)) {
        return this.$_staffLineStepPx;
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.eighth)) {
        return this.$_staffLineStepPx * 1;
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.sixteenth)) {
        return this.$_staffLineStepPx * 1.4;
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.thirtySecond)) {
        return this.$_staffLineStepPx * 1.8;
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.sixtyFourth)) {
        return this.$_staffLineStepPx * 2.2;
      } else {
        return null;
      }
    },
    $_noteWidthPx() {
      if (this.$_isDotted) {
        if (this.$_undottedNoteValue.isGreaterThanOrEqualTo(NoteValue.divisible.quarter)) {
          return this.$_noteWithoutDotWidthPx + noteDotMarginPx + this.$_noteDotRadiusPx * 2;
        } else {
          return utils.max(
            this.$_noteWithoutDotWidthPx,
            this.$_anchorHorizontalOffsetPx + noteDotMarginPx + this.$_noteDotRadiusPx * 2,
          )
        }
      } else {
        return this.$_noteWithoutDotWidthPx;
      }
    },
    $_noteHeightWithoutDotPx() {
      if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.whole)) {
        return this.$_staffLineStepPx * wholeAndHalfRestNoteHeightRate;
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.half)) {
        return this.$_staffLineStepPx * wholeAndHalfRestNoteHeightRate;
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.quarter)) {
        return this.$_staffLineStepPx * 3;
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.eighth)) {
        return this.$_staffLineStepPx * 1.8;
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.sixteenth)) {
        return this.$_staffLineStepPx * 1.8;
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.thirtySecond)) {
        return this.$_staffLineStepPx * 2.6;
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.sixtyFourth)) {
        return this.$_staffLineStepPx * 3.4;
      } else {
        return null;
      }
    },
    $_noteHeightPx() {
      if (this.$_isDotted) {
        if (this.$_undottedNoteValue.isGreaterThanOrEqualTo(NoteValue.divisible.half)) {
          return utils.max(
            (this.$_staffLineStepPx / 2) + this.$_noteDotRadiusPx,
            this.$_noteHeightWithoutDotPx,
          );
        } else {
          return this.$_noteHeightWithoutDotPx;
        }
      } else {
        return this.$_noteHeightWithoutDotPx;
      }
    },
    $_style() {
      if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.whole)) {
        return { marginTop: String(-this.$_staffLineStepPx) + 'px' };
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.half)) {
        return { marginTop: String(-(this.$_noteHeightPx)) + 'px' };
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.quarter)) {
        return { marginTop: String(-(this.$_staffLineStepPx * 1.5)) + 'px' };
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.eighth)) {
        return { marginTop: String(-(this.$_staffLineStepPx * 1)) + 'px' };
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.sixteenth)) {
        return { marginTop: String(-(this.$_staffLineStepPx * 1)) + 'px' };
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.thirtySecond)) {
        return { marginTop: String(-(this.$_staffLineStepPx * 1.8)) + 'px' };
      } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.sixtyFourth)) {
        return { marginTop: String(-(this.$_staffLineStepPx * 2.6)) + 'px' };
      } else {
        return null;
      }
    },
    $_restNoteCircleRadius() { return this.$_staffLineStepPx * 0.2 },
    $_noteDotRadiusPx() { return this.$_staffLineStepPx * noteDotRadiusRate; },
  },

  methods: {
    /* public */
    draw() {
      this.$_draw(canvasElement => {
        let canvas = canvasElement.getContext('2d');
        if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.whole)) {
          drawWholeRestNote(this, canvas);
        } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.half)) {
          drawHalfRestNote(this, canvas);
        } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.quarter)) {
          drawQuarterRestNote(this, canvas);
        } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.eighth)) {
          drawEighthRestNote(this, canvas);
        } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.sixteenth)) {
          drawSixteenthRestNote(this, canvas);
        } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.thirtySecond)) {
          drawThirtySecondRestNote(this, canvas);
        } else if (this.$_undottedNoteValue.isEqualTo(NoteValue.divisible.sixtyFourth)) {
          drawSixtyFourthRestNote(this, canvas);
        }
        if (this.$_isDotted) {
          if (this.$_undottedNoteValue.isGreaterThanOrEqualTo(NoteValue.divisible.whole)) {
            drawNoteDot(
              this, canvas,
              this.$_noteWithoutDotWidthPx + noteDotMarginPx + this.$_noteDotRadiusPx,
              this.$_noteHeightWithoutDotPx,
            );
          } else if (this.$_undottedNoteValue.isGreaterThanOrEqualTo(NoteValue.divisible.half)) {
            drawNoteDot(
              this, canvas,
              this.$_noteWithoutDotWidthPx + noteDotMarginPx + this.$_noteDotRadiusPx,
              this.$_noteDotRadiusPx,
            );
          } else if (this.$_undottedNoteValue.isGreaterThanOrEqualTo(NoteValue.divisible.quarter)) {
            drawNoteDot(
              this, canvas,
              this.$_noteWithoutDotWidthPx + noteDotMarginPx + this.$_noteDotRadiusPx,
              this.$_anchorVerticalOffsetPx + (this.$_staffLineStepPx / 2),
            );
          } else {
            drawNoteDot(
              this, canvas,
              this.$_anchorHorizontalOffsetPx + noteDotMarginPx + this.$_noteDotRadiusPx,
              this.$_anchorVerticalOffsetPx + (this.$_staffLineStepPx / 2),
            );
          }
        }
      });

      function drawWholeRestNote(self, canvas) {
        let anchorHorizontalOffsetPx = self.$_anchorHorizontalOffsetPx;
        let anchorVerticalOffsetPx = self.$_anchorVerticalOffsetPx;
        canvas.fillStyle = self.color.getStyleString();
        canvas.lineWidth = 1;
        canvas.beginPath();
        canvas.rect(
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx,
          wholeAndHalfRestNoteWidthPx,
          self.$_staffLineStepPx * wholeAndHalfRestNoteHeightRate,
        );
        canvas.fill();
      }

      function drawHalfRestNote(self, canvas) {
        let anchorHorizontalOffsetPx = self.$_anchorHorizontalOffsetPx;
        let anchorVerticalOffsetPx = self.$_anchorVerticalOffsetPx;
        canvas.fillStyle = self.color.getStyleString();
        canvas.lineWidth = 1;
        canvas.beginPath();
        canvas.rect(
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx - self.$_noteHeightWithoutDotPx,
          wholeAndHalfRestNoteWidthPx,
          self.$_noteHeightWithoutDotPx,
        );
        canvas.fill();
      }

      function drawQuarterRestNote(self, canvas) {
        let anchorHorizontalOffsetPx = self.$_anchorHorizontalOffsetPx;
        let anchorVerticalOffsetPx = self.$_anchorVerticalOffsetPx;
        let staffLineStepPx = self.$_staffLineStepPx;
        canvas.fillStyle = self.color.getStyleString();
        canvas.lineWidth = 1;
        canvas.beginPath();
        canvas.moveTo(
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx,
        );
        canvas.lineTo(
          anchorHorizontalOffsetPx + staffLineStepPx,
          anchorVerticalOffsetPx + staffLineStepPx,
        );
        canvas.bezierCurveTo(
          anchorHorizontalOffsetPx - staffLineStepPx * 0.1,
          anchorVerticalOffsetPx,
          anchorHorizontalOffsetPx - staffLineStepPx * 0.1,
          anchorVerticalOffsetPx + staffLineStepPx * 1.5,
          anchorHorizontalOffsetPx + staffLineStepPx * 0.5,
          anchorVerticalOffsetPx + staffLineStepPx * 1.5,
        );
        canvas.bezierCurveTo(
          anchorHorizontalOffsetPx - staffLineStepPx * 0.1,
          anchorVerticalOffsetPx + staffLineStepPx * 1.25,
          anchorHorizontalOffsetPx + staffLineStepPx * 0.5,
          anchorVerticalOffsetPx + staffLineStepPx * 0.5,
          anchorHorizontalOffsetPx + staffLineStepPx,
          anchorVerticalOffsetPx + staffLineStepPx,
        );
        canvas.quadraticCurveTo(
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx,
          anchorHorizontalOffsetPx + staffLineStepPx,
          anchorVerticalOffsetPx - staffLineStepPx * 0.5,
        );
        canvas.lineTo(
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx - staffLineStepPx * 1.5,
        );
        canvas.quadraticCurveTo(
          anchorHorizontalOffsetPx + staffLineStepPx,
          anchorVerticalOffsetPx - staffLineStepPx * 0.5,
          anchorHorizontalOffsetPx,
          anchorVerticalOffsetPx,
        );
        canvas.fill();
      }

      function drawEighthRestNote(self, canvas) {
        let anchorHorizontalOffsetPx = self.$_anchorHorizontalOffsetPx;
        let anchorVerticalOffsetPx = self.$_anchorVerticalOffsetPx;
        let staffLineStepPx = self.$_staffLineStepPx;
        canvas.strokeStyle = self.color.getStyleString();
        canvas.lineWidth = 1;
        canvas.beginPath();
        canvas.moveTo(
          anchorHorizontalOffsetPx - staffLineStepPx * 0.4,
          anchorVerticalOffsetPx + staffLineStepPx * 0.8,
        );
        canvas.lineTo(
          anchorHorizontalOffsetPx + staffLineStepPx * 0.4,
          anchorVerticalOffsetPx - staffLineStepPx * 0.8,
        );
        canvas.stroke();
        self.$_drawRestNoteCircle(
          canvas,
          anchorHorizontalOffsetPx + staffLineStepPx * 0.4,
          anchorVerticalOffsetPx - staffLineStepPx * 0.8,
        );
      }

      function drawSixteenthRestNote(self, canvas) {
        let anchorHorizontalOffsetPx = self.$_anchorHorizontalOffsetPx;
        let anchorVerticalOffsetPx = self.$_anchorVerticalOffsetPx;
        let staffLineStepPx = self.$_staffLineStepPx;
        canvas.strokeStyle = self.color.getStyleString();
        canvas.lineWidth = 1;
        canvas.beginPath();
        canvas.moveTo(
          anchorHorizontalOffsetPx - staffLineStepPx * 0.4,
          anchorVerticalOffsetPx + staffLineStepPx * 0.8,
        );
        canvas.lineTo(
          anchorHorizontalOffsetPx + staffLineStepPx * 0.4,
          anchorVerticalOffsetPx - staffLineStepPx * 0.8,
        );
        canvas.stroke();
        self.$_drawRestNoteCircle(
          canvas,
          anchorHorizontalOffsetPx + staffLineStepPx * 0.4,
          anchorVerticalOffsetPx - staffLineStepPx * 0.8,
        );
        self.$_drawRestNoteCircle(
          canvas,
          anchorHorizontalOffsetPx + staffLineStepPx * 0.1,
          anchorVerticalOffsetPx - staffLineStepPx * 0.2,
        );
      }

      function drawThirtySecondRestNote(self, canvas) {
        let anchorHorizontalOffsetPx = self.$_anchorHorizontalOffsetPx;
        let anchorVerticalOffsetPx = self.$_anchorVerticalOffsetPx;
        let staffLineStepPx = self.$_staffLineStepPx;
        canvas.strokeStyle = self.color.getStyleString();
        canvas.lineWidth = 1;
        canvas.beginPath();
        canvas.moveTo(
          anchorHorizontalOffsetPx - staffLineStepPx * 0.4,
          anchorVerticalOffsetPx + staffLineStepPx * 0.8,
        );
        canvas.lineTo(
          anchorHorizontalOffsetPx + staffLineStepPx * 0.7,
          anchorVerticalOffsetPx - staffLineStepPx * 1.4,
        );
        canvas.stroke();
        self.$_drawRestNoteCircle(
          canvas,
          anchorHorizontalOffsetPx + staffLineStepPx * 0.7,
          anchorVerticalOffsetPx - staffLineStepPx * 1.4,
        );
        self.$_drawRestNoteCircle(
          canvas,
          anchorHorizontalOffsetPx + staffLineStepPx * 0.4,
          anchorVerticalOffsetPx - staffLineStepPx * 0.8,
        );
        self.$_drawRestNoteCircle(
          canvas,
          anchorHorizontalOffsetPx + staffLineStepPx * 0.1,
          anchorVerticalOffsetPx - staffLineStepPx * 0.2,
        );
      }

      function drawSixtyFourthRestNote(self, canvas) {
        let anchorHorizontalOffsetPx = self.$_anchorHorizontalOffsetPx;
        let anchorVerticalOffsetPx = self.$_anchorVerticalOffsetPx;
        let staffLineStepPx = self.$_staffLineStepPx;
        canvas.strokeStyle = self.color.getStyleString();
        canvas.lineWidth = 1;
        canvas.beginPath();
        canvas.moveTo(
          anchorHorizontalOffsetPx - staffLineStepPx * 0.4,
          anchorVerticalOffsetPx + staffLineStepPx * 0.8,
        );
        canvas.lineTo(
          anchorHorizontalOffsetPx + staffLineStepPx * 1,
          anchorVerticalOffsetPx - staffLineStepPx * 2,
        );
        canvas.stroke();
        self.$_drawRestNoteCircle(
          canvas,
          anchorHorizontalOffsetPx + staffLineStepPx * 1,
          anchorVerticalOffsetPx - staffLineStepPx * 2,
        );
        self.$_drawRestNoteCircle(
          canvas,
          anchorHorizontalOffsetPx + staffLineStepPx * 0.7,
          anchorVerticalOffsetPx - staffLineStepPx * 1.4,
        );
        self.$_drawRestNoteCircle(
          canvas,
          anchorHorizontalOffsetPx + staffLineStepPx * 0.4,
          anchorVerticalOffsetPx - staffLineStepPx * 0.8,
        );
        self.$_drawRestNoteCircle(
          canvas,
          anchorHorizontalOffsetPx + staffLineStepPx * 0.1,
          anchorVerticalOffsetPx - staffLineStepPx * 0.2,
        );
      }

      function drawNoteDot(self, canvas, dotHorizontalOffsetPx, dotVerticalOffsetPx) {
        canvas.beginPath();
        canvas.fillStyle = self.color.getStyleString();
        canvas.lineWidth = 1;
        canvas.arc(
          dotHorizontalOffsetPx,
          dotVerticalOffsetPx,
          self.$_noteDotRadiusPx, 0, 2 * Math.PI);
        canvas.fill();
      }
    },

    /* private */
    $_drawRestNoteCircle(canvas, beginHorizontalOffsetPx, beginVerticalOffsetPx) {
      let staffLineStepPx = this.$_staffLineStepPx;
      canvas.fillStyle = this.color.getStyleString();
      canvas.strokeStyle = this.color.getStyleString();
      canvas.lineWidth = 1;
      canvas.beginPath();
      canvas.moveTo(
        beginHorizontalOffsetPx,
        beginVerticalOffsetPx,
      );
      canvas.quadraticCurveTo(
        beginHorizontalOffsetPx - staffLineStepPx * 0.6,
        beginVerticalOffsetPx + staffLineStepPx * 0.9,
        beginHorizontalOffsetPx - staffLineStepPx * 0.9,
        beginVerticalOffsetPx + staffLineStepPx * 0.2,
      );
      canvas.stroke();
      canvas.beginPath();
      canvas.arc(
        beginHorizontalOffsetPx - staffLineStepPx * 0.7,
        beginVerticalOffsetPx + staffLineStepPx * 0.2,
        this.$_restNoteCircleRadius, 0, 2 * Math.PI);
      canvas.fill();
    },
  },
}
</script>