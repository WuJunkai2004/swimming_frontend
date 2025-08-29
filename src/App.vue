<script setup>
import { createApp, ref } from 'vue'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import Button from "primevue/button"

const count = ref(0)
const app = createApp({
  setup() {
    return {
      count
    }
  }
})
app.component('Button', Button)
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.mount("#app")
</script>

<template>
<div id="app">
  <Button @click="count++">
    Count is: {{ count }}
  </Button>
</div>
</template>

<style scoped></style>
