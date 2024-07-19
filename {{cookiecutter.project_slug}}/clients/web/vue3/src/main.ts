import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import AlertPlugin from '@thinknimble/vue3-alert-alert'
import { VueQueryPlugin } from '@tanstack/vue-query'

import './main.css'
import App from './App.vue'
import router from './router'

import '@thinknimble/vue3-alert-alert/dist/vue3-alert-alert.css'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App).use(pinia).use(AlertPlugin, {}).use(VueQueryPlugin).use(router).mount('#app')
