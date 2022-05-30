import Section from './Section.js'
import NoteValue from './NoteValue.js'
import utils from './utils.js';

class Score {
  constructor(metadata, sections, version) {
    this.metadata = metadata;
    this.sections = sections;
    this.version = version;
  }

  static generateNew(title, composerName, arrangerName) {
    return new Score(
      new Score.Metadata(title, composerName, arrangerName),
      [],
      Score.CurrentDataVersion,
    );
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.metadata = this.metadata.getRawObj();
    rawObj.sections = this.sections.map(section => section.getRawObj());
    rawObj.version = this.version.getRawObj();
    return rawObj;
  }

  isEqualTo(that) {
    if (!this.metadata.isEqualTo(that.metadata)) return false;
    if (this.sections.length !== that.sections.length) return false;
    for (let sectionIdx = 0; sectionIdx < this.sections.length; ++sectionIdx) {
      if (!this.sections[sectionIdx].isEqualTo(that.sections[sectionIdx])) return false;
    }
    if (!this.version.isEqualTo(that.version)) return false;
    return true;
  }

  clone() {
    return new Score(
      this.metadata.clone(),
      this.sections.map(section => section.clone()),
      this.version.clone(),
    );
  }

  dumpJson() {
    return JSON.stringify(this.getRawObj());
  }

  static convertRawObjFromVersion(rawObj, version) { 
    let convertedRawObj = utils.clone(rawObj);
    switch (version.toString()) {
      case '0.1.0':
        convertedRawObj.version = { major: 0, minor: 2, patch: 0 };
        convertedRawObj.metadata.artist_name = '';
        return convertedRawObj;
      case '0.2.0':
        convertedRawObj.version = { major: 0, minor: 3, patch: 0 };
        for (let sectionRawObj of convertedRawObj.sections) {
          for (let barRawObj of sectionRawObj.bars) {
            barRawObj.grid_note_value = NoteValue.divisible.half;
          }
        }
        return convertedRawObj;
      default:
        return null;
    }
  }

  static loadFromRawObj(rawObj) {
    let scoreDataVersion = getScoreDataVersion(rawObj);
    while (!scoreDataVersion.isEqualTo(Score.CurrentDataVersion)) {
      rawObj = Score.convertRawObjFromVersion(rawObj, scoreDataVersion);
      if (rawObj === null) return null;
      scoreDataVersion = getScoreDataVersion(rawObj);
    }

    return new Score(
      Score.Metadata.loadFromRawObj(rawObj.metadata),
      rawObj.sections.map(sectionRawObj => Section.loadFromRawObj(sectionRawObj)),
      scoreDataVersion,
    );

    function getScoreDataVersion(rawObj) {
      let rawObjKeys = Object.keys(rawObj);
      if (!rawObjKeys.includes('version')) {
        return new ScoreDataVersion(0, 1, 0);
      } else {
        return ScoreDataVersion.loadFromRawObj(rawObj.version);
      }
    }
  }

  static loadJson(jsonString) {
    return Score.loadFromRawObj(JSON.parse(jsonString))
  }

  getPreviousSectionAndBarIdx({ sectionIdx, barIdx }) {
    let previousBarIdx = barIdx - 1;
    if (previousBarIdx === -1) {
      let previousSectionIdx = sectionIdx - 1;
      if (previousSectionIdx === -1) {
        return { sectionIdx: null, barIdx: null };
      } else {
        if (this.numSections === 0) return { sectionIdx: null, barIdx: null };
        let numSectionBars = this.sections[previousSectionIdx].bars.length;
        if (numSectionBars === 0) return { sectionIdx: null, barIdx: null };
        return { sectionIdx: previousSectionIdx, barIdx: (numSectionBars - 1) };
      }
    } else {
      return { sectionIdx, barIdx: previousBarIdx };
    }
  }

  getNextSectionAndBarIdx({ sectionIdx, barIdx }) {
    if (this.numSections === 0) return { sectionIdx: null, barIdx: null };
    let numSectionBars = this.sections[sectionIdx].bars.length;
    if (numSectionBars === 0) return { sectionIdx: null, barIdx: null };
    let nextBarIdx = barIdx + 1;
    if (nextBarIdx === numSectionBars) {
      let nextSectionIdx = sectionIdx + 1;
      if (nextSectionIdx === this.numSections) {
        return { sectionIdx: null, barIdx: null };
      } else {
        return { sectionIdx: nextSectionIdx, barIdx: 0 };
      }
    } else {
      return { sectionIdx, barIdx: nextBarIdx };
    }
  }

