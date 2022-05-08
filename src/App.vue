<template>
  <v-app id="app">
    <app-bar
      v-if="!$data.$_isPrintLayoutEnabled"
      v-bind:is-undo-disabled="$data.$_isUndoDisabled"
      v-bind:is-redo-disabled="$data.$_isRedoDisabled"
    />

    <v-main app ref="main">
      <template v-if="$_isScoreLoaded && $data.$_renderComponent">
        <score-page
          v-for="(scorePageDefinition, scorePageDefinitionIdx) of $_scorePageDefinitions"
          v-bind:key="scorePageDefinitionIdx"
          v-bind:score="$data.$_score"
          v-bind:score-page-definition="scorePageDefinition"
          v-bind:score-page-index="scorePageDefinitionIdx"
          v-bind:num-score-pages="$_numScorePages"
          v-bind:is-print-layout-enabled="$data.$_isPrintLayoutEnabled"
        />

      </template>
      
      <component
        v-model="$data.$_dialog.shows"
        v-bind:is="$data.$_dialog.componentName"
        v-bind="$data.$_dialog.props"
      />
    </v-main>

    <snack-bar
      v-model="$data.$_snackBar.shows"
      v-bind:message="$data.$_snackBar.message"
    />

    <v-footer
      app outlined class="pa-0"
      ref="footer"
      v-show="$_isScoreLoaded && $_isBarSelected && !$data.$_isPrintLayoutEnabled"
    >
      <v-toolbar dark dense height="20">
        <v-spacer />
        <v-btn
          small icon
          v-on:click="$_toggleFooterEditorMaximizedAndMinimized"
        >
          <v-icon v-if="$data.$_isFooterEditorMinimized">
            mdi-window-maximize
          </v-icon>
          <v-icon v-else>
            mdi-window-minimize
          </v-icon>
        </v-btn>
      </v-toolbar>

      <editor-component
        v-if="$_isBarSelected && !$data.$_isFooterEditorMinimized"
        v-bind:score="$data.$_score"
        v-on:register-component="$_registerFooterComponentInstance"
      />
    </v-footer>
  </v-app>
</template>

<script>
import GlobalConfigEditorDialog from './components/dialog/GlobalConfigEditorDialog.vue';
import ScoreMetadataEditorDialog from './components/dialog/ScoreMetadataEditorDialog.vue';
import SectionEditorDialog from './components/dialog/SectionEditorDialog.vue';
import GenerateSectionDialog from './components/dialog/GenerateSectionDialog.vue';
import AppInfoDialog from './components/dialog/AppInfoDialog.vue';
import HelpDialog from './components/dialog/HelpDialog.vue';
import Encoding from 'encoding-japanese';
import ScoreTextParser from './modules/ScoreTextParser.js';
import AppBar from './components/app_bar/AppBar.vue';
import ScorePage from './pages/ScorePage.vue';
import { ScorePageDefinition } from './pages/ScorePage.vue';
import SnackBar from './components/snack_bar/SnackBar.vue';
import EditorComponent from './components/footer_editor/EditorComponent.vue';
import Score from './modules/Score.js';
import Bar from './modules/Bar.js';
import BarRepeatEnding from './modules/BarRepeatEnding.js';
import BarBreak from './modules/BarBreak.js';
import BarLine from './modules/BarLine.js';
import PartInBar from './modules/PartInBar.js';
import ScoreSnapshotManager from './modules/ScoreSnapshotManager.js';
import { keyEventTypeEnum, getKeyEventType } from './modules/KeyEventType.js';
import cookie_utils from './modules/cookie_utils.js';

function generateEmptyBarFrom(baseBar) {
  return new Bar(
    baseBar.value,
    baseBar.parts.map(partInBar => {
      return new PartInBar(new Array(), partInBar.type, partInBar.restNotePitch);
    }),
    baseBar.clef,
    baseBar.scale,
    BarBreak.empty,
    BarLine.Start.empty,
    BarLine.End.single,
    BarRepeatEnding.empty,
  );
}

async function getFileInterface(accept = null) {
  return new Promise(resolve => {
    let inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.onchange = (event) => { resolve(event.target.files[0]) };
    if (accept) inputElement.accept = accept;
    let windowFocusEventHandler = () => {
      let timeoutId = window.setTimeout(
        () => {
          window.removeEventListener('focus', windowFocusEventHandler);
          window.clearTimeout(timeoutId);
          resolve(null);
        },
        1000,
      );
    };
    window.addEventListener('focus', windowFocusEventHandler);
    inputElement.click();
  })
}

