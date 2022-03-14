import Score from './Score.js';
import Bar from './Bar.js';
import BarLine from './BarLine.js';
import Clef from './Clef.js';
import Note from './Note.js';
import NoteValue from './NoteValue.js';
import Section from './Section.js';
import PartInBar from './PartInBar.js';
import ChordTextParser from './ChordTextParser.js';
import utils from './utils.js';

class ScoreTextParser {
  static normalizeScoreText(scoreText) {
    scoreText = scoreText.replace('\r', '\n');
    scoreText = scoreText.replace('[', '\n[');
    scoreText = scoreText.replace(']', ']\n');
    scoreText = scoreText.replace(/^\s+/gm, '');
    scoreText = scoreText.replace(/^\s*[\n]+/gm, '');
    return scoreText.trim();
  }

  static splitIntoSectionTexts(scoreText) {
    const sectionNameBegin = '[';
    const sectionNameEnd = ']';
    let sectionTexts = new Array();
    if (scoreText.includes(sectionNameBegin)) {
      let currentReadIdx = 0;
      do {
        let sectionStartIdx = scoreText.indexOf(sectionNameBegin, currentReadIdx);
        let sectionEndIdx = scoreText.indexOf(sectionNameEnd, sectionStartIdx + 1) + 1;
        if (sectionEndIdx < 0) {
          throw new ScoreTextParser.ParseError('end of section is not found.');
        }
        let sectionNameStartIdx = sectionStartIdx + 1;
        let sectionNameEndIdx = sectionEndIdx - 1;
        let sectionName = scoreText.slice(sectionNameStartIdx, sectionNameEndIdx);
        let sectionContentTextStartIdx = sectionEndIdx;
        let nextSectionStartIdx = scoreText.indexOf(sectionNameBegin, sectionContentTextStartIdx);
        let sectionContentTextEndIdx = (nextSectionStartIdx < 0)? scoreText.length : nextSectionStartIdx;
        let sectionContentText = scoreText.slice(sectionContentTextStartIdx, sectionContentTextEndIdx);
        sectionTexts.push(new SectionText(sectionName, sectionContentText.trim()));
        currentReadIdx = sectionContentTextEndIdx;
      }
      while (currentReadIdx >= 0 && currentReadIdx < scoreText.length);
    } else {
      sectionTexts.push(new SectionText(null, scoreText));
    }
    return sectionTexts;
  }

  static splitIntoBarTextTokensBySystem(sectionContentText) {
    const separatorTextToBarLinesMap = {
      ':||:': [ BarLine.Start.repeatStart, BarLine.End.repeatEnd ],
      '||:': [ BarLine.Start.repeatStart ],
      ':||': [ BarLine.End.repeatEnd ],
      '||': [ BarLine.End.double ],
      '|': [ BarLine.End.single ],
    };

    return sectionContentText.split('\n')
      .map(eachSystemSectionContentText => tokenizeSectionContentText(eachSystemSectionContentText));

    function tokenizeSectionContentText(sectionContentText) {
      let tokens = [ sectionContentText ];
      tokens = retokenizeTokensBy(tokens, ':||:');
      tokens = retokenizeTokensBy(tokens, '||:');
      tokens = retokenizeTokensBy(tokens, ':||');
      tokens = retokenizeTokensBy(tokens, '||');
      tokens = retokenizeTokensBy(tokens, '|');
      return tokens;
    }

    function retokenizeTokensBy(tokens, separatorText) {
      let tokensTemp = new Array();
      if (tokens instanceof Array) {
        for (let token of tokens) {
          tokensTemp.push(...retokenizeTokenBy(token, separatorText));
        }
      } else {
        tokensTemp.push(...retokenizeTokenBy(tokens, separatorText));
      }
      return tokensTemp;

      function retokenizeTokenBy(token, separatorText) {
        let tokensTemp = new Array();
        if (utils.isString(token)) {
          let [ firstSeparatedToken, ...remianingSeparatedTokens ] = token.split(separatorText);
          let trimmedFirstSeparatedToken = firstSeparatedToken.trim();
          if (trimmedFirstSeparatedToken.length > 0) tokensTemp.push(trimmedFirstSeparatedToken);
          for (let separatedToken of remianingSeparatedTokens) {
            tokensTemp.push(...separatorTextToBarLinesMap[separatorText]);
            let trimmedSeparatedToken = separatedToken.trim();
            if (trimmedSeparatedToken.length > 0) tokensTemp.push(trimmedSeparatedToken);
          }
        } else {
          tokensTemp.push(token);
        }
        return tokensTemp;
      }
    }
  }

