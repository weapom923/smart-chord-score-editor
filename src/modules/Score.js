import Section from './Section.js'

class Score {
  constructor(metadata, sections) {
    this.metadata = metadata;
    this.sections = sections;
  }

  static generateNew(title, composerName, arrangerName) {
    return new Score(
      new Score.Metadata(title, composerName, arrangerName),
      [],
    );
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.metadata = this.metadata.getRawObj();
    rawObj.sections = this.sections.map(section => section.getRawObj());
    return rawObj;
  }

  isEqualTo(that) {
    if (!this.metadata.isEqualTo(that.metadata)) return false;
    if (this.sections.length !== that.sections.length) return false;
    for (let sectionIdx = 0; sectionIdx < this.sections.length; ++sectionIdx) {
      if (!this.sections[sectionIdx].isEqualTo(that.sections[sectionIdx])) return false;
    }
    return true;
  }

  clone() {
    return new Score(
      this.metadata.clone(),
      this.sections.map(section => section.clone()),
    );
  }

  dumpJson() {
    return JSON.stringify(this.getRawObj());
  }

  static loadJson(jsonString) {
    let rawObj = JSON.parse(jsonString);
    return new Score(
      Score.Metadata.loadFromRawObj(rawObj.metadata),
      rawObj.sections.map(sectionRawObj => Section.loadFromRawObj(sectionRawObj)),
    );
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

Object.defineProperty(
  Score,
  'Metadata',
  {
    value: class {
      constructor(title = '', composerName = '', arrangerName = '', lyricistName = '') {
        this.title = title;
        this.composerName = composerName;
        this.arrangerName = arrangerName;
        this.lyricistName = lyricistName;
      }

      getRawObj() {
        let rawObj = new Object();
        rawObj.title = this.title;
        rawObj.composer_name = this.composerName;
        rawObj.arranger_name = this.arrangerName;
        rawObj.lyricist_name = this.lyricistName;
        return rawObj;
      }

      isEqualTo(that) {
        if (this.title !== that.title) return false;
        if (this.composerName !== that.composerName) return false;
        if (this.arrangerName !== that.arrangerName) return false;
        if (this.lyricistName !== that.lyricistName) return false;
        return true;
      }

      clone() {
        return new Score.Metadata(
          this.title,
          this.composerName,
          this.arrangerName,
          this.lyricistName,
        );
      }

      static loadFromRawObj(rawObj) {
        return new Score.Metadata(
          rawObj.title,
          rawObj.composer_name,
          rawObj.arranger_name,
          rawObj.lyricist_name,
        );
      }
    },
    writable: false,
  }
);

export default Score;