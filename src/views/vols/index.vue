<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, shallowRef } from 'vue';
import { useToken } from '@/composables/useToken';
import RoleList from './role-list.vue';
import loading from '@/views/loading.vue';

const { getToken } = useToken();

// --- 鉴权 ---
onMounted(() => {
  getToken();
});

// --- 路由系统 ---
const routes = {
  '/': RoleList,
  '/executive_president': () => import('./executive-president.vue'),
  '/starter': () => import('./starter.vue'),
  '/timer': () => import('./timer.vue'),
  '/technical_inspection': () => import('./technical-inspection.vue'),
  '/reintake_inspection': () => import('./reintake-inspection.vue'),
  '/reborn_inspector': () => import('./reborn-inspector.vue'),
};

const currentPath = ref(window.location.hash.split('?')[0]);
const loadedComponent = shallowRef(null);

const updateCurrentPath = () => {
  currentPath.value = window.location.hash.split('?')[0];
};

const loadComponent = async (path) => {
  // 处理空 hash 的情况，默认为 '/'
  const normalizedPath = path === '' ? '/' : path;

  const page = routes[normalizedPath];
  if (page) {
    // 如果是直接导入的组件（如 RoleList）
    if (page.__name || page.render) {
      return page;
    }
    // 如果是动态导入函数
    const component = await page();
    return component.default;
  } else {
    // 找不到路由，或者可以显示一个 404 页面，这里默认回退到 RoleList
    return RoleList;
  }
};

// 监听 hash 变化
window.addEventListener('hashchange', updateCurrentPath);

// 当组件卸载时，移除监听器
onBeforeUnmount(() => {
  window.removeEventListener('hashchange', updateCurrentPath);
});

// 监听 currentPath 变化
watch(currentPath, async (newPath) => {
  const path = newPath.slice(1); // 去掉前面的 #
  loadedComponent.value = await loadComponent(path);
}, { immediate: true });

// 计算当前应该显示的组件
const currentView = computed(() => {
  return loadedComponent.value || loading;
});
</script>

<template>
  <div class="content-window">
    <component :is="currentView" />
  </div>
</template>

<style scoped>
.content-window {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1.5rem;
  max-width: 1200px; /* 限制最大宽度，避免在大屏上太宽 */
  width: 100%;
}
</style>
