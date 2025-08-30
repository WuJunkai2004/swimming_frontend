import { createApp } from 'vue'
import App           from './App.vue'

import router        from './router'

import PrimeVue      from 'primevue/config';
import Aura          from '@primeuix/themes/aura';
import 'primeflex/primeflex.css';
import './styles/main.css'

import ConfirmationService from 'primevue/confirmationservice'
import ConfirmDialog from 'primevue/confirmdialog';

const app = createApp(App)

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.use(ConfirmationService);

app.component('ConfirmDialog', ConfirmDialog);

app.mount('#app');