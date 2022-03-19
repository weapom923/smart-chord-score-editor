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

  getNextSectionAndBarIdx({ sectionIdx, barIdx }) {
    let numSections = this.sections.length;
    let numSectionBars = this.sections[sectionIdx].bars.length;
    let nextBarIdx = barIdx + 1;
    if (nextBarIdx === numSectionBars) {
      let nextSectionIdx = sectionIdx + 1;
      if (nextSectionIdx === numSections) {
        return { sectionIdx: null, barIdx: null };
      } else {
        return { sectionIdx: nextSectionIdx, barIdx: 0 };
      }
    } else {
      return { sectionIdx, barIdx: nextBarIdx };
    }
  }

  getPreviousSectionAndBarIdx({ sectionIdx, barIdx }) {
    let previousBarIdx = barIdx - 1;
    if (previousBarIdx === -1) {
      let previousSectionIdx = sectionIdx - 1;
      if (previousSectionIdx === -1) {
        return { sectionIdx: null, barIdx: null };
      } else {
        return { sectionIdx: previousSectionIdx, barIdx: (this.sections[previousSectionIdx].bars.length - 1) };
      }
    } else {
      return { sectionIdx, barIdx: previousBarIdx };
    }
  }
}

Object.defineProperty(
  Score,
  'Metadata',
  {
    value: class {
      constructor(title = '', composerName = '', arrangerName = '') {
        this.title = title;
        this.composerName = composerName;
        this.arrangerName = arrangerName;
      }

      getRawObj() {
        let rawObj = new Object();
        rawObj.title = this.title;
        rawObj.composer_name = this.composerName;
        rawObj.arranger_name = this.arrangerName;
        return rawObj;
      }

      static loadFromRawObj(rawObj) {
        return new Score.Metadata(
          rawObj.title,
          rawObj.composer_name,
          rawObj.arranger_name,
        );
      }
    },
    writable: false,
  }
);

export default Score;