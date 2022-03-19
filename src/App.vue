<template>
  <v-app id="app">
    <app-bar
      v-on:generate-new-score="$_generateNewScore"
      v-on:load="$_load"
      v-on:save="$_save"
      v-on:load-score-from-local-file="$_loadScoreFromLocalFile"
      v-on:open-global-config-dialog="$_openGlobalConfigDialog"
    />

    <v-main app>
      <score-page
        v-if="$_scoreLoaded && $data.$_renderComponent"
        v-bind:score="$data.$_score"
        v-on:generate-section="$_generateNewSection"
      />

      <component
        v-model="$data.$_dialog.show"
        v-bind:is="$data.$_dialog.componentName"
        v-bind="$data.$_dialog.props"
      />
    </v-main>

    <v-footer
      app outlined
      class="pa-0"
      v-if="$_scoreLoaded && $_isBarSelected"
    >
      <editor-component
        v-bind:score="$data.$_score"
        v-on:update-part="$_updatePart"
        v-on:insert-bar="$_insertBar"
        v-on:remove-bar="$_removeBar"
        v-on:replace-bar="$_replaceBar"
        v-on:insert-note="$_insertNote"
      />
    </v-footer>
  </v-app>
</template>

<script>
import GlobalConfigEditorDialog from '@/components/dialog/GlobalConfigEditorDialog.vue';
import GenerateSectionDialog from '@/components/dialog/GenerateSectionDialog.vue';
import Encoding from 'encoding-japanese';
import ScoreTextParser from '@/modules/ScoreTextParser.js';
import AppBar from '@/components/app_bar/AppBar.vue';
import ScorePage from '@/pages/ScorePage.vue';
import EditorComponent from '@/components/footer_editor/EditorComponent.vue';
import Score from '@/modules/Score.js';
import NoteValue from '@/modules/NoteValue.js';
import Scale from '@/modules/Scale.js';
import Bar from '@/modules/Bar.js';
import BarLine from '@/modules/BarLine.js';
import PartInBar from '@/modules/PartInBar.js';

/*
const scoreTextForDev = `
[サビ]
Bm7 CM7 D7  ||
`;
*/

const scoreTextForDev = `
[サビ]
||: Gsus2 | E7sus4 | F#m7 | Bm7 CM7 D7 |
Gsus2 | D | A | Bm7 ||
[間奏]
Gsus2 | D | A | Bm7 |
Gsus2 | D | A | Bm7 ||
[Aメロ]
Bm | Bm | G | G |
Bm | Bm | G | G ||
[Bメロ]
G7 | Bb7 | Bm7 | Bm7 |
G7 | Bb7 | C#7 | F#7 :||
`;

function generateEmptyBarFrom(baseBar) {
  return new Bar(
    baseBar.value,
    baseBar.parts.map(partInBar => {
      return new PartInBar(new Array(), partInBar.type, partInBar.restNotePitch);
    }),
    baseBar.clef,
    baseBar.scale,
    false,
    BarLine.Start.empty,
    BarLine.End.single,
  );
}

async function getFileInterface(accept = null) {
  return new Promise(resolve => {
    let inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.onchange = (event) => { resolve(event.target.files[0]) };
    if (accept) inputElement.accept = accept;
    inputElement.click();
  })
}

