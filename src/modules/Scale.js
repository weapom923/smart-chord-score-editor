import NotePitch from './NotePitch.js'

class Scale {
  constructor(tonicNotePitch, type) {
    tonicNotePitch = Scale.normalizeTonicNotePitch(tonicNotePitch, type);
    this.notePitches = Scale.getScaleNotePitches(tonicNotePitch, type);
    this.type = type;
  }

  get tonicNotePitch() {
    return this.notePitches[0];
  }

  getRawObj() {
    let rawObj = new Object();
    rawObj.type = this.type;
    rawObj.tonic_note_pitch = this.tonicNotePitch.getRawObj();
    return rawObj;
  }

  isEqualTo(that) {
    let foundPredefinedScaleByThis = Scale.findPredefinedScale(this);
    let foundPredefinedScaleByThat = Scale.findPredefinedScale(that);
    if (foundPredefinedScaleByThis === foundPredefinedScaleByThat) {
      if (foundPredefinedScaleByThis !== null) return true;
    }
    if (this.notePitches.length !== that.notePitches.length) return false;
    for (let notePitchIdx = 0; notePitchIdx < this.notePitches.length; ++notePitchIdx) {
      if (!this.notePitches[notePitchIdx].isEqualTo(that.notePitches[notePitchIdx])) return false;
    }
    if (this.type !== that.type) return false;
    return true;
  }

  clone() {
    let foundPredefinedScaleByThis = Scale.findPredefinedScale(this);
    if (foundPredefinedScaleByThis !== null) {
      return foundPredefinedScaleByThis;
    } else {
      return new Scale(
        this.tonicNotePitch.clone(),
        this.type,
      );
    }
  }

  static loadFromRawObj(rawObj) {
    let scale = new Scale(
      NotePitch.loadFromRawObj(rawObj.tonic_note_pitch),
      rawObj.type,
    );
    let predefinedScale = Scale.findPredefinedScale(scale);
    return (predefinedScale === null)? scale : predefinedScale;
  }

  get numSharps() {
    if (Object.keys(this).includes('_numSharps')) return this._numSharps;
    this._numSharps = this.notePitches.filter(notePitch => notePitch.isSharp).length;
    return this._numSharps;
  }

  get numFlats() {
    if (Object.keys(this).includes('_numFlats')) return this._numFlats;
    this._numFlats = this.notePitches.filter(notePitch => notePitch.isFlat).length;
    return this._numFlats;
  }

  static findPredefinedScale(scale) {
    switch (scale.type) {
      case Scale.Type.major:
        switch (scale.tonicNotePitch) {
          case NotePitch.c:      return Scale.cMajor;
          case NotePitch.g:      return Scale.gMajor;
          case NotePitch.d:      return Scale.dMajor;
          case NotePitch.a:      return Scale.aMajor;
          case NotePitch.e:      return Scale.eMajor;
          case NotePitch.b:      return Scale.bMajor;
          case NotePitch.fSharp: return Scale.fSharpMajor;
          case NotePitch.gFlat:  return Scale.gFlatMajor;
          case NotePitch.cSharp: return Scale.cSharpMajor;
          case NotePitch.dFlat:  return Scale.dFlatMajor;
        }
        break;
      case Scale.Type.minor:
        switch (scale.tonicNotePitch) {
          case NotePitch.a:      return Scale.aMinor;
          case NotePitch.d:      return Scale.dMinor;
          case NotePitch.g:      return Scale.gMinor;
          case NotePitch.c:      return Scale.cMinor;
          case NotePitch.f:      return Scale.fMinor;
          case NotePitch.bFlat:  return Scale.bFlatMinor;
          case NotePitch.eFlat:  return Scale.eFlatMinor;
          case NotePitch.dSharp: return Scale.dSharpMinor;
          case NotePitch.aFlat:  return Scale.aFlatMinor;
          case NotePitch.gSharp: return Scale.gSharpMinor;
        }
        break;
    }
    return null;
  }

  static normalizeTonicNotePitch(tonicNotePitch, type) {
    switch (type) {
      case Scale.Type.major:
        switch (tonicNotePitch) {
          case NotePitch.aSharp: return NotePitch.Flat;
          case NotePitch.bSharp: return NotePitch.c;
          case NotePitch.dSharp: return NotePitch.eFlat;
          case NotePitch.eSharp: return NotePitch.f;
          case NotePitch.fFlat:  return NotePitch.e;
          case NotePitch.gSharp: return NotePitch.aFlat;
        }
        break;
      case Scale.Type.minor:
        switch (tonicNotePitch) {
          case NotePitch.bSharp: return NotePitch.c;
          case NotePitch.cFlat:  return NotePitch.b;
          case NotePitch.dFlat:  return NotePitch.cSharp;
          case NotePitch.eSharp: return NotePitch.f;
          case NotePitch.fFlat:  return NotePitch.e;
          case NotePitch.gFlat:  return NotePitch.fSharp;
        }
        break;
    }
    return tonicNotePitch;
  }

