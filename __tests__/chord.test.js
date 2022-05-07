import Chord from '../src/modules/Chord.js'
import TensionNotePitch from '../src/modules/TensionNotePitch.js'

test('equality 1', () => {
  let chord = new Chord(
    Chord.Root.c,
    Chord.Triad.major,
    Chord.SixthOrSeventh.majorSeventh,
    new Set([
      TensionNotePitch.ninth,
      TensionNotePitch.eleventh,
      TensionNotePitch.thirteenth,
    ]),
    null,
  );
  expect(chord.isEqualTo(chord)).toBe(true);
});

test('equality 2', () => {
  let chordA = new Chord(
    Chord.Root.c,
    Chord.Triad.major,
    Chord.SixthOrSeventh.majorSeventh,
    new Set([
      TensionNotePitch.ninth,
      TensionNotePitch.eleventh,
      TensionNotePitch.thirteenth,
    ]),
    null,
  );
  let chordB = new Chord(
    Chord.Root.c,
    Chord.Triad.major,
    Chord.SixthOrSeventh.majorSeventh,
    new Set([
      TensionNotePitch.thirteenth,
      TensionNotePitch.eleventh,
      TensionNotePitch.ninth,
    ]),
    null,
  );
  expect(chordA.isEqualTo(chordB)).toBe(true);
});

test('equality 3', () => {
  let chordA = new Chord(
    Chord.Root.c,
    Chord.Triad.major,
    Chord.SixthOrSeventh.majorSeventh,
    new Set([
      TensionNotePitch.ninth,
      TensionNotePitch.eleventh,
    ]),
    null,
  );
  let chordB = new Chord(
    Chord.Root.c,
    Chord.Triad.major,
    Chord.SixthOrSeventh.majorSeventh,
    new Set([
      TensionNotePitch.ninth,
    ]),
    null,
  );
  expect(chordA.isEqualTo(chordB)).toBe(false);
});

test('equality 4', () => {
  let chord = new Chord(
    Chord.Root.c,
    Chord.Triad.major,
    Chord.SixthOrSeventh.majorSeventh,
    new Set([
      TensionNotePitch.ninth,
      TensionNotePitch.eleventh,
      TensionNotePitch.thirteenth,
    ]),
    null,
  );
  expect(chord.isEqualTo(chord.clone())).toBe(true);
});
