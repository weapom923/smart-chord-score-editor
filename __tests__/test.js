import ScoreTextParser from '../src/modules/ScoreTextParser.js'
import ChordTextParser from '../src/modules/ChordTextParser.js'
import Chord from '../src/modules/Chord.js'
import Bar from '../src/modules/Bar.js'
import BarRepeatEnding from '../src/modules/BarRepeatEnding.js'
import BarBreak from '../src/modules/BarBreak.js'
import BarLine from '../src/modules/BarLine.js'
import Clef from '../src/modules/Clef.js'
import PartInBar from '../src/modules/PartInBar.js'
import Score from '../src/modules/Score.js'
import Section from '../src/modules/Section.js'
import Scale from '../src/modules/Scale.js'
import NotePitch from '../src/modules/NotePitch.js'
import NoteValue from '../src/modules/NoteValue.js'
import TensionNotePitch from '../src/modules/TensionNotePitch.js'
import Note from '../src/modules/Note.js'

test('scale 1', () => {
  let scale = new Scale(NotePitch.c, Scale.Type.major);
  expect(scale.tonicNotePitch.symbol).toStrictEqual(NotePitch.c.symbol);
  expect(scale.notePitches.map(notePitch => notePitch.symbol)).toStrictEqual([
    NotePitch.c.symbol,
    NotePitch.d.symbol,
    NotePitch.e.symbol,
    NotePitch.f.symbol,
    NotePitch.g.symbol,
    NotePitch.a.symbol,
    NotePitch.b.symbol,
  ]);
});

test('scale 2', () => {
  let scale = new Scale(NotePitch.eSharp, Scale.Type.major);
  expect(scale.tonicNotePitch.symbol).toStrictEqual(NotePitch.f.symbol);
  expect(scale.notePitches.map(notePitch => notePitch.symbol)).toStrictEqual([
    NotePitch.f.symbol,
    NotePitch.g.symbol,
    NotePitch.a.symbol,
    NotePitch.bFlat.symbol,
    NotePitch.c.symbol,
    NotePitch.d.symbol,
    NotePitch.e.symbol,
  ]);
});

test('split into divisible note values 1', () => {
  expect(
    NoteValue.divisible.sixteenth.multiply(12).splitIntoDivisibleNoteValues(NoteValue.divisible.sixteenth.multiply(3), NoteValue.divisible.half)
  ).toStrictEqual([ NoteValue.divisible.sixteenth, NoteValue.divisible.quarter, NoteValue.divisible.quarter, NoteValue.divisible.eighth, NoteValue.divisible.sixteenth ]);
});

test('split into divisible note values 2', () => {
  expect(
    NoteValue.divisible.sixteenth.multiply(9).splitIntoDivisibleNoteValues(NoteValue.divisible.sixteenth.multiply(7), NoteValue.divisible.half)
  ).toStrictEqual([ NoteValue.divisible.sixteenth, NoteValue.divisible.half ]);
});

test('split into divisible note values 3', () => {
  expect(
    NoteValue.divisible.sixteenth.multiply(9).splitIntoDivisibleNoteValues(NoteValue.divisible.sixteenth.multiply(7), NoteValue.divisible.quarter)
  ).toStrictEqual([ NoteValue.divisible.sixteenth, NoteValue.divisible.half ]);
});

test('split into divisible note values 4', () => {
  expect(
    NoteValue.divisible.sixteenth.multiply(13).splitIntoDivisibleNoteValues(NoteValue.divisible.sixteenth, NoteValue.divisible.quarter)
  ).toStrictEqual([ NoteValue.divisible.eighth.dot(), NoteValue.divisible.quarter, NoteValue.divisible.quarter.dot() ]);
});

test('split into divisible note values 5', () => {
  expect(
    NoteValue.divisible.sixteenth.multiply(14).splitIntoDivisibleNoteValues(NoteValue.divisible.sixteenth, NoteValue.divisible.quarter)
  ).toStrictEqual([ NoteValue.divisible.eighth.dot(), NoteValue.divisible.quarter, NoteValue.divisible.quarter, NoteValue.divisible.eighth.dot() ]);
});

test('split into divisible note values 6', () => {
  expect(
    NoteValue.divisible.sixteenth.multiply(16).splitIntoDivisibleNoteValues(new NoteValue(0), NoteValue.divisible.quarter)
  ).toStrictEqual([ NoteValue.divisible.whole ]);
});

test('split into divisible note values 7', () => {
  expect(
    NoteValue.divisible.eighth.multiply(7).splitIntoDivisibleNoteValues(new NoteValue(0), NoteValue.divisible.half)
  ).toStrictEqual([ NoteValue.divisible.half, NoteValue.divisible.quarter.dot() ]);
});

test('split into divisible note values 8', () => {
  expect(
    NoteValue.divisible.eighth.splitIntoDivisibleNoteValues(NoteValue.divisible.eighth.multiply(5), NoteValue.divisible.half)
  ).toStrictEqual([ NoteValue.divisible.eighth ]);
});

