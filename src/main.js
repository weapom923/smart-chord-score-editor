import Vue from 'vue'
import Index from './Index.vue'
import vuetify from './plugins/vuetify.js'
import store from './store/index.js'
import router from './router'

Vue.config.productionTip = false

new Vue({
  vuetify,
  store,
  router,
  render: h => h(Index)
}).$mount('#app')
