<template>
  <v-app id="app">
    <v-app-bar app fixed dark dense>
      <v-btn small text v-on:click="$_load">
        <v-icon>mdi-folder-open</v-icon>load
      </v-btn>

      <v-btn small text v-on:click="$_save">
        <v-icon>mdi-content-save</v-icon>save
      </v-btn>

      <v-btn small text v-on:click="$_loadScoreFromLocalFile">
        <v-icon>mdi-import</v-icon>import from text
      </v-btn>
    </v-app-bar>

    <v-main app>
      <score-page v-if="$data.$_renderComponent" />
    </v-main>

    <v-footer
      app outlined
      class="pa-0"
      v-if="$_isBarSelected"
    >
      <editor-component
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
import Encoding from 'encoding-japanese';
import ScoreTextParser from './modules/ScoreTextParser.js';
import ScorePage from './pages/ScorePage.vue';
import EditorComponent from './components/EditorComponent.vue';
import Score from './modules/Score.js';
import NoteValue from './modules/NoteValue.js';
import Scale from './modules/Scale.js';
import Bar from './modules/Bar.js';
import BarLine from './modules/BarLine.js';
import PartInBar from './modules/PartInBar.js';

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
    ScorePage,
    EditorComponent,
  },

  watch: {
    '$data.$_pageWidthPx'() {
      this.$data.$_renderComponent = false;
      this.$nextTick(() => {
        this.$data.$_renderComponent = true;
      })
    },
  },

  mounted() {
    this.$nextTick(async () => {
      let score = ScoreTextParser.parse(
        scoreTextForDev,
        new NoteValue(4, 4),
        Scale.dMajor,
      );
      await this.$store.dispatch('setScore', score);
    });

    this.$data.$_windowResizeObserver = new ResizeObserver(event => {
      this.$data.$_pageWidthPx = event[0].contentRect.width;
    });
    this.$data.$_windowResizeObserver.observe(document.documentElement);
  },

  destroyed() {
    this.$data.$_windowResizeObserver.unobserve(document.documentElement);
    this.$data.$_windowResizeObserver.disconnect();
  },

  errorCaptured(error) {
    console.log(error, Object.keys(error));
  },

  data() {
    return {
      $_renderComponent: true,
      $_windowResizeObserver: null,
      $_documentWidthPx: null,
    };
  },

  computed: {
    $_score() {
      return this.$store.state.score;
    },

    $_selectedSectionIdx() {
      return this.$store.state.selectedSectionIdx;
    },

    $_selectedBarIdx() {
      return this.$store.state.selectedBarIdx;
    },

    $_isBarSelected() {
      if (this.$_selectedSectionIdx === null) return false;
      if (this.$_selectedBarIdx === null) return false;
      return true;
    },
  },

  methods: {
    async $_loadScoreFromLocalFile() {
      let fileInterface = await getFileInterface();
      let scoreText = await loadFileAsUTF8Text(fileInterface);
      let score = ScoreTextParser.parse(
        scoreText,
        new NoteValue(4, 4),
        Scale.cMajor,
      );
      await this.$store.dispatch('setScore', score);
    },

    async $_load() {
      let fileInterface = await getFileInterface('application/json');
      let scoreJsonString = await loadFileAsUTF8Text(fileInterface);
      let score = Score.loadJson(scoreJsonString);
      await this.$store.dispatch('setScore', score);
    },

    async $_save() {
      let scoreJson = this.$store.state.score.dumpJson();
      let url = URL.createObjectURL(new Blob([ scoreJson ], { type: 'text/plain' }));
      let a = document.createElement("a");
      document.body.appendChild(a);
      a.download = this.$store.state.score.metadata.title + '.json';
      a.href = url;
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },

    $_updatePart(sectionIdx, barIdx, partIdx, part) {
      this.$set(this.$_score.sections[sectionIdx].bars[barIdx].parts, partIdx, part);
    },

    $_insertNote(sectionIdx, barIdx, partIdx, noteIdx, note) {
      this.$_score.sections[sectionIdx].bars[barIdx].parts[partIdx].notes.splice(noteIdx, 0, note);
    },

    async $_insertBar(sectionIdx, baseBarIdx, barIdx) {
      let baseBar = this.$_score.sections[sectionIdx].bars[baseBarIdx];
      let emptyBar = generateEmptyBarFrom(baseBar);
      this.$_score.sections[sectionIdx].bars.splice(barIdx, 0, emptyBar);
      await this.$store.dispatch('selectBar', [ sectionIdx, barIdx ]);
    },

    async $_removeBar(sectionIdx, barIdx) {
      if (this.$store.state.selectedBarIdx === (this.$_score.sections[sectionIdx].bars.length - 1)) {
        await this.$store.dispatch('selectPreviousBar');
      }
      this.$delete(this.$_score.sections[sectionIdx].bars, barIdx);

    },

    $_replaceBar(sectionIdx, barIdx, bar) {
      this.$set(this.$_score.sections[sectionIdx].bars, barIdx, bar);
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
