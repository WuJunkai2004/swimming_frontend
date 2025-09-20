<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import Cookies from 'js-cookie';

// --- 1. 导入子页面（操作窗口） ---
import ManageHome from '@/views/manage/Home.vue';
import ManageGames from '@/views/manage/ManageGames.vue';
import PublishGame from '@/views/manage/PublishGame.vue';
import ManageNews from '@/views/manage/ManageNews.vue';
import no_page from '@/views/manage/no-page.vue';

// --- 2. 鉴权与导航 ---
const router = useRouter();

/**
 * 页面加载时检查 Token
 */
onMounted(() => {
  const token = Cookies.get('token');
  if (!token) {
    router.push('/login');
  }
});

/**
 * 退出登录
 */
const handleLogout = () => {
  Cookies.remove('token');
  router.push('/login');
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

// --- 5. 子路由系统 (需求 2.3) ---
// 完全按照您提供的示例，使用 hash 路由
const routes = {
  '/': ManageHome,
  '/manage-games': ManageGames,
  '/publish-game': PublishGame,
  '/manage-news': ManageNews,
  // '/publish-news': ...
  // '/manage-athletes': ...
  // '/manage-leaders': ...
  // '/manage-admins': ...
};

const currentPath = ref(window.location.hash);

const updateCurrentPath = () => {
  currentPath.value = window.location.hash;
};

// 监听 hash 变化
window.addEventListener('hashchange', updateCurrentPath);

// 当组件卸载时，移除监听器，防止内存泄漏
onBeforeUnmount(() => {
  window.removeEventListener('hashchange', updateCurrentPath);
});

// 计算当前应该显示的组件
const currentView = computed(() => {
  // 移除开头的 '#'
  const path = currentPath.value.slice(1) || '/';
  return routes[path] || no_page;
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
        <Menu :model="menuModel" class="w-full" />
      </Drawer>

      <div class="desktop-sidebar hidden md:block">
        <Menu :model="menuModel" class="w-full" />
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
  background-color: var(--p-surface-ground); /* 设置一个浅灰色背景 */
}

/* 顶部工具栏样式 */
.top-toolbar {
  flex-shrink: 0; /* 防止工具栏在 flex 布局中被压缩 */
  border-bottom: 2px solid var(--p-primary-color);
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
  border-right: 1px solid var(--p-surface-border);
  overflow-y: auto; /* 当菜单很长时，侧边栏自己滚动 */
}

/* 右侧内容窗口 */
.content-window {
  flex-grow: 1; /* 占据所有剩余的水平空间 */
  overflow-y: auto; /* 【关键】让内容窗口自己滚动 */
  padding: 1.5rem;
}

/* 美化 PanelMenu 和 Menu 的 URL 链接
  我们使用 :deep() 来穿透组件内部样式
*/
:deep(.p-menuitem-link[href^="#"]) {
  text-decoration: none !important;
  color: var(--p-text-color) !important;
}
:deep(.p-menuitem-link[href^="#"]:hover) {
  background-color: var(--p-surface-hover) !important;
}
</style>