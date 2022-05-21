import Chord from '../src/modules/Chord.js'

test('equality 1', () => {
  let chord = new Chord(
    Chord.Root.c,
    Chord.Triad.major,
    Chord.SixthOrSeventh.majorSeventh,
    new Set([
      Chord.TensionNote.ninth,
      Chord.TensionNote.sharpEleventh,
      Chord.TensionNote.thirteenth,
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
      Chord.TensionNote.ninth,
      Chord.TensionNote.sharpEleventh,
      Chord.TensionNote.thirteenth,
    ]),
    null,
  );
  let chordB = new Chord(
    Chord.Root.c,
    Chord.Triad.major,
    Chord.SixthOrSeventh.majorSeventh,
    new Set([
      Chord.TensionNote.thirteenth,
      Chord.TensionNote.sharpEleventh,
      Chord.TensionNote.ninth,
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
      Chord.TensionNote.ninth,
      Chord.TensionNote.sharpEleventh,
    ]),
    null,
  );
  let chordB = new Chord(
    Chord.Root.c,
    Chord.Triad.major,
    Chord.SixthOrSeventh.majorSeventh,
    new Set([
      Chord.TensionNote.ninth,
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
      Chord.TensionNote.ninth,
      Chord.TensionNote.sharpEleventh,
      Chord.TensionNote.thirteenth,
    ]),
    null,
  );
  expect(chord.isEqualTo(chord.clone())).toBe(true);
});
