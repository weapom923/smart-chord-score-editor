class SectionAndBarIdx {
  constructor(sectionIdx, barIdx) {
    this.sectionIdx = sectionIdx;
    this.barIdx = barIdx;
  }

  isEqualTo(that) {
    if (this.sectionIdx !== that.sectionIdx) return false;
    if (this.barIdx !== that.barIdx) return false;
    return true;
  }
}

export default SectionAndBarIdx;