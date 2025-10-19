<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, shallowRef } from 'vue';
import { useToken } from '@/composables/useToken'

import no_page from '@/views/manage/no-page.vue';

// --- 2. 鉴权与导航 ---
const { getToken, removeToken } = useToken();

/**
 * 页面加载时检查 Token
 */
onMounted(() => {
  getToken();
});

/**
 * 退出登录
 */
const handleLogout = () => {
  removeToken(true);
};

// --- 3. 响应式布局状态 ---
// 用于控制移动端侧边栏的显示和隐藏
const isMobileSidebarVisible = ref(false);

// --- 4. 侧边栏菜单 (需求 3) ---
// 我们使用 PanelMenu 的数据格式来创建带分组的菜单
const menuModel = ref([
  {
    key: 'games',
    label: '比赛管理',
    icon: 'pi pi-calendar',
    items: [
      { label: '发布比赛', icon: 'pi pi-plus', url: '#/publish-game' },
      { label: '管理比赛', icon: 'pi pi-list', url: '#/manage-games' },
    ]
  },
  {
    separator: true
  },
  {
    key: 'news',
    label: '新闻管理',
    icon: 'pi pi-book',
    items: [
      { label: '发布新闻', icon: 'pi pi-plus', url: '#/publish-news' },
      { label: '管理新闻', icon: 'pi pi-list', url: '#/manage-news' },
    ]
  },
  {
    separator: true
  },
  {
    key: 'users',
    label: '人员管理',
    icon: 'pi pi-users',
    items: [
      { label: '优秀运动员', icon: 'pi pi-user',      url: '#/manage-athletes' },
      { label: '负责人管理', icon: 'pi pi-user-edit', url: '#/manage-leaders' },
      { label: '管理员管理', icon: 'pi pi-shield',    url: '#/manage-admins' },
    ]
  },
]);

const computedMenuModel = computed(() => {
  const processItems = (items) => {
    return items.map(item => {
      if (item.separator) {
        return item;
      }
      // 创建一个当前项的副本以进行修改
      const newItem = { ...item };
      // 检查当前项的 url 是否与 URL hash 匹配
      if (newItem.url === currentPath.value) {
        newItem.class = 'active-menu-item';
      }
      if (newItem.url){
        newItem.command = () =>  {
          isMobileSidebarVisible.value = false;
        };
      }
      // 如果当前项还包含子菜单 (items)，则递归处理
      if (newItem.items && newItem.items.length > 0) {
        newItem.items = processItems(newItem.items);
      }
      return newItem;
    });
  };
  return processItems(menuModel.value);
});

// --- 5. 子路由系统 (需求 2.3) ---
// 完全按照您提供的示例，使用 hash 路由
const routes = {
  '/': () => import('./manage-games.vue'),
  '/publish-game': () => import('./publish-game.vue'),
  '/manage-games': () => import('./manage-games.vue'),
  '/publish-news': () => import('./publish-news.vue'),
  '/manage-news': () => import('./manage-news.vue'),
  '/manage-athletes': () => import('./manage-athletes.vue'),
  '/manage-leaders': () => import('./manage-leaders.vue'),
  '/manage-admins': () => import('./manage-admins.vue'),
};

const currentPath = ref(window.location.hash);
const loadedComponent = shallowRef(null)

const updateCurrentPath = () => {
  currentPath.value = window.location.hash;
};

const loadComponent = async (path) => {
  const page = routes[path];
  if(page){
    const component = await page();
    return component.default;
  } else {
    return no_page;
  }
}

// 监听 hash 变化
window.addEventListener('hashchange', updateCurrentPath);

// 当组件卸载时，移除监听器，防止内存泄漏
onBeforeUnmount(() => {
  window.removeEventListener('hashchange', updateCurrentPath);
});

// 监听 currentPath 变化
watch(currentPath, async (newPath) => {
  const path = newPath.slice(1) || '/';
  loadedComponent.value = await loadComponent(path);
}, { immediate: true });

// 计算当前应该显示的组件
const currentView = computed(() => {
  return loadedComponent.value || no_page;
});
</script>

<template>
  <div class="manage-view-wrapper">

    <Toolbar class="top-toolbar">
      <template #start>
        <Button
          icon="pi pi-bars"
          severity="secondary"
          outlined
          class="md:hidden mr-2"
          @click="isMobileSidebarVisible = true"
        />
        <div class="hidden md:flex align-items-center">
          <img alt="logo" src="/favicon.ico" height="80" class="mr-2" />
          <span class="font-bold text-lg">赛事管理后台</span>
        </div>
      </template>
      <template #end>
        <Button
          icon="pi pi-sign-out"
          severity="danger"
          class="md:hidden"
          @click="handleLogout"
          aria-label="退出登录" />

        <Button
          label="退出登录"
          icon="pi pi-sign-out"
          severity="danger"
          class="hidden md:flex"
          @click="handleLogout"
        />
      </template>
    </Toolbar>

    <div class="main-content-area">

      <Drawer v-model:visible="isMobileSidebarVisible" header="导航菜单">
        <Menu :model="computedMenuModel" class="w-full" />
      </Drawer>

      <div class="desktop-sidebar hidden md:block">
        <Menu :model="computedMenuModel" class="w-full" />
      </div>

      <div class="content-window">
        <component :is="currentView" />
      </div>

    </div>
  </div>
</template>

<style scoped>
.manage-view-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 占满整个视口高度 */
  overflow: hidden; /* 防止根页面滚动 */
  background-color: var(--p-content-background); /* 设置一个浅灰色背景 */
}

/* 顶部工具栏样式 */
.top-toolbar {
  flex-shrink: 0; /* 防止工具栏在 flex 布局中被压缩 */
  border-bottom: 0px solid var(--p-primary-color);
  background-color: #c8f0ff7e;
  border-radius: 0%;
}

/* 下方主内容区 */
.main-content-area {
  display: flex;
  flex-grow: 1; /* 占据所有剩余的垂直空间 */
  overflow: hidden; /* 关键：确保主区域自己不溢出 */
}

/* PC 端侧边栏 */
.desktop-sidebar :deep(.p-menu) {
  background: transparent;
  border: none;
}
.desktop-sidebar {
  width: 18rem; /* 固定宽度 */
  flex-shrink: 0; /* 防止被压缩 */
  background-color: var(--p-surface-100);
  border-right: 1px solid var(--p-content-border-color);
  overflow-y: auto; /* 当菜单很长时，侧边栏自己滚动 */
}

/* 右侧内容窗口 */
.content-window {
  flex-grow: 1; /* 占据所有剩余的水平空间 */
  overflow-y: auto; /* 【关键】让内容窗口自己滚动 */
  padding: 1.5rem;
}

/* 选中的侧边菜单 */
:deep(.active-menu-item > .p-menu-item-content) {
  background-color: var(--p-primary-300) !important;
  color: var(--p-text-color) !important;
}
</style>