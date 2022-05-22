import Vue from 'vue'
import VueRouter from 'vue-router'
import App from '../App.vue'
import Score from '../modules/Score.js'

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/*',
      component: App,
      props: route => {
        if (route.path === '/') {
          let scoreJsonFromCookie = window.localStorage.getItem('score');
          if (scoreJsonFromCookie !== null) {
            return { score: Score.loadJson(scoreJsonFromCookie) };
          } 
        } else {
          try {
            let scoreRawObj = require('/public/scores' + route.path + '.json');
            return { score: Score.loadFromRawObj(scoreRawObj) };
          } catch {
            return { score: Score.generateNew('Untitled', '', '') };
          }
        }
      },
    },
  ],
})

export default router
