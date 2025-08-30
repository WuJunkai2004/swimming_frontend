import { createApp } from 'vue'
import App           from './App.vue'

import router        from './router'

import PrimeVue      from 'primevue/config';
import Aura          from '@primeuix/themes/aura';
import 'primeflex/primeflex.css';
import './styles/main.css'

const app = createApp(App)

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});

app.mount('#app');