import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify.js'
import store from './store/index.js'

Vue.config.productionTip = false

new Vue({
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app')
