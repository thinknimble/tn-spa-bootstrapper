import { createApp } from 'vue'
import './main.css'
import App from './App.vue'
import store from './store'
import router from './router'
import '@thinknimble/vue3-alert-alert/dist/vue3-alert-alert.css'
import AlertPlugin from '@thinknimble/vue3-alert-alert'

createApp(App).use(AlertPlugin, {}).use(store).use(router).mount('#app')