async function loadFileAsUTF8Text(fileInterface) {
  let textArrayBuffer = await new Promise(resolve => {
    let fileReader = new FileReader();
    fileReader.readAsArrayBuffer(fileInterface);
    fileReader.onload = (event) => { resolve(event.target.result) };
  })
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
    EditorComponent,
    GlobalConfigEditorDialog,
    GenerateSectionDialog,
  },

  mounted() {
    this.$data.$_score = ScoreTextParser.parse(
      scoreTextForDev,
      new NoteValue(4, 4), Scale.dMajor,
      new Score.Metadata('Test Song', 'Shisoziro', 'Shisoziro'),
    );
    this.$data.$_windowResizeObserver = new ResizeObserver(() => {
      this.$data.$_renderComponent = false;
      this.$nextTick(() => {
        this.$data.$_renderComponent = true;
      })
    });
    this.$data.$_windowResizeObserver.observe(document.documentElement);
  },

  destroyed() {
    this.$data.$_windowResizeObserver.unobserve(document.documentElement);
    this.$data.$_windowResizeObserver.disconnect();
  },

  errorCaptured(error) {
    console.log(this, this.$store.state);
    console.log(error, Object.keys(error));
  },

  data() {
    return {
      $_renderComponent: true,
      $_windowResizeObserver: null,
      $_score: null,
      $_isGlobalDialogConfig: false,
      $_dialog: {
        show: false,
        componentName: null,
        props: null,
      },
    };
  },

  computed: {
    $_scoreLoaded() {
      return (this.$data.$_score !== null);
    },

    $_selectedSectionIdx() {
      return this.$store.state.selectedSectionIdx;
    },

    $_selectedBarIdx() {
      return this.$store.state.selectedBarIdx;
    },

    $_numSections() {
      return this.$data.$_score.sections.length;
    },

    $_lastSection() {
      if (this.$_numSections === 0) return null;
      return this.$data.$_score.sections[this.$_numSections - 1];
    },

    $_lastBar() {
      if (this.$_lastSection === null) return null;
      let numBarsInLastSection = this.$_lastSection.bars.length;
      return this.$_lastSection.bars[numBarsInLastSection - 1];
    },

    $_isBarSelected() {
      if (this.$_selectedSectionIdx === null) return false;
      if (this.$_selectedBarIdx === null) return false;
      return true;
    },
  },

  methods: {
    $_generateNewScore() {
      this.$data.$_score = Score.generateNew();
    },

    $_generateNewSection(sectionIdx) {
      let baseSectionIdx = null;
      let numSection = this.$data.$_score.sections.length;
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
        let baseSection = this.$data.$_score.sections[baseSectionIdx];
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
            console.log(section, this.$data.$_score);
            this.$data.$_score.sections.splice(sectionIdx, 0, section);
          },
        }
      );
    },

    async $_loadScoreFromLocalFile() {
      let fileInterface = await getFileInterface();
      let scoreText = await loadFileAsUTF8Text(fileInterface);
      this.$data.$_score = ScoreTextParser.parse(
        scoreText,
        this.$store.state.config.defaultBarValue,
        this.$store.state.config.defaultScale,
      );
    },

    async $_load() {
      let fileInterface = await getFileInterface('application/json');
      let scoreJsonString = await loadFileAsUTF8Text(fileInterface);
      this.$data.$_score = Score.loadJson(scoreJsonString);
    },

    async $_save() {
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

    $_openDialog(dialogComponentName, props = {}) {
      this.$data.$_dialog.componentName = dialogComponentName;
      this.$data.$_dialog.show = true;
      this.$data.$_dialog.props = props;
    },

    $_openGlobalConfigDialog() {
      this.$_openDialog('global-config-editor-dialog');
    },

    $_getNextSectionAndBarIdx({ sectionIdx, barIdx }) {
      return this.$data.$_score.getNextSectionAndBarIdx({ sectionIdx, barIdx });
    },

    $_getPreviousSectionAndBarIdx({ sectionIdx, barIdx }) {
      return this.$data.$_score.getPreviousSectionAndBarIdx({ sectionIdx, barIdx });
    },

    $_updatePart(sectionIdx, barIdx, partIdx, part) {
      this.$set(this.$data.$_score.sections[sectionIdx].bars[barIdx].parts, partIdx, part);
    },

    $_insertNote(sectionIdx, barIdx, partIdx, noteIdx, note) {
      this.$data.$_score.sections[sectionIdx].bars[barIdx].parts[partIdx].notes.splice(noteIdx, 0, note);
    },

    async $_insertBar(sectionIdx, baseBarIdx, barIdx) {
      let baseBar = this.$data.$_score.sections[sectionIdx].bars[baseBarIdx];
      let emptyBar = generateEmptyBarFrom(baseBar);
      this.$data.$_score.sections[sectionIdx].bars.splice(barIdx, 0, emptyBar);
      await this.$store.dispatch('selectBar', { sectionIdx, barIdx });
    },

    async $_removeBar(sectionIdx, barIdx) {
      if (barIdx === (this.$data.$_score.sections[sectionIdx].bars.length - 1)) {
        await this.$store.dispatch('selectBar', this.$_getPreviousSectionAndBarIdx({ sectionIdx, barIdx }));
      }
      this.$delete(this.$data.$_score.sections[sectionIdx].bars, barIdx);
      if (this.$data.$_score.sections[sectionIdx].bars.length === 0) {
        this.$data.$_score.sections.splice(sectionIdx, 1);
      }
    },

    $_replaceBar(sectionIdx, barIdx, bar) {
      this.$set(this.$data.$_score.sections[sectionIdx].bars, barIdx, bar);
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
