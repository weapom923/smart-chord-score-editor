import ChordTextParser from '../src/modules/ChordTextParser.js'

test('parse_chord_text', () => {
  expect(ChordTextParser.parse('Cm7')).toStrictEqual(
    new ChordTextParser.ParseResult(
      ChordTextParser.ParseResult.Root.c,
      ChordTextParser.ParseResult.Triad.minor,
      ChordTextParser.ParseResult.SixthOrSeventh.dominantSeventh,
      new Set(),
      null,
    )
  );
  expect(ChordTextParser.parse('Cm9')).toStrictEqual(
    new ChordTextParser.ParseResult(
      ChordTextParser.ParseResult.Root.c,
      ChordTextParser.ParseResult.Triad.minor,
      ChordTextParser.ParseResult.SixthOrSeventh.dominantSeventh,
      new Set([ ChordTextParser.ParseResult.TensionNote.ninth ]),
      null,
    )
  );
  expect(ChordTextParser.parse('CM9')).toStrictEqual(
    new ChordTextParser.ParseResult(
      ChordTextParser.ParseResult.Root.c,
      ChordTextParser.ParseResult.Triad.major,
      ChordTextParser.ParseResult.SixthOrSeventh.majorSeventh,
      new Set([ ChordTextParser.ParseResult.TensionNote.ninth ]),
      null,
    )
  );
  expect(ChordTextParser.parse('CM9(11 13)')).toStrictEqual(
    new ChordTextParser.ParseResult(
      ChordTextParser.ParseResult.Root.c,
      ChordTextParser.ParseResult.Triad.major,
      ChordTextParser.ParseResult.SixthOrSeventh.majorSeventh,
      new Set([
        ChordTextParser.ParseResult.TensionNote.ninth,
        ChordTextParser.ParseResult.TensionNote.eleventh,
        ChordTextParser.ParseResult.TensionNote.thirteenth,
      ]),
      null,
    )
  );
  expect(ChordTextParser.parse('CM7sus4(9)')).toStrictEqual(
    new ChordTextParser.ParseResult(
      ChordTextParser.ParseResult.Root.c,
      ChordTextParser.ParseResult.Triad.suspendedFourth,
      ChordTextParser.ParseResult.SixthOrSeventh.majorSeventh,
      new Set([
        ChordTextParser.ParseResult.TensionNote.ninth,
      ]),
      null,
    )
  );
});

