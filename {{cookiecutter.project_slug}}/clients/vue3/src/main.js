require('@/styles/main.scss')
import { createApp } from 'vue'
import { Vue3Mq } from 'vue3-mq'
import App from './App.vue'
import router from './router'
import store from './store'

// same breakpoints as Bulma standard config
const breakpoints = {
  mobile: 0,
  tablet: 769,
  desktop: 1024,
  widescreen: 1216,
  fullhd: 1408,
}

createApp(App)
  .use(store)
  .use(router)
  .use(Vue3Mq, {
    breakpoints,
  })
  .mount('#app')
