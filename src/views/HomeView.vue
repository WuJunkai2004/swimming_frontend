<script setup>
import { ref } from 'vue'

const count = ref(0);
</script>

<template>
  <div class="home">
    <h1>主页</h1>
    <p>欢迎来到我们的网站！</p>
  </div>
  <header>
    <nav>
      <router-link to="/">主页</router-link> |
      <router-link to="/about">关于</router-link>
    </nav>
  </header>
  
  <hr />

  <div class="app-counter">
    <h3>这是一个在 App.vue 里的全局计数器:</h3>
    <Button @click="count++" severity="success">
      Count is: {{ count }}
    </Button>
  </div>

</template>

<style scoped>
.home {
  text-align: center;
}
</style>