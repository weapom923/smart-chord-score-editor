import Chord from '../src/modules/Chord.js'
import TensionNotePitch from '../src/modules/TensionNotePitch.js'
import Bar from '../src/modules/Bar.js'
import BarRepeatEnding from '../src/modules/BarRepeatEnding.js'
import BarBreak from '../src/modules/BarBreak.js'
import BarLine from '../src/modules/BarLine.js'
import Clef from '../src/modules/Clef.js'
import PartInBar from '../src/modules/PartInBar.js'
import Score from '../src/modules/Score.js'
import Section from '../src/modules/Section.js'
import Scale from '../src/modules/Scale.js'
import NoteValue from '../src/modules/NoteValue.js'
import NotePitch from '../src/modules/NotePitch.js'
import Note from '../src/modules/Note.js'

test('equality 1', () => {
  let score = new Score(
    new Score.Metadata('Title', 'Composer', 'Arranger'),
    [
      new Section(
        'Section',
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
                      new Set([
                        TensionNotePitch.flatNinth,
                      ]),
                      NotePitch.d,
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
        ],
      ),
    ],
  );
  expect(score.isEqualTo(score.clone())).toBe(true);
});
