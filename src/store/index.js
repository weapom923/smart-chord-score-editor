import Vue from 'vue'
import Vuex from 'vuex'
import NoteValue from '../modules/NoteValue.js'
import Scale from '../modules/Scale.js'
import Chord from '../modules/Chord.js'
import Clef from '../modules/Clef.js'
import PartInBar from '../modules/PartInBar.js'
import Color from '../modules/Color.js'
import SectionAndBarIdx from '../modules/SectionAndBarIdx.js'

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    selectedBarsFirst: new SectionAndBarIdx(null, null),
    selectedBarsLast: new SectionAndBarIdx(null, null),
    copiedBars: new Array(),
    config: {
      staffLineStepPx: 10,
      systemMarginTopPx: 30,
      systemMarginBottomPx: 10,
      defaultGridNoteValue: NoteValue.divisible.half,
      chordFontSizePx: 18,
      pageWidthOnPrintPx: 1080,
      defaultChord: new Chord(Chord.Root.a, Chord.Triad.major),
      defaultBarValue: new NoteValue(4, 4),
      defaultClef: Clef.treble,
      defaultScale: Scale.cMajor,
      defaultPartInBarTypes: [ PartInBar.Type.chord ],
      selectedNoteColor: new Color(42, 118, 210, 1),
    },
  },

  mutations: {
    loadConfigFromCookie(state) {
      let configJsonFromCookie = window.localStorage.getItem('config');
      if (configJsonFromCookie !== null) {
        let configKeys = Object.keys(state.config);
        let rawConfigFromCookie = JSON.parse(configJsonFromCookie);
        let configKeysFromCookie = Object.keys(rawConfigFromCookie);
        let missingKeys = new Array();
        for (let configKey of configKeys) {
          if (!configKeysFromCookie.includes(configKey)) {
            missingKeys.push(configKey);
            break;
          }
        }
        if (missingKeys.length > 0) {
          console.warn('missing required config key: ' + missingKeys.join(', '));
          return;
        }
        state.config.staffLineStepPx = rawConfigFromCookie.staffLineStepPx;
        state.config.systemMarginTopPx = rawConfigFromCookie.systemMarginTopPx;
        state.config.systemMarginBottomPx = rawConfigFromCookie.systemMarginBottomPx;
        state.config.defaultGridNoteValue = NoteValue.loadFromRawObj(rawConfigFromCookie.defaultGridNoteValue);
        state.config.chordFontSizePx = rawConfigFromCookie.chordFontSizePx;
        state.config.pageWidthOnPrintPx = rawConfigFromCookie.pageWidthOnPrintPx;
        state.config.defaultChord = Chord.loadFromRawObj(rawConfigFromCookie.defaultChord);
        state.config.defaultBarValue = NoteValue.loadFromRawObj(rawConfigFromCookie.defaultBarValue);
        state.config.defaultClef = Clef.loadFromRawObj(rawConfigFromCookie.defaultClef);
        state.config.defaultScale = Scale.loadFromRawObj(rawConfigFromCookie.defaultScale);
        state.config.defaultPartInBarTypes = rawConfigFromCookie.defaultPartInBarTypes;
        state.config.selectedNoteColor = Color.loadFromRawObj(rawConfigFromCookie.selectedNoteColor);
      }
    },

    unselectBar(state) {
      state.selectedBarsFirst.sectionIdx = null;
      state.selectedBarsFirst.barIdx = null;
      state.selectedBarsLast.sectionIdx = null;
      state.selectedBarsLast.barIdx = null;
    },

    selectBar(state, { sectionIdx, barIdx }) {
      state.selectedBarsFirst.sectionIdx = sectionIdx;
      state.selectedBarsFirst.barIdx = barIdx;
      state.selectedBarsLast.sectionIdx = sectionIdx;
      state.selectedBarsLast.barIdx = barIdx;
    },

    expandSelectedBars(state, { sectionIdx, barIdx }) {
      let isAnyBarSelected =
        (state.selectedBarsFirst.sectionIdx !== null) &&
        (state.selectedBarsFirst.barIdx !== null) &&
        (state.selectedBarsLast.sectionIdx !== null) &&
        (state.selectedBarsLast.barIdx !== null);
      if (isAnyBarSelected) {
        if (sectionIdx < state.selectedBarsFirst.sectionIdx) {
          state.selectedBarsFirst.sectionIdx = sectionIdx;
          state.selectedBarsFirst.barIdx = barIdx;
        } else if (sectionIdx > state.selectedBarsLast.sectionIdx) {
          state.selectedBarsLast.sectionIdx = sectionIdx;
          state.selectedBarsLast.barIdx = barIdx;
        } else {
          if (barIdx < state.selectedBarsFirst.barIdx) {
            state.selectedBarsFirst.sectionIdx = sectionIdx;
            state.selectedBarsFirst.barIdx = barIdx;
          } else if (barIdx > state.selectedBarsLast.barIdx) {
            state.selectedBarsLast.sectionIdx = sectionIdx;
            state.selectedBarsLast.barIdx = barIdx;
          }
        }
      }
    },

    selectNextBar(state, score) {
      let sectionIdx = state.selectedBarsLast.sectionIdx;
      let barIdx = state.selectedBarsLast.barIdx;
      if ((sectionIdx === null) || (barIdx === null)) {
        sectionIdx = 0;
        barIdx = 0;
      } else {
        ({ sectionIdx, barIdx } = score.getNextSectionAndBarIdx({ sectionIdx, barIdx }));
        if ((sectionIdx === null) || (barIdx === null)) {
          state.selectedBarsFirst.sectionIdx = state.selectedBarsLast.sectionIdx;
          state.selectedBarsFirst.barIdx = state.selectedBarsLast.barIdx;
          return;
        }
      }
      state.selectedBarsFirst.sectionIdx = sectionIdx;
      state.selectedBarsFirst.barIdx = barIdx;
      state.selectedBarsLast.sectionIdx = sectionIdx;
      state.selectedBarsLast.barIdx = barIdx;
    },

    selectPreviousBar(state, score) {
      let sectionIdx = state.selectedBarsFirst.sectionIdx;
      let barIdx = state.selectedBarsFirst.barIdx;
      if ((sectionIdx === null) || (barIdx === null)) {
        sectionIdx = score.sections.length - 1;
        barIdx = score.sections[sectionIdx].bars.length - 1;
      } else {
        ({ sectionIdx, barIdx } = score.getPreviousSectionAndBarIdx({ sectionIdx, barIdx }));
        if ((sectionIdx === null) || (barIdx === null)) {
          state.selectedBarsLast.sectionIdx = state.selectedBarsFirst.sectionIdx;
          state.selectedBarsLast.barIdx = state.selectedBarsFirst.barIdx;
          return;
        }
      }
      state.selectedBarsFirst.sectionIdx = sectionIdx;
      state.selectedBarsFirst.barIdx = barIdx;
      state.selectedBarsLast.sectionIdx = sectionIdx;
      state.selectedBarsLast.barIdx = barIdx;
    },

    incrementSelectedBarsFirstIdx(state, score) {
      let sectionIdx = state.selectedBarsFirst.sectionIdx;
      let barIdx = state.selectedBarsFirst.barIdx;
      if ((sectionIdx === null) || (barIdx === null)) return;
      if ((sectionIdx === state.selectedBarsLast.sectionIdx) && (barIdx === state.selectedBarsLast.barIdx)) return;
      ({ sectionIdx, barIdx } = score.getNextSectionAndBarIdx({ sectionIdx, barIdx }));
      if ((sectionIdx === null) || (barIdx === null)) return;
      state.selectedBarsFirst.sectionIdx = sectionIdx;
      state.selectedBarsFirst.barIdx = barIdx;
    },

    incrementSelectedBarsLastIdx(state, score) {
      let sectionIdx = state.selectedBarsLast.sectionIdx;
      let barIdx = state.selectedBarsLast.barIdx;
      if ((sectionIdx === null) || (barIdx === null)) return;
      ({ sectionIdx, barIdx } = score.getNextSectionAndBarIdx({ sectionIdx, barIdx }));
      if ((sectionIdx === null) || (barIdx === null)) return;
      state.selectedBarsLast.sectionIdx = sectionIdx;
      state.selectedBarsLast.barIdx = barIdx;
    },

    decrementSelectedBarsFirstIdx(state, score) {
      let sectionIdx = state.selectedBarsFirst.sectionIdx;
      let barIdx = state.selectedBarsFirst.barIdx;
      if ((sectionIdx === null) || (barIdx === null)) return;
      ({ sectionIdx, barIdx } = score.getPreviousSectionAndBarIdx({ sectionIdx, barIdx }));
      if ((sectionIdx === null) || (barIdx === null)) return;
      state.selectedBarsFirst.sectionIdx = sectionIdx;
      state.selectedBarsFirst.barIdx = barIdx;
    },

    decrementSelectedBarsLastIdx(state, score) {
      let sectionIdx = state.selectedBarsLast.sectionIdx;
      let barIdx = state.selectedBarsLast.barIdx;
      if ((sectionIdx === null) || (barIdx === null)) return;
      if ((sectionIdx === state.selectedBarsFirst.sectionIdx) && (barIdx === state.selectedBarsFirst.barIdx)) return;
      ({ sectionIdx, barIdx } = score.getPreviousSectionAndBarIdx({ sectionIdx, barIdx }));
      if ((sectionIdx === null) || (barIdx === null)) return;
      state.selectedBarsLast.sectionIdx = sectionIdx;
      state.selectedBarsLast.barIdx = barIdx;
    },

    setCopiedBars(state, bars) {
      state.copiedBars = bars;
    },

    setConfig(state, config) {
      state.config.staffLineStepPx = config.staffLineStepPx;
      state.config.systemMarginTopPx = config.systemMarginTopPx;
      state.config.systemMarginBottomPx = config.systemMarginBottomPx;
      state.config.defaultGridNoteValue = config.defaultGridNoteValue;
      state.config.chordFontSizePx = config.chordFontSizePx;
      state.config.pageWidthOnPrintPx = config.pageWidthOnPrintPx;

      let configRawObj = new Object();
      configRawObj.staffLineStepPx = state.config.staffLineStepPx;
      configRawObj.systemMarginTopPx = state.config.systemMarginTopPx;
      configRawObj.systemMarginBottomPx = state.config.systemMarginBottomPx;
      configRawObj.defaultGridNoteValue = state.config.defaultGridNoteValue.getRawObj();
      configRawObj.chordFontSizePx = state.config.chordFontSizePx;
      configRawObj.defaultChord = state.config.defaultChord.getRawObj();
      configRawObj.defaultBarValue = state.config.defaultBarValue.getRawObj();
      configRawObj.defaultClef = state.config.defaultClef.getRawObj();
      configRawObj.defaultScale = state.config.defaultScale.getRawObj();
      configRawObj.defaultPartInBarTypes = state.config.defaultPartInBarTypes;
      configRawObj.selectedNoteColor = state.config.selectedNoteColor.getRawObj();
      configRawObj.pageWidthOnPrintPx = state.config.pageWidthOnPrintPx;
      window.localStorage.setItem('config', JSON.stringify(configRawObj));
    },
  },

  actions: {
    loadConfigFromCookie(context) {
      context.commit('loadConfigFromCookie');
    },

    selectBar(context, { sectionIdx, barIdx }) {
      context.commit('selectBar', { sectionIdx, barIdx });
    },

    unselectBar(context) {
      context.commit('unselectBar');
    },

    expandSelectedBars(context, { sectionIdx, barIdx }) {
      context.commit('expandSelectedBars', { sectionIdx, barIdx });
    },

    selectNextBar(context, score) {
      context.commit('selectNextBar', score);
    },

    selectPreviousBar(context, score) {
      context.commit('selectPreviousBar', score);
    },

    incrementSelectedBarsFirstIdx(context, score) {
      context.commit('incrementSelectedBarsFirstIdx', score);
    },

    incrementSelectedBarsLastIdx(context, score) {
      context.commit('incrementSelectedBarsLastIdx', score);
    },

    decrementSelectedBarsFirstIdx(context, score) {
      context.commit('decrementSelectedBarsFirstIdx', score);
    },

    decrementSelectedBarsLastIdx(context, score) {
      context.commit('decrementSelectedBarsLastIdx', score);
    },

    setCopiedBars(context, bars) {
      context.commit('setCopiedBars', bars);
    },

    setConfig(context, config) {
      context.commit('setConfig', config);
    },
  },
});

export default store;