  static getScaleNotePitches(tonicNotePitch, type) {
    switch (type) {
      case Scale.Type.major:
        switch (tonicNotePitch) {
        case NotePitch.c:      return [ NotePitch.c, NotePitch.d, NotePitch.e, NotePitch.f, NotePitch.g, NotePitch.a, NotePitch.b ];
        case NotePitch.g:      return [ NotePitch.g, NotePitch.a, NotePitch.b, NotePitch.c, NotePitch.d, NotePitch.e, NotePitch.fSharp ];
        case NotePitch.d:      return [ NotePitch.d, NotePitch.e, NotePitch.fSharp, NotePitch.g, NotePitch.a, NotePitch.b, NotePitch.cSharp ];
        case NotePitch.a:      return [ NotePitch.a, NotePitch.b, NotePitch.cSharp, NotePitch.d, NotePitch.e, NotePitch.fSharp, NotePitch.gSharp ];
        case NotePitch.e:      return [ NotePitch.e, NotePitch.fSharp, NotePitch.gSharp, NotePitch.a, NotePitch.b, NotePitch.cSharp, NotePitch.dSharp ];
        case NotePitch.b:      return [ NotePitch.b, NotePitch.cSharp, NotePitch.dSharp, NotePitch.e, NotePitch.fSharp, NotePitch.gSharp, NotePitch.aSharp ];
        case NotePitch.fSharp: return [ NotePitch.fSharp, NotePitch.gSharp, NotePitch.aSharp, NotePitch.b, NotePitch.cSharp, NotePitch.dSharp, NotePitch.eSharp ];
        case NotePitch.gFlat:  return [ NotePitch.gFlat, NotePitch.aFlat, NotePitch.bFlat, NotePitch.cFlat, NotePitch.dFlat, NotePitch.eFlat, NotePitch.fSharp ];
        case NotePitch.cSharp: return [ NotePitch.cSharp, NotePitch.dSharp, NotePitch.eSharp, NotePitch.fSharp, NotePitch.gSharp, NotePitch.aSharp, NotePitch.bSharp ];
        case NotePitch.dFlat:  return [ NotePitch.dFlat, NotePitch.eFlat, NotePitch.f, NotePitch.gFlat, NotePitch.aFlat, NotePitch.bFlat, NotePitch.c ];
        case NotePitch.aFlat:  return [ NotePitch.aFlat, NotePitch.bFlat, NotePitch.c, NotePitch.dFlat, NotePitch.eFlat, NotePitch.f, NotePitch.g ];
        case NotePitch.eFlat:  return [ NotePitch.eFlat, NotePitch.f, NotePitch.g, NotePitch.aFlat, NotePitch.bFlat, NotePitch.c, NotePitch.d ];
        case NotePitch.bFlat:  return [ NotePitch.bFlat, NotePitch.c, NotePitch.d, NotePitch.eFlat, NotePitch.f, NotePitch.g, NotePitch.a ];
        case NotePitch.f:      return [ NotePitch.f, NotePitch.g, NotePitch.a, NotePitch.bFlat, NotePitch.c, NotePitch.d, NotePitch.e ];
        }
        break;
      case Scale.Type.minor:
        switch (tonicNotePitch) {
        case NotePitch.a:      return [ NotePitch.a, NotePitch.b, NotePitch.c, NotePitch.d, NotePitch.e, NotePitch.f, NotePitch.g ];
        case NotePitch.d:      return [ NotePitch.d, NotePitch.e, NotePitch.f, NotePitch.g, NotePitch.a, NotePitch.bFlat, NotePitch.c ];
        case NotePitch.g:      return [ NotePitch.g, NotePitch.a, NotePitch.bFlat, NotePitch.c, NotePitch.d, NotePitch.eFlat, NotePitch.f ];
        case NotePitch.c:      return [ NotePitch.c, NotePitch.d, NotePitch.eFlat, NotePitch.f, NotePitch.g, NotePitch.aFlat, NotePitch.bFlat ];
        case NotePitch.f:      return [ NotePitch.f, NotePitch.g, NotePitch.aFlat, NotePitch.bFlat, NotePitch.c, NotePitch.dFlat, NotePitch.eFlat ];
        case NotePitch.bFlat:  return [ NotePitch.bFlat, NotePitch.c, NotePitch.dFlat, NotePitch.eFlat, NotePitch.f, NotePitch.gFlat, NotePitch.aFlat ];
        case NotePitch.dSharp: return [ NotePitch.dSharp, NotePitch.eSharp, NotePitch.fSharp, NotePitch.gSharp, NotePitch.aSharp, NotePitch.b, NotePitch.cSharp ];
        case NotePitch.eFlat:  return [ NotePitch.eFlat, NotePitch.f, NotePitch.gFlat, NotePitch.aFlat, NotePitch.bFlat, NotePitch.cFlat, NotePitch.dFlat ];
        case NotePitch.aFlat:  return [ NotePitch.aFlat, NotePitch.bFlat, NotePitch.cFlat, NotePitch.dFlat, NotePitch.eFlat, NotePitch.fFlat, NotePitch.gFlat ];
        case NotePitch.gSharp: return [ NotePitch.gSharp, NotePitch.aSharp, NotePitch.b, NotePitch.cSharp, NotePitch.dSharp, NotePitch.e, NotePitch.fSharp ];
        case NotePitch.cSharp: return [ NotePitch.cSharp, NotePitch.dSharp, NotePitch.e, NotePitch.fSharp, NotePitch.gSharp, NotePitch.a, NotePitch.b ];
        case NotePitch.fSharp: return [ NotePitch.fSharp, NotePitch.gSharp, NotePitch.a, NotePitch.b, NotePitch.cSharp, NotePitch.d, NotePitch.e ];
        case NotePitch.b:      return [ NotePitch.b, NotePitch.cSharp, NotePitch.d, NotePitch.e, NotePitch.fSharp, NotePitch.gSharp, NotePitch.a ];
        case NotePitch.e:      return [ NotePitch.e, NotePitch.fSharp, NotePitch.g, NotePitch.a, NotePitch.b, NotePitch.c, NotePitch.d ];
        }
        break;
    }
    return null;
  }
}