  static packBarTextTokensIntoBars(barTextTokensBySystem, beatValue, scale) {
    let bars = new Array();
    for (let barTextTokens of barTextTokensBySystem) {
      let barArgsInSystem = new Array();
      let currentReadIdx = 0;
      let numBarTextTokens = barTextTokens.length;
      do {
        let barLineStart = BarLine.Start.empty;
        {
          let barLineStartCandidate = barTextTokens[currentReadIdx];
          if (Object.values(BarLine.Start).includes(barLineStartCandidate)) {
            barLineStart = barLineStartCandidate;
            ++currentReadIdx;
          }
        }

        let barContentText = barTextTokens[currentReadIdx];
        if (!utils.isString(barContentText)) {
          throw new ScoreTextParser.ParseError('unexpected bar content: ' + barContentText);
        }
        let chordTexts = barContentText.split(/ +/);
        let chords = chordTexts.map(chordText => ChordTextParser.parse(chordText));
        ++currentReadIdx;

        let barLineEnd = barTextTokens[currentReadIdx];
        if (!(barLineEnd instanceof BarLine)) {
          throw new ScoreTextParser.ParseError('unexpected bar content: ' + barLineEnd);
        }
        ++currentReadIdx;
  
        barArgsInSystem.push(new TemporaryBarArgument(chords, barLineStart, barLineEnd));
      }
      while (currentReadIdx < numBarTextTokens);
      
      let barsInSystem = new Array();
      for (let barArgIdx = 0; barArgIdx < barArgsInSystem.length; ++barArgIdx) {
        let barArgInSystem = barArgsInSystem[barArgIdx];
        let barNoteValues = undefined;
        switch (barArgInSystem.chords.length) {
          case 1:
            barNoteValues = [ beatValue.reduce() ];
            break;
          case 2:
            barNoteValues = [
              beatValue.subtract(new NoteValue(1, 2)).reduce(),
              new NoteValue(1, 2),
            ];
            break;
          case 3:
            barNoteValues = [
              beatValue.subtract(new NoteValue(1, 2)).reduce(),
              new NoteValue(1, 4),
              new NoteValue(1, 4),
            ];
            break;
          case 4:
            barNoteValues = [
              beatValue.subtract(new NoteValue(3, 4)).reduce(),
              new NoteValue(1, 4),
              new NoteValue(1, 4),
              new NoteValue(1, 4),
            ];
            break;
          case 5:
            barNoteValues = [
              beatValue.subtract(new NoteValue(3, 4)).reduce(),
              new NoteValue(1, 4),
              new NoteValue(1, 4),
              new NoteValue(1, 8),
              new NoteValue(1, 8),
            ];
            break;
          default:
            throw new ScoreTextParser.ParseError('unexpected number of bar arguments: ' + barArgsInSystem.length);
        }
        barsInSystem.push(new Bar(
          beatValue,
          [
            new PartInBar(
              barArgInSystem.chords.map(
                (chord, chordIdx) => new Note(
                  chord,
                  barNoteValues[chordIdx],
                  Note.Type.normal
                ),
              ),
              PartInBar.Type.chord,
            ),
          ],
          Clef.Type.treble,
          scale,
          false,
          barArgInSystem.barLineStart,
          barArgInSystem.barLineEnd,
        ));
      }
      let lastBarInSystem = barsInSystem[barsInSystem.length - 1];
      lastBarInSystem.terminatesSystem = true;
      bars.push(...barsInSystem);
    }
    return bars;
  }

  static parse(scoreText, beatValue, scale) {
    scoreText = ScoreTextParser.normalizeScoreText(scoreText);
    let sectionTexts = ScoreTextParser.splitIntoSectionTexts(scoreText);
    let sections = new Array();
    for (let sectionText of sectionTexts) {
      let sectionName = sectionText.sectionName;
      let sectionContentText = sectionText.sectionContentText;
      let barTextTokensBySystem = ScoreTextParser.splitIntoBarTextTokensBySystem(sectionContentText);
      let bars = ScoreTextParser.packBarTextTokensIntoBars(barTextTokensBySystem, beatValue, scale);
      sections.push(new Section(sectionName, bars));
    }
    let scoreMetaData = new Score.MetaData('NewSong');
    return new Score(scoreMetaData, sections);
  }
}

Object.defineProperty(
  ScoreTextParser,
  'ParseError',
  {
    value: class extends Error {
      constructor(...args) {
        super(...args);
      }
    },
    writable: false,
  },
);

class SectionText {
  constructor(sectionName, sectionContentText) {
    this.sectionName = sectionName;
    this.sectionContentText = sectionContentText;
  }
}

class TemporaryBarArgument {
  constructor(chords, barLineStart, barLineEnd) {
    this.chords = chords;
    this.barLineStart = barLineStart;
    this.barLineEnd = barLineEnd;
  }
}

export default ScoreTextParser;
