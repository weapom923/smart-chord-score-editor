import Vue from 'vue'
import Vuex from 'vuex'
import NoteValue from '../modules/NoteValue.js'
import Chord from '../modules/Chord.js'
import Color from '../modules/Color.js'

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    score: null,
    selectedSectionIdx: null,
    selectedBarIdx: null,
    config: {
      staffLineStepPx: 10,
      systemMarginTopPx: 30,
      systemMarginBottomPx: 10,
      gridNoteValue: NoteValue.divisible.half,
      chordFontSizePx: 18,
      defaultChord: new Chord(Chord.Root.a, Chord.Triad.major),
      selectedNoteColor: new Color(42, 118, 210, 1),
    },
  },

  mutations: {
    setScore(state, score) {
      state.score = score;
    },

    resetSelectedSectionIdxAndBarIdx(state) {
      state.selectedSectionIdx = null;
      state.selectedBarIdx = null;
    },

    setSelectedSectionIdxAndBarIdx(state, [ sectionIdx, barIdx ]) {
      state.selectedSectionIdx = sectionIdx;
      state.selectedBarIdx = barIdx;
    },

    incrementSelectedBarIdx(state) {
      let score = state.score;
      let selectedSectionIdx = state.selectedSectionIdx;
      let selectedBarIdx = state.selectedBarIdx;
      if (score === null) return;
      let numSections = score.sections.length;
      let numSelectedSectionBars = score.sections[selectedSectionIdx].bars.length;
      let incrementedSelectedBarIdx = selectedBarIdx + 1;
      if (incrementedSelectedBarIdx === numSelectedSectionBars) {
        let incrementedSelectedSectionIdx = selectedSectionIdx + 1;
        if (incrementedSelectedSectionIdx === numSections) return;
        state.selectedBarIdx = 0;
        state.selectedSectionIdx = incrementedSelectedSectionIdx;
      } else {
        state.selectedBarIdx = incrementedSelectedBarIdx;
      }
    },

    decrementSelectedBarIdx(state) {
      let score = state.score;
      let selectedSectionIdx = state.selectedSectionIdx;
      let selectedBarIdx = state.selectedBarIdx;
      if (score === null) return;
      let decrementedSelectedBarIdx = selectedBarIdx - 1;
      if (decrementedSelectedBarIdx === -1) {
        let decrementedSelectedSectionIdx = selectedSectionIdx - 1;
        if (decrementedSelectedSectionIdx === -1) return;
        state.selectedBarIdx = score.sections[decrementedSelectedSectionIdx].bars.length - 1;
        state.selectedSectionIdx = decrementedSelectedSectionIdx;
      } else {
        state.selectedBarIdx = decrementedSelectedBarIdx;
      }
    },
  },

  actions: {
    setScore(context, score) {
      context.commit('setScore', score);
    },

    selectBar(context, args) {
      let sectionIdx = args[0];
      let barIdx = args[1];
      context.commit('setSelectedSectionIdxAndBarIdx', [ sectionIdx, barIdx ]);
    },

    unselectBar(context) {
      context.commit('resetSelectedSectionIdxAndBarIdx');
    },

    selectNextBar(context) {
      context.commit('incrementSelectedBarIdx');
    },

    selectPreviousBar(context) {
      context.commit('decrementSelectedBarIdx');
    },
  },

  modules: {},
});

export default store;