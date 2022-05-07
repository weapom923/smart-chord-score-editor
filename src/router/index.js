import Vue from 'vue'
import VueRouter from 'vue-router'
import App from '../App.vue'
import ScoreTextParser from '../modules/ScoreTextParser.js'
import Score from '../modules/Score.js'
import Scale from '../modules/Scale.js'
import NoteValue from '../modules/NoteValue.js'

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/sample',
      component: App,
      props: () => {
        return {
          score: ScoreTextParser.parse(`
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
            `,
            new NoteValue(4, 4),
            Scale.dMajor,
            new Score.Metadata(
              'MINE',
              'Kenshiro Ueda',
              'Kenshiro Ueda',
              'Ai-Chiharu',
            ),
          ),
        };
      },
    },
    {
      path: '/',
      component: App,
    },
  ],
})

export default router
