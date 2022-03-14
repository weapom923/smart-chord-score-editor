import Section from './Section.js'

class Score {
  constructor(metadata, sections) {
    this.metadata = metadata;
    this.sections = sections;
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
      Score.MetaData.loadFromRawObj(rawObj.metadata),
      rawObj.sections.map(sectionRawObj => Section.loadFromRawObj(sectionRawObj)),
    );
  }
}

Object.defineProperty(
  Score,
  'MetaData',
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
        return new Score.MetaData(
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