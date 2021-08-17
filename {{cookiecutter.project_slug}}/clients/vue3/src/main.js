import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import mitt from 'mitt';
import moment from 'moment'
import './index.css'
import 'animate.css/animate.min.css';

const app = createApp(App)

// monentjs
app.config.globalProperties.$moment=moment;

// Event Bus
const emitter = mitt();
app.config.globalProperties.$emitter = emitter;




app.use(store).use(router).mount('#app')