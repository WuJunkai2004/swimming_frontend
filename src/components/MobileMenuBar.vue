<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// 获取 router 实例，用于导航
const router = useRouter();

// 将菜单项的定义从 LoginView 移动到这里
const menuItems = ref([
  {
    label: '主页',
    icon: 'pi pi-home',
    command: () => router.push('/')
  },
  {
    label: '关于',
    icon: 'pi pi-info-circle',
    command: () => router.push('/about')
  },
  {
    label: '新闻',
    icon: 'pi pi-globe',
    command: () => router.push('/news')
  },
  {
    label: '登录',
    icon: 'pi pi-sign-in',
    command: () => router.push('/login')
  }
]);
</script>

<template>
  <Menubar :model="menuItems" class="md:hidden border-noround" />
</template>

<style scoped></style>