async function loadFileAsUTF8Text(fileInterface) {
  let textArrayBuffer = await new Promise((resolve, reject) => {
    let fileReader = new FileReader();
    fileReader.onload = (event) => { resolve(event.target.result) };
    fileReader.onabort = () => { reject(null) };
    fileReader.readAsArrayBuffer(fileInterface);
  })
  if (textArrayBuffer === null) return null;
  let textUtf8Array = new Uint8Array(textArrayBuffer);
  let textEncoding = Encoding.detect(textUtf8Array);
  let textUint8Array = new Uint8Array(Encoding.convert(textUtf8Array, 'UTF8', textEncoding));
  let textDecoder = new TextDecoder();
  return textDecoder.decode(textUint8Array.buffer);
}

export default {
  name: 'App',

  components: {
    AppBar,
    ScorePage,
    SnackBar,
    EditorComponent,
    GlobalConfigEditorDialog,
    ScoreMetadataEditorDialog,
    SectionEditorDialog,
    GenerateSectionDialog,
    AppInfoDialog,
    HelpDialog,
  },

  watch: {
    score: {
      async handler(newScore) {
        if (newScore === null) {
          let scoreJsonFromCookie = cookie_utils.getCookie('score');
          if (scoreJsonFromCookie === null) {
            await this.$_generateNewScore();
          } else {
            let scoreFromCookie = Score.loadJson(scoreJsonFromCookie);
            this.$_setNewScore(scoreFromCookie);
          }
        } else {
          this.$_setNewScore(newScore);
        }
      },
      immediate: true,
      deep: true,
    },

    '$data.$_score': {
      handler() {
        this.$data.$_isUndoDisabled = ScoreSnapshotManager.isFirstSnapshot();
        this.$data.$_isRedoDisabled = ScoreSnapshotManager.isLastSnapshot();
      },
      deep: true,
    },
  },

  created() {
    window.addEventListener('keydown', this.$_onKeydown);
  },

  async mounted() {
    this.$data.$_windowResizeObserver = new ResizeObserver(this.$_rerenderScore);
    this.$data.$_windowResizeObserver.observe(document.documentElement);
    this.$data.$_footerResizeObserver = new ResizeObserver(resizeObserverEntries => {
      let resizeObserverEntry = resizeObserverEntries[0];
      let borderBoxSize = resizeObserverEntry.borderBoxSize[0];
      this.$refs.main.$el.style.paddingBottom = String(borderBoxSize.blockSize) + 'px';
    });
    this.$data.$_footerResizeObserver.observe(this.$refs.footer.$el);
    await this.$store.dispatch('loadConfigFromCookie');
  },

  beforeDestroy() {
    this.$data.$_footerResizeObserver.unobserve(this.$refs.footer.$el);
    this.$data.$_footerResizeObserver.disconnect();
    this.$data.$_windowResizeObserver.unobserve(document.documentElement);
    this.$data.$_windowResizeObserver.disconnect();
  },

  errorCaptured(error) {
    console.log(this, this.$store.state);
    console.log(error, Object.keys(error));
  },

  props: {
    score: { type: Score, default: null },
  },

  data() {
    return {
      $_renderComponent: true,
      $_windowResizeObserver: null,
      $_footerResizeObserver: null,
      $_footerComponentInstance: null,
      $_score: null,
      $_dialog: {
        shows: false,
        componentName: null,
        props: null,
      },
      $_snackBar: {
        shows: false,
        message: null,
      },
      $_isFooterEditorMinimized: true,
      $_isUndoDisabled: true,
      $_isRedoDisabled: true,
      $_isPrintLayoutEnabled: false,
    };
  },

  computed: {
    $_isScoreLoaded() {
      return (this.$data.$_score !== null);
    },

    $_selectedBarsFirst() {
      return this.$store.state.selectedBarsFirst;
    },

    $_selectedBarsLast() {
      return this.$store.state.selectedBarsLast;
    },

    $_scorePageDefinitions() {
      let scorePageDefinitions = new Array();
      let sectionIdx = 0;
      let barIdx = 0;
      let pageFirstSectionIdx = null;
      let pageFirstBarIdx = null;
      while ((sectionIdx !== null) && (barIdx !== null)) {
        if (pageFirstSectionIdx === null) pageFirstSectionIdx = sectionIdx;
        if (pageFirstBarIdx === null) pageFirstBarIdx = barIdx;
        let bar = this.$data.$_score.getBar(sectionIdx, barIdx);
        if ((bar !== null) && (bar.break === BarBreak.page)) {
          let pageLastSectionIdx = sectionIdx;
          let pageLastBarIdx = barIdx;
          scorePageDefinitions.push(
            new ScorePageDefinition(
              pageFirstSectionIdx,
              pageFirstBarIdx,
              pageLastSectionIdx,
              pageLastBarIdx,
            ),
          );
          pageFirstSectionIdx = null;
          pageFirstBarIdx = null;
        }
        ({ sectionIdx, barIdx } = this.$data.$_score.getNextSectionAndBarIdx({ sectionIdx, barIdx }));
      }
      if ((pageFirstSectionIdx !== null) && (pageFirstBarIdx !== null)) {
        let pageLastSectionIdx = this.$_lastSectionIdx;
        let pageLastBarIdx = this.$_lastBarIdx;
        scorePageDefinitions.push(
          new ScorePageDefinition(
            pageFirstSectionIdx,
            pageFirstBarIdx,
            pageLastSectionIdx,
            pageLastBarIdx,
          ),
        );
      }
      return scorePageDefinitions;
    },

    $_numScorePages() {
      return this.$_scorePageDefinitions.length;
    },

    $_lastSectionIdx() {
      if (!this.$_isScoreLoaded) return null;
      return this.$data.$_score.lastSectionIdx;
    },

    $_lastBarIdx() {
      if (!this.$_isScoreLoaded) return null;
      return this.$data.$_score.getLastBarIdx(this.$_lastSectionIdx);
    },

    $_isBarSelected() {
      if (this.$_selectedBarsFirst.sectionIdx === null) return false;
      if (this.$_selectedBarsFirst.barIdx === null) return false;
      return true;
    },
  },

  provide() {
    return {
      undo: this.$_undo,

      redo: this.$_redo,

      generateNewScore: this.$_generateNewScore,

      loadScoreFile: async () => {
        let fileInterface = await getFileInterface('application/json');
        if (fileInterface === null) return;
        let scoreJsonString = await loadFileAsUTF8Text(fileInterface);
        if (scoreJsonString === null) return;
        let score = Score.loadJson(scoreJsonString);
        this.$_setNewScore(score);
      },

      loadScoreFromTextFile: async () => {
        let fileInterface = await getFileInterface();
        let scoreText = await loadFileAsUTF8Text(fileInterface);
        if (scoreText === null) return;
        let score = ScoreTextParser.parse(
          scoreText,
          this.$store.state.config.defaultBarValue,
          this.$store.state.config.defaultScale,
        );
        this.$_setNewScore(score);
      },

      saveScoreFile: this.$_saveScoreFile,

      generateNewSection: this.$_generateNewSection,

      updatePart: (sectionIdx, barIdx, partIdx, part) => {
        let currentPart = this.$data.$_score.getPart(sectionIdx, barIdx, partIdx);
        if (currentPart.isEqualTo(part)) return;
        let bar = this.$data.$_score.getBar(sectionIdx, barIdx);
        this.$set(bar.parts, partIdx, part);
        this.$_registerScoreSnapshot();
      },

      insertNote: (sectionIdx, barIdx, partIdx, noteIdx, note) => {
        let part = this.$data.$_score.getPart(sectionIdx, barIdx, partIdx);
        part.notes.splice(noteIdx, 0, note);
        this.$_registerScoreSnapshot();
      },

      insertBar: this.$_insertBar,

      removeBars: this.$_removeBars,

      copyBars: this.$_copyBars,

      pasteBars: this.$_pasteBars,

      pasteBarsPartOnly: this.$_pasteBarsPartOnly,

      replaceBars: this.$_replaceBars,

      replaceNote: (sectionIdx, barIdx, partIdx, noteIdx, note) => {
        let part = this.$data.$_score.getPart(sectionIdx, barIdx, partIdx);
        this.$set(part.notes, noteIdx, note);
        this.$_registerScoreSnapshot();
      },

      unselectBar: this.$_unselectBar,

      selectBar: this.$_selectBar,

      expandSelectedBars: this.$_expandSelectedBars,

      selectPreviousBar: this.$_selectPreviousBar,

      selectNextBar: this.$_selectNextBar,

      openGlobalConfigEditorDialog: () => {
        this.$_openDialog('global-config-editor-dialog');
      },

      openScoreMetadataEditorDialog: () => {
        this.$_openDialog(
          'score-metadata-editor-dialog',
          {
            callback: metadata => {
              this.$set(this.$data.$_score, 'metadata', metadata);
              this.$_registerScoreSnapshot();
            },
            metadata: this.$data.$_score.metadata,
          }
        );
      },

      openSectionEditorDialog: (sectionIdx) => {
        this.$_openDialog(
          'section-editor-dialog',
          {
            callback: ({ sectionName }) => {
              this.$set(this.$data.$_score.sections[sectionIdx], 'name', sectionName);
              this.$_registerScoreSnapshot();
            },
            score: this.$data.$_score,
            sectionIdx: sectionIdx,
          },
        );
      },

      setPrintLayoutEnabled: this.$_setPrintLayoutEnabled,

      showInfoDialog: () => {
        this.$_openDialog('app-info-dialog');
      },

      showHelpDialog: this.$_showHelpDialog,
    };
  },

  methods: {
    $_rerenderScore() {
      this.$data.$_renderComponent = false;
      this.$nextTick(() => {
        this.$data.$_renderComponent = true;
      })
    },

    async $_generateNewScore() {
      let score = Score.generateNew('Untitled', '', '');
      await this.$_unselectBar();
      this.$_setNewScore(score);
    },

    $_setNewScore(score) {
      this.$_setScore(score);
      ScoreSnapshotManager.register(score);
    },

    $_setScore(score) {
      this.$set(this.$data, '$_score', score);
      cookie_utils.setCookie('score', this.$data.$_score.dumpJson());
    },

    $_saveScoreFile() {
      let scoreJson = this.$data.$_score.dumpJson();
      let url = URL.createObjectURL(new Blob([ scoreJson ], { type: 'text/plain' }));
      let anchor = document.createElement('a');
      document.body.appendChild(anchor);
      anchor.download = this.$data.$_score.metadata.title + '.json';
      anchor.href = url;
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    },

    $_registerScoreSnapshot() {
      ScoreSnapshotManager.register(this.$data.$_score);
      cookie_utils.setCookie('score', this.$data.$_score.dumpJson());
    },

    $_openDialog(dialogComponentName, props = {}) {
      this.$data.$_dialog.componentName = dialogComponentName;
      this.$data.$_dialog.shows = true;
      this.$data.$_dialog.props = props;
    },

    $_showSnackBar(message) {
      console.log(message);
      this.$data.$_snackBar.shows = true;
      this.$data.$_snackBar.message = message;
    },

    $_showHelpDialog() {
      this.$_openDialog('help-dialog');
    },

    $_toggleFooterEditorMaximizedAndMinimized() {
      this.$data.$_isFooterEditorMinimized = !this.$data.$_isFooterEditorMinimized;
    },

    async $_undo() {
      let score = ScoreSnapshotManager.undo();
      if (score) {
        this.$_setScore(score);
        await this.$_unselectBar();
      }
    },

    async $_redo() {
      let score = ScoreSnapshotManager.redo();
      if (score) {
        this.$_setScore(score);
        await this.$_unselectBar();
      }
    },

    async $_insertBar(sectionIdx, baseBarIdx, barIdx) {
      let baseBar = this.$data.$_score.getBar(sectionIdx, baseBarIdx);
      let emptyBar = generateEmptyBarFrom(baseBar);
      this.$data.$_score.getSection(sectionIdx).bars.splice(barIdx, 0, emptyBar);
      this.$_registerScoreSnapshot();
      if (this.$_selectedBarsLast.sectionIdx === sectionIdx) {
        if (this.$_selectedBarsLast.barIdx >= barIdx) {
          await this.$store.dispatch('incrementSelectedBarsLastIdx', this.$data.$_score);
        }
      }
      if (this.$_selectedBarsFirst.sectionIdx === sectionIdx) {
        if (this.$_selectedBarsFirst.barIdx >= barIdx) {
          await this.$store.dispatch('incrementSelectedBarsFirstIdx', this.$data.$_score);
        }
      }
    },

    async $_removeBars(firstSectionIdx, firstBarIdx, lastSectionIdx, lastBarIdx) {
      await this.$data.$_score.reverseIterateBars(
        firstSectionIdx,
        firstBarIdx,
        lastSectionIdx,
        lastBarIdx,
        async (sectionIdx, barIdx) => {
          if (this.$_selectedBarsFirst.sectionIdx === sectionIdx) {
            if (this.$_selectedBarsFirst.barIdx > barIdx) {
              await this.$store.dispatch('decrementSelectedBarsFirstIdx', this.$data.$_score);
            }
          }
          if (this.$_selectedBarsLast.sectionIdx === sectionIdx) {
            if (this.$_selectedBarsLast.barIdx >= barIdx) {
              await this.$store.dispatch('decrementSelectedBarsLastIdx', this.$data.$_score);
            }
          }
          let section = this.$data.$_score.getSection(sectionIdx);
          section.bars.splice(barIdx, 1);
          if (section.bars.length === 0) {
            this.$data.$_score.sections.splice(sectionIdx, 1);
          }
        },
      );
      this.$_registerScoreSnapshot();
    },

    async $_copyBars(firstSectionIdx, firstBarIdx, lastSectionIdx, lastBarIdx) {
      let copiedBars = this.$data.$_score
        .getBars(firstSectionIdx, firstBarIdx, lastSectionIdx, lastBarIdx)
        .map(bar => (bar.clone()));
      await this.$store.dispatch('setCopiedBars', copiedBars);
    },

    $_pasteBars(sectionIdx, barIdx) {
      this.$_replaceBars(sectionIdx, barIdx, this.$store.state.copiedBars);
    },

    $_pasteBarsPartOnly(firstSectionIdx, firstBarIdx) {
      let sectionIdx = firstSectionIdx;
      let barIdx = firstBarIdx;
      let copiedBarsPartOnly = new Array();
      for (let copiedBar of this.$store.state.copiedBars) {
        let bar = this.$data.$_score.getBar(sectionIdx, barIdx);
        let copiedBarPartOnly = bar.clone();
        copiedBarPartOnly.parts = copiedBar.parts.map(part => part.clone());
        ({ sectionIdx, barIdx } = this.$data.$_score.getNextSectionAndBarIdx({ sectionIdx, barIdx }));
        if ((sectionIdx === null) || (barIdx === null)) break;
        copiedBarsPartOnly.push(copiedBarPartOnly);
      }
      this.$_replaceBars(firstSectionIdx, firstBarIdx, copiedBarsPartOnly);
    },

    $_replaceBars(sectionIdx, barIdx, bars) {
      for (let bar of bars) {
        let section = this.$data.$_score.getSection(sectionIdx);
        this.$set(section.bars, barIdx, bar);
        ({ sectionIdx, barIdx } = this.$data.$_score.getNextSectionAndBarIdx({ sectionIdx, barIdx }));
        if ((sectionIdx === null) || (barIdx === null)) break;
      }
      this.$_registerScoreSnapshot();
    },

    async $_selectBar(sectionIdx, barIdx) {
      await this.$store.dispatch('selectBar', { sectionIdx, barIdx });
    },

    async $_unselectBar() {
      await this.$store.dispatch('unselectBar');
    },

    async $_selectPreviousBar() {
      await this.$store.dispatch('selectPreviousBar', this.$data.$_score);
    },

    async $_selectNextBar() {
      await this.$store.dispatch('selectNextBar', this.$data.$_score);
    },

    async $_expandSelectedBars(sectionIdx, barIdx) {
      await this.$store.dispatch('expandSelectedBars', { sectionIdx, barIdx });
    },

    $_generateNewSection(sectionIdx) {
      let baseSectionIdx = null;
      let numSection = this.$data.$_score.numSections;
      if (sectionIdx > 0)  {
        baseSectionIdx = sectionIdx - 1;
      } else if (numSection > 0)  {
        baseSectionIdx = 0;
      }
      let barValue = null;
      let clef = null;
      let scale = null;
      let partInBarTypes = null;
      if (baseSectionIdx !== null) {
        let baseSection = this.$data.$_score.getSection(baseSectionIdx);
        let numBarsInBaseSection = baseSection.bars.length;
        let baseBar = baseSection.bars[numBarsInBaseSection - 1];
        barValue = baseBar.value;
        clef = baseBar.clef;
        scale = baseBar.scale;
        partInBarTypes = baseBar.parts.map(part => part.type);
      }
      this.$_openDialog(
        'generate-section-dialog',
        {
          barValue,
          clef,
          scale,
          partInBarTypes,
          callback: (section) => {
            this.$data.$_score.sections.splice(sectionIdx, 0, section);
            this.$_registerScoreSnapshot();
          },
        }
      );
    },

    $_registerFooterComponentInstance(footerComponentInstance) {
      this.$data.$_footerComponentInstance = footerComponentInstance;
    },

    $_setPrintLayoutEnabled(enabled) {
      this.$data.$_isPrintLayoutEnabled = enabled;
      if (enabled) {
        this.$_showSnackBar('Press any key to exit print layout.');
      }
    },

    async $_onKeydown(event) {
      let keyEventType = getKeyEventType(event);
      if (this.$data.$_footerComponentInstance !== null) {
        if (this.$data.$_footerComponentInstance.onKeydown(keyEventType, event)) return;
      }
      if (this.$data.$_isPrintLayoutEnabled) {
        this.$_setPrintLayoutEnabled(false);
        return;
      }
      switch (keyEventType) {
        case keyEventTypeEnum.key:
          switch (event.code) {
            case 'Escape':
              await this.$_unselectBar();
              break;
            case 'ArrowRight':
              await this.$_selectNextBar();
              break;
            case 'ArrowLeft':
              await this.$_selectPreviousBar();
              break;
            case 'Enter':
              setBarBreak(this, BarBreak.system);
              break;
            case 'Backspace':
              setBarBreak(this, BarBreak.empty);
              break;
            case 'Delete':
              removeSelectedBars(this);
              break;
            case 'KeyH':
              this.$_showHelpDialog();
              break;
            case 'KeyE':
              this.$_toggleFooterEditorMaximizedAndMinimized();
              break;
            case 'KeyP':
              this.$_setPrintLayoutEnabled(true);
              break;
          }
          break;
        case keyEventTypeEnum.keyWithCtrl:
          switch (event.code) {
            case 'KeyA':
              await selectAllBars(this);
              break;
            case 'KeyC':
              await copySelectedBars(this);
              break;
            case 'KeyV':
              await pasteSelectedBarPartOnly(this);
              break;
            case 'KeyZ':
              await this.$_undo();
              break;
            case 'KeyS':
              await this.$_saveScoreFile();
              break;
            case 'KeyN':
              await insertBarAfter(this);
              break;
            case 'KeyM':
              insertSectionAfter(this);
              break;
          }
          break;
        case keyEventTypeEnum.keyWithShift:
          switch (event.code) {
            case 'ArrowRight':
              await incrementSelectedBarsLastIdx(this);
              break;
            case 'ArrowLeft':
              await decrementSelectedBarsLastIdx(this);
              break;
            case 'Enter':
              setBarBreak(this, BarBreak.page);
              break;
          }
          break;
        case keyEventTypeEnum.keyWithCtrlAndShift:
          switch (event.code) {
            case 'KeyV':
              await pasteSelectedBar(this);
              break;
            case 'KeyZ':
              await this.$_redo();
              break;
            case 'KeyN':
              await insertBarBefore(this);
              break;
            case 'KeyM':
              insertSectionBefore(this);
              break;
            case 'ArrowRight':
              await incrementSelectedBarsFirstIdx(this);
              break;
            case 'ArrowLeft':
              await decrementSelectedBarsFirstIdx(this);
              break;
          }
          break;
        case keyEventTypeEnum.repeatedKey:
          switch (event.code) {
            case 'ArrowRight':
              await this.$_selectNextBar();
              break;
            case 'ArrowLeft':
              await this.$_selectPreviousBar();
              break;
          }
          break;
        case keyEventTypeEnum.repeatedKeyWithCtrl:
          break;
        case keyEventTypeEnum.repeatedKeyWithShift:
          switch (event.code) {
            case 'ArrowRight':
              await incrementSelectedBarsLastIdx(this);
              break;
            case 'ArrowLeft':
              await decrementSelectedBarsLastIdx(this);
              break;
          }
          break;
        case keyEventTypeEnum.repeatedKeyWithCtrlAndShift:
          switch (event.code) {
            case 'ArrowRight':
              await incrementSelectedBarsFirstIdx(this);
              break;
            case 'ArrowLeft':
              await decrementSelectedBarsFirstIdx(this);
              break;
          }
          break;
      }

      async function selectAllBars(self) {
        if (self.$data.$_score.numSections === 0) return;
        let firstSectionIdx = self.$data.$_score.firstSectionIdx;
        let firstBarIdx = self.$data.$_score.getFirstBarIdx(firstSectionIdx);
        await self.$_selectBar(firstSectionIdx, firstBarIdx);
        let lastSectionIdx = self.$data.$_score.lastSectionIdx;
        let lastBarIdx = self.$data.$_score.getLastBarIdx(lastSectionIdx);
        await self.$_expandSelectedBars(lastSectionIdx, lastBarIdx);
      }

      async function incrementSelectedBarsLastIdx(self) {
        await self.$store.dispatch('incrementSelectedBarsLastIdx', self.$data.$_score);
      }

      async function decrementSelectedBarsLastIdx(self) {
        await self.$store.dispatch('decrementSelectedBarsLastIdx', self.$data.$_score);
      }

      async function incrementSelectedBarsFirstIdx(self) {
        await self.$store.dispatch('incrementSelectedBarsFirstIdx', self.$data.$_score);
      }

      async function decrementSelectedBarsFirstIdx(self) {
        await self.$store.dispatch('decrementSelectedBarsFirstIdx', self.$data.$_score);
      }

      function setBarBreak(self, barBreakType) {
        if (!self.$_isBarSelected) return;
        let { sectionIdx: previousSectionIdx, barIdx: previousBarIdx } = self.$data.$_score.getPreviousSectionAndBarIdx({
          sectionIdx: self.$_selectedBarsFirst.sectionIdx,
          barIdx: self.$_selectedBarsFirst.barIdx,
        });
        if ((previousSectionIdx === null) || (previousBarIdx === null)) return;
        let bar = self.$data.$_score.getBar(previousSectionIdx, previousBarIdx);
        bar.break = barBreakType;
        self.$_replaceBars(previousSectionIdx, previousBarIdx, [ bar ]);
      }

      async function copySelectedBars(self) {
        if (!self.$_isBarSelected) return;
        await self.$_copyBars(
          self.$_selectedBarsFirst.sectionIdx,
          self.$_selectedBarsFirst.barIdx,
          self.$_selectedBarsLast.sectionIdx,
          self.$_selectedBarsLast.barIdx,
        );
      }

      async function pasteSelectedBar(self) {
        if (!self.$_isBarSelected) return;
        await self.$_pasteBars(
          self.$_selectedBarsFirst.sectionIdx,
          self.$_selectedBarsFirst.barIdx,
        );
      }

      async function pasteSelectedBarPartOnly(self) {
        if (!self.$_isBarSelected) return;
        await self.$_pasteBarsPartOnly(
          self.$_selectedBarsFirst.sectionIdx,
          self.$_selectedBarsFirst.barIdx,
        );
      }

      async function insertBarBefore(self) {
        if (!self.$_isBarSelected) return;
        await self.$_insertBar(
          self.$_selectedBarsFirst.sectionIdx,
          self.$_selectedBarsFirst.barIdx,
          self.$_selectedBarsFirst.barIdx,
        );
      }

      async function insertBarAfter(self) {
        if (!self.$_isBarSelected) return;
        await self.$_insertBar(
          self.$_selectedBarsLast.sectionIdx,
          self.$_selectedBarsLast.barIdx,
          self.$_selectedBarsLast.barIdx + 1,
        );
      }

      function insertSectionBefore(self) {
        let sectionIdx = self.$_selectedBarsFirst.sectionIdx;
        if (sectionIdx === null) sectionIdx = self.$data.$_score.firstSectionIdx;
        self.$_generateNewSection(sectionIdx);
      }

      function insertSectionAfter(self) {
        let sectionIdx = self.$_selectedBarsLast.sectionIdx;
        if (sectionIdx === null) sectionIdx = self.$data.$_score.lastSectionIdx;
        self.$_generateNewSection(sectionIdx + 1);
      }

      async function removeSelectedBars(self) {
        let selectedBarsFirst = self.$_selectedBarsFirst;
        let selectedBarsLast = self.$_selectedBarsLast;
        self.$_removeBars(
          selectedBarsFirst.sectionIdx,
          selectedBarsFirst.barIdx,
          selectedBarsLast.sectionIdx,
          selectedBarsLast.barIdx,
        );
      }
    },
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@300&display=swap');

#app {
  font-family: 'M PLUS 1p', sans-serif;
  text-align: center;
  color: #2c3e50;
}
</style>