test('parse score text', () => {
  expect(
    ScoreTextParser.parse('||: Cm7 | Eb ||\nBb7 :||\n', new NoteValue(4, 4), Scale.cMajor, new Score.Metadata())
  ).toStrictEqual(
    new Score(
      new Score.Metadata(),
      [
        new Section(
          null,
          [
            new Bar(
              new NoteValue(4, 4),
              [
                new PartInBar(
                  [
                    new Note(
                      new Chord(
                        Chord.Root.c,
                        Chord.Triad.minor,
                        Chord.SixthOrSeventh.dominantSeventh,
                        new Set(),
                        null,
                      ),
                      NoteValue.divisible.whole,
                      Note.Type.normal,
                      false,
                    ),
                  ],
                  PartInBar.Type.chord,
                ),
              ],
              Clef.treble,
              Scale.cMajor,
              BarBreak.empty,
              BarLine.Start.repeatStart,
              BarLine.End.single,
              BarRepeatEnding.empty,
            ),
            new Bar(
              new NoteValue(4, 4),
              [
                new PartInBar(
                  [
                    new Note(
                      new Chord(
                        Chord.Root.eFlat,
                        Chord.Triad.major,
                        null,
                        new Set(),
                        null,
                      ),
                      NoteValue.divisible.whole,
                      Note.Type.normal,
                      false,
                    ),
                  ],
                  PartInBar.Type.chord,
                ),
              ],
              Clef.treble,
              Scale.cMajor,
              BarBreak.system,
              BarLine.Start.empty,
              BarLine.End.double,
              BarRepeatEnding.empty,
            ),
            new Bar(
              new NoteValue(4, 4),
              [
                new PartInBar(
                  [
                    new Note(
                      new Chord(
                        Chord.Root.bFlat,
                        Chord.Triad.major,
                        Chord.SixthOrSeventh.dominantSeventh,
                        new Set(),
                        null,
                      ),
                      NoteValue.divisible.whole,
                      Note.Type.normal,
                      false,
                    ),
                  ],
                  PartInBar.Type.chord,
                ),
              ],
              Clef.treble,
              Scale.cMajor,
              BarBreak.system,
              BarLine.Start.empty,
              BarLine.End.repeatEnd,
              BarRepeatEnding.empty,
            ),
          ],
        ),
      ],
    )
  );
});

test('parse untrimmed chord', () => {
  expect(ChordTextParser.parse(' Cm7 ')).toStrictEqual(
    new Chord(
      Chord.Root.c,
      Chord.Triad.minor,
      Chord.SixthOrSeventh.dominantSeventh,
      new Set(),
      null,
    )
  );
});

test('parse Cm7/F', () => {
  expect(ChordTextParser.parse('Cm7/F')).toStrictEqual(
    new Chord(
      Chord.Root.c,
      Chord.Triad.minor,
      Chord.SixthOrSeventh.dominantSeventh,
      new Set(),
      NotePitch.f,
    )
  );
});

test('parse E on F#', () => {
  expect(ChordTextParser.parse('E on F#')).toStrictEqual(
    new Chord(
      Chord.Root.e,
      Chord.Triad.major,
      null,
      new Set(),
      NotePitch.fSharp,
    )
  );
});

test('parse Cm7', () => {
  expect(ChordTextParser.parse(' Cm7 ')).toStrictEqual(
    new Chord(
      Chord.Root.c,
      Chord.Triad.minor,
      Chord.SixthOrSeventh.dominantSeventh,
      new Set(),
      null,
    )
  );
});

test('parse Cm9', () => {
  expect(ChordTextParser.parse('Cm9')).toStrictEqual(
    new Chord(
      Chord.Root.c,
      Chord.Triad.minor,
      Chord.SixthOrSeventh.dominantSeventh,
      new Set([ TensionNotePitch.ninth ]),
      null,
    )
  );
});

test('parse CM9', () => {
  expect(ChordTextParser.parse('CM9')).toStrictEqual(
    new Chord(
      Chord.Root.c,
      Chord.Triad.major,
      Chord.SixthOrSeventh.majorSeventh,
      new Set([ TensionNotePitch.ninth ]),
      null,
    )
  );
});

test('parse CM9(#11 13)', () => {
  expect(ChordTextParser.parse('CM9(#11 13)')).toStrictEqual(
    new Chord(
      Chord.Root.c,
      Chord.Triad.major,
      Chord.SixthOrSeventh.majorSeventh,
      new Set([
        TensionNotePitch.ninth,
        TensionNotePitch.sharpEleventh,
        TensionNotePitch.thirteenth,
      ]),
      null,
    )
  );
});

test('parse CM7sus4(9)', () => {
  expect(ChordTextParser.parse('CM7sus4(9)')).toStrictEqual(
    new Chord(
      Chord.Root.c,
      Chord.Triad.suspendedFourth,
      Chord.SixthOrSeventh.majorSeventh,
      new Set([
        TensionNotePitch.ninth,
      ]),
      null,
    )
  );
});