Object.defineProperty(
  Scale,
  'Type',
  {
    value: {
      major: 'major',
      minor: 'minor',
    },
    writable: false,
  },
);

Object.defineProperty(Scale, 'cMajor',      { value: new Scale(NotePitch.c,      Scale.Type.major), writable: false });
Object.defineProperty(Scale, 'gMajor',      { value: new Scale(NotePitch.g,      Scale.Type.major), writable: false });
Object.defineProperty(Scale, 'dMajor',      { value: new Scale(NotePitch.d,      Scale.Type.major), writable: false });
Object.defineProperty(Scale, 'aMajor',      { value: new Scale(NotePitch.a,      Scale.Type.major), writable: false });
Object.defineProperty(Scale, 'eMajor',      { value: new Scale(NotePitch.e,      Scale.Type.major), writable: false });
Object.defineProperty(Scale, 'bMajor',      { value: new Scale(NotePitch.b,      Scale.Type.major), writable: false });
Object.defineProperty(Scale, 'fSharpMajor', { value: new Scale(NotePitch.fSharp, Scale.Type.major), writable: false });
Object.defineProperty(Scale, 'gFlatMajor',  { value: new Scale(NotePitch.gFlat,  Scale.Type.major), writable: false });
Object.defineProperty(Scale, 'cSharpMajor', { value: new Scale(NotePitch.cSharp, Scale.Type.major), writable: false });
Object.defineProperty(Scale, 'dFlatMajor',  { value: new Scale(NotePitch.dFlat,  Scale.Type.major), writable: false });
Object.defineProperty(Scale, 'aFlatMajor',  { value: new Scale(NotePitch.aFlat,  Scale.Type.major), writable: false });
Object.defineProperty(Scale, 'eFlatMajor',  { value: new Scale(NotePitch.eFlat,  Scale.Type.major), writable: false });
Object.defineProperty(Scale, 'bFlatMajor',  { value: new Scale(NotePitch.bFlat,  Scale.Type.major), writable: false });
Object.defineProperty(Scale, 'fMajor',      { value: new Scale(NotePitch.f,      Scale.Type.major), writable: false });

Object.defineProperty(Scale, 'aMinor',      { value: new Scale(NotePitch.a,      Scale.Type.minor), writable: false });
Object.defineProperty(Scale, 'dMinor',      { value: new Scale(NotePitch.d,      Scale.Type.minor), writable: false });
Object.defineProperty(Scale, 'gMinor',      { value: new Scale(NotePitch.g,      Scale.Type.minor), writable: false });
Object.defineProperty(Scale, 'cMinor',      { value: new Scale(NotePitch.c,      Scale.Type.minor), writable: false });
Object.defineProperty(Scale, 'fMinor',      { value: new Scale(NotePitch.f,      Scale.Type.minor), writable: false });
Object.defineProperty(Scale, 'bFlatMinor',  { value: new Scale(NotePitch.bFlat,  Scale.Type.minor), writable: false });
Object.defineProperty(Scale, 'eFlatMinor',  { value: new Scale(NotePitch.eFlat,  Scale.Type.minor), writable: false });
Object.defineProperty(Scale, 'dSharpMinor', { value: new Scale(NotePitch.dSharp, Scale.Type.minor), writable: false });
Object.defineProperty(Scale, 'aFlatMinor',  { value: new Scale(NotePitch.aFlat,  Scale.Type.minor), writable: false });
Object.defineProperty(Scale, 'gSharpMinor', { value: new Scale(NotePitch.gSharp, Scale.Type.minor), writable: false });
Object.defineProperty(Scale, 'cSharpMinor', { value: new Scale(NotePitch.cSharp, Scale.Type.minor), writable: false });
Object.defineProperty(Scale, 'fSharpMinor', { value: new Scale(NotePitch.fSharp, Scale.Type.minor), writable: false });
Object.defineProperty(Scale, 'bMinor',      { value: new Scale(NotePitch.b,      Scale.Type.minor), writable: false });
Object.defineProperty(Scale, 'eMinor',      { value: new Scale(NotePitch.e,      Scale.Type.minor), writable: false });

export default Scale;
