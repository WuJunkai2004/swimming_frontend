<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';

// --- 1. 初始化 ---
const route = useRoute();
const newsDetail = ref(null); // 用于存储新闻详情数据
const loading = ref(true);    // 加载状态
const error = ref(null);      // 错误信息

// --- 2. 封装数据获取逻辑 ---
// 创建一个可以重复调用的函数，根据 ID 获取新闻数据
const fetchNewsDetail = async (id) => {
  console.log(`准备根据 ID: ${id} 获取新闻...`);
  loading.value = true;
  error.value = null;
  newsDetail.value = null;

  try {
    // 模拟 API 请求
    // 在真实项目中，这里应替换为您的 fetch 或 axios 调用
    // const response = await fetch(`/api/news/${id}`);
    // const data = await response.json();
    
    // 模拟成功返回数据
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟网络延迟
    const mockData = {
      id: id,
      title: `关于新闻 #${id} 的详细报道`,
      content: `这里是新闻 ${id} 的正文内容，省略一万字...`,
      author: 'Admin',
      publishDate: '2025-09-12'
    };
    newsDetail.value = mockData;

  } catch (e) {
    error.value = '无法加载新闻内容，请稍后重试。';
    console.error(e);
  } finally {
    loading.value = false;
  }
};

// --- 3. 监听路由参数变化 ---
// 使用 watch 监听 route.params.id 的变化
// 当从 /news/1 跳转到 /news/2 时，这个监听器会被触发
watch(
  () => route.params.id,
  (newId) => {
    // 确保 newId 存在时才重新获取数据
    if (newId) {
      fetchNewsDetail(newId);
    }
  }
);

// --- 4. 组件首次挂载时获取数据 ---
// onMounted 只会在组件第一次被创建时执行一次
onMounted(() => {
  fetchNewsDetail(route.params.id);
});
</script>

<template>
  <div>
    <MobileMenuBar />
    <ComputerMenuBar />
    <div v-if="loading" class="loading-state">
      <p>正在加载中...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>错误: {{ error }}</p>
    </div>
    
    <article v-else-if="newsDetail" class="news-content">
      <h1>{{ newsDetail.title }}</h1>
      <p class="meta">作者: {{ newsDetail.author }} | 发布于: {{ newsDetail.publishDate }}</p>
      <hr />
      <div class="content-body">
        {{ newsDetail.content }}
      </div>
    </article>
  </div>
</template>

<style scoped>
/* 为页面添加一些简单的样式 */
.loading-state, .error-state {
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: #888;
}
.news-content {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.meta {
  color: #666;
  font-size: 0.9rem;
}
.content-body {
  margin-top: 1.5rem;
  line-height: 1.8;
}
</style>