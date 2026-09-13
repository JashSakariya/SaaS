import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

import './styles/index.css'
import './theme.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Toast from 'vue-toastification'
import "vue-toastification/dist/index.css";

createApp(App)
    .use(router)
    .use(Toast)
    .mount('#app')