  findSameTypedPartIndexInPreviousBar({ sectionIdx, barIdx, partIdx }) {
    let currentPart = this.getPart(sectionIdx, barIdx, partIdx);
    if (currentPart === null) {
      return { sectionIdx: null, barIdx: null, partIdx: null };
    }
    let { sectionIdx: previousSectionIdx, barIdx: previousBarIdx } =
      this.getPreviousSectionAndBarIdx({ sectionIdx, barIdx });
    if ((previousSectionIdx === null) || (barIdx === null)) {
      return { sectionIdx: null, barIdx: null, partIdx: null };
    }
    let previousBar = this.getBar(previousSectionIdx, previousBarIdx);
    let foundPartIdx = previousBar.parts.findIndex(nextPart => (nextPart.type === currentPart.type));
    if (foundPartIdx === -1) {
      return { sectionIdx: null, barIdx: null, partIdx: null };
    } else {
      return { sectionIdx: previousSectionIdx, barIdx: previousBarIdx, partIdx: foundPartIdx };
    }
  }

  findSameTypedPartIndexInNextBar({ sectionIdx, barIdx, partIdx }) {
    let currentPart = this.getPart(sectionIdx, barIdx, partIdx);
    if (currentPart === null) {
      return { sectionIdx: null, barIdx: null, partIdx: null };
    }
    let { sectionIdx: nextSectionIdx, barIdx: nextBarIdx } =
      this.getNextSectionAndBarIdx({ sectionIdx, barIdx });
    if ((nextSectionIdx === null) || (barIdx === null)) {
      return { sectionIdx: null, barIdx: null, partIdx: null };
    }
    let nextBar = this.getBar(nextSectionIdx, nextBarIdx);
    let foundPartIdx = nextBar.parts.findIndex(nextPart => (nextPart.type === currentPart.type));
    if (foundPartIdx === -1) {
      return { sectionIdx: null, barIdx: null, partIdx: null };
    } else {
      return { sectionIdx: nextSectionIdx, barIdx: nextBarIdx, partIdx: foundPartIdx };
    }
  }

  getNumNotes(sectionIdx, barIdx, partIdx) {
    let part = this.getPart(sectionIdx, barIdx, partIdx);
    if (part === null) return null;
    return part.numNotes;
  }

  getFirstNoteIdx(sectionIdx, barIdx, partIdx) {
    let part = this.getPart(sectionIdx, barIdx, partIdx);
    if (part === null) return null;
    return part.getFirstNoteIdx();
  }

  getLastNoteIdx(sectionIdx, barIdx, partIdx) {
    let part = this.getPart(sectionIdx, barIdx, partIdx);
    if (part === null) return null;
    return part.getLastNoteIdx();
  }

  getNote(sectionIdx, barIdx, partIdx, noteIdx) {
    let part = this.getPart(sectionIdx, barIdx, partIdx);
    if (part === null) return null;
    return part.getNote(noteIdx);
  }

  getNumParts(sectionIdx, barIdx) {
    let bar = this.getBar(sectionIdx, barIdx);
    if (bar === null) return null;
    return bar.numParts;
  }

  getPart(sectionIdx, barIdx, partIdx) {
    let bar = this.getBar(sectionIdx, barIdx);
    if (bar === null) return null;
    return bar.getPart(partIdx);
  }

  getNumBars(sectionIdx) {
    let section = this.getSection(sectionIdx);
    if (section === null) return null;
    return section.getNumBars();
  }

  getFirstBarIdx(sectionIdx) {
    let section = this.getSection(sectionIdx);
    if (section === null) return null;
    return section.getFirstBarIdx(sectionIdx);
  }

  getLastBarIdx(sectionIdx) {
    let section = this.getSection(sectionIdx);
    if (section === null) return null;
    return section.getLastBarIdx(sectionIdx);
  }

  async iterateBars(firstSectionIdx, firstBarIdx, lastSectionIdx, lastBarIdx, callback) {
    if ((firstSectionIdx === null) || (firstBarIdx === null) || (lastSectionIdx === null) || (lastBarIdx === null));
    let sectionIdx = firstSectionIdx;
    let barIdx = firstBarIdx;
    while ((sectionIdx < lastSectionIdx) || ((sectionIdx === lastSectionIdx) && (barIdx <= lastBarIdx))) {
      if (await callback(sectionIdx, barIdx) === false) break;
      ({ sectionIdx, barIdx } = this.getNextSectionAndBarIdx({ sectionIdx, barIdx }));
      if ((sectionIdx === null) || (barIdx === null)) break;
    }
  }

