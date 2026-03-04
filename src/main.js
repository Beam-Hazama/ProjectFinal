import './style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import ApexChart from './components/ApexChart.vue'


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('apexchart', ApexChart)

app.mount('#app')
