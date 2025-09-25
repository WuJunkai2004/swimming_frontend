import { createApp } from 'vue'
import App           from './App.vue'

import router        from './router'

import PrimeVue      from 'primevue/config';
import Aura          from '@primeuix/themes/aura';
import './styles/main.css'
import 'primeflex/primeflex.css';

import ConfirmationService from 'primevue/confirmationservice'

import { definePreset } from '@primeuix/themes';
import 'primeicons/primeicons.css';
const Blue = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        }
    }
});

const app = createApp(App)

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Blue
    }
});
app.use(ConfirmationService);

app.mount('#app');