  async reverseIterateBars(firstSectionIdx, firstBarIdx, lastSectionIdx, lastBarIdx, callback) {
    if ((firstSectionIdx === null) || (firstBarIdx === null) || (lastSectionIdx === null) || (lastBarIdx === null));
    let sectionIdx = lastSectionIdx;
    let barIdx = lastBarIdx;
    while ((sectionIdx > firstSectionIdx) || ((sectionIdx === firstSectionIdx) && (barIdx >= firstBarIdx))) {
      if (await callback(sectionIdx, barIdx) === false) break;
      ({ sectionIdx, barIdx } = this.getPreviousSectionAndBarIdx({ sectionIdx, barIdx }));
      if ((sectionIdx === null) || (barIdx === null)) break;
    }
  }

  async getBars(firstSectionIdx, firstBarIdx, lastSectionIdx, lastBarIdx) {
    if ((firstSectionIdx === null) || (firstBarIdx === null) || (lastSectionIdx === null) || (lastBarIdx === null)) return null;
    let bars = new Array();
    await this.iterateBars(
      firstSectionIdx, firstBarIdx, lastSectionIdx, lastBarIdx,
      (sectionIdx, barIdx) => {
        let bar = this.getBar(sectionIdx, barIdx);
        if (bar === null) return false;
        bars.push(bar);
        return true;
      },
    );
    return bars;
  }

  getBar(sectionIdx, barIdx) {
    let section = this.getSection(sectionIdx);
    if (section === null) return null;
    return section.getBar(barIdx);
  }

  get numSections() {
    return this.sections.length;
  }

  get firstSectionIdx() {
    if (this.numSections === 0) return null;
    return 0;
  }

  get lastSectionIdx() {
    if (this.numSections === 0) return null;
    return this.numSections - 1;
  }

  getSection(sectionIdx) {
    if (sectionIdx === null) return null;
    if (this.numSections <= sectionIdx) return null;
    return this.sections[sectionIdx];
  }
}

class ScoreDataVersion {
  constructor(major, minor, patch) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.major = this.major;
    rawObj.minor = this.minor;
    rawObj.patch = this.patch;
    return rawObj;
  }

  isEqualTo(that) {
    if (this.major !== that.major) return false;
    if (this.minor !== that.minor) return false;
    if (this.patch !== that.patch) return false;
    return true;
  }

  static loadFromRawObj(rawObj) {
    return new ScoreDataVersion(
      rawObj.major,
      rawObj.minor,
      rawObj.patch,
    );
  }

  clone() {
    return new ScoreDataVersion(
      this.major,
      this.minor,
      this.patch,
    );
  }

  toString() {
    return [ String(this.major), String(this.minor), String(this.patch) ].join('.');
  }
}

Object.defineProperty(
  Score,
  'CurrentDataVersion',
  {
    value: new ScoreDataVersion(0, 3, 0),
  },
);

Object.defineProperty(
  Score,
  'Metadata',
  {
    value: class {
      constructor(title = '', composerName = '', arrangerName = '', lyricistName = '', artistName = '') {
        this.title = title;
        this.composerName = composerName;
        this.arrangerName = arrangerName;
        this.lyricistName = lyricistName;
        this.artistName = artistName;
      }

      getRawObj() {
        let rawObj = new Object();
        rawObj.title = this.title;
        rawObj.composer_name = this.composerName;
        rawObj.arranger_name = this.arrangerName;
        rawObj.lyricist_name = this.lyricistName;
        rawObj.artist_name = this.artistName;
        return rawObj;
      }

      isEqualTo(that) {
        if (this.title !== that.title) return false;
        if (this.composerName !== that.composerName) return false;
        if (this.arrangerName !== that.arrangerName) return false;
        if (this.lyricistName !== that.lyricistName) return false;
        if (this.artistName !== that.artistName) return false;
        return true;
      }

      clone() {
        return new Score.Metadata(
          this.title,
          this.composerName,
          this.arrangerName,
          this.lyricistName,
          this.artistName,
        );
      }

      static loadFromRawObj(rawObj) {
        return new Score.Metadata(
          rawObj.title,
          rawObj.composer_name,
          rawObj.arranger_name,
          rawObj.lyricist_name,
          rawObj.artist_name,
        );
      }
    },
    writable: false,
  }
);

export default Score;