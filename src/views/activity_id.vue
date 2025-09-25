<script setup>
import router from '@/router';
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
  loading.value = true;
  error.value = null;
  newsDetail.value = null;
  fetch(`/activity/getNewsDetail?id=${id}`)
  .then(response => response.json())
  .then(data => {
    if(data && data.statusCode === 200){
      newsDetail.value = data.data;
    } else {
      error.value = data.message || '无法加载新闻内容，请稍后重试。';
    }
  })
  .catch(e => {
    error.value = '无法加载新闻内容，请稍后重试。';
    console.error(e);
  })
  .finally(() => {
    loading.value = false;
  });
};

const goBack = () => {
  router.go(-1);
};

// --- 3. 监听路由参数变化 ---
// 使用 watch 监听 route.params.id 的变化
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
  console.log('组件已挂载，准备获取新闻详情', route.params);
  fetchNewsDetail(route.params.id);
});
</script>

<template>
  <div>
    <MobileMenuBar />
    <ComputerMenuBar />

  <div class="page-content-container">

    <Button 
      label="返回" 
      icon="pi pi-arrow-left" 
      @click="goBack" 
      class="p-button-text p-button-secondary mt-4 mb-3 md:hidden" 
    />

    <div v-if="loading" class="news-content-skeleton">
      <Skeleton width="60%" height="2.5rem" class="mb-3"></Skeleton>
      <Skeleton width="40%" height="1rem" class="mb-4"></Skeleton>
      <hr />
      <Skeleton height="1rem" class="mb-2"></Skeleton>
      <Skeleton height="1rem" class="mb-2"></Skeleton>
      <Skeleton height="15rem" class="mb-3"></Skeleton>
      <Skeleton height="1rem"></Skeleton>
    </div>

    <div v-else-if="error" class="error-state p-3">
       <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <article v-else-if="newsDetail" class="news-content">
      <h1 class="mb-3">{{ newsDetail.title }}</h1>

      <div class="meta flex align-items-center gap-4 text-sm text-gray-500">
        <span class="flex align-items-center">
          <i class="pi pi-calendar mr-2"></i>
          发布于: {{ newsDetail.publishTime }}
        </span>
        <span class="flex align-items-center">
          <i class="pi pi-eye mr-2"></i>
          浏览量: {{ newsDetail.view }}
        </span>
      </div>

      <hr class="my-4" /> <div class="content-body">
        <template v-for="(item, idx) in newsDetail.content" :key="idx">

          <div v-if="item.type === 'text'" v-html="item.data" class="news-text"></div>

          <div v-else-if="item.type === 'image'" class="flex justify-content-center my-4">
            <Image :src="item.url" class="news-image" alt="新闻图片" preview />
          </div>

          <div v-else-if="item.type === 'video'" class="news-video flex justify-content-center my-4">
            <video :src="item.url" controls :poster="item.preview" class="news-video-player" />
          </div>

        </template>
      </div>
    </article>

  </div>
  </div>
</template>

<style scoped>
/* 骨架屏和错误状态的容器 */
.news-content-skeleton,
.error-state {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
}

/* 加载状态的骨架屏本身需要一些边距 */
.news-content-skeleton .p-skeleton {
  background-color: #e0e0e0;
}

/* 文章内容容器 */
.news-content {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 元数据 (meta) 样式 */
.meta {
  color: var(--p-text-color); /* 使用主题变量 */
  font-size: 0.9rem;
}

/* 文章正文统一样式 */
.content-body {
  margin-top: 1.5rem;
  line-height: 1.8;
  font-size: 1.1rem; /* 稍微增大正文字体大小，提高可读性 */
  color: var(--p-text-color);
}

/* 使用 :deep() 穿透 Scoped CSS，
  来美化 v-html 产生的 .news-text 区块内的元素
*/
.content-body :deep(.news-text) {
  margin-bottom: 1.5rem; /* 为每个文字段落添加下边距 */
}

/* 美化 v-html 中的链接 */
.content-body :deep(.news-text a) {
  color: var(--p-primary-color);
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1px solid var(--p-primary-200);
  transition: background-color 0.2s;
}

.content-body :deep(.news-text a:hover) {
  background-color: var(--p-primary-50);
}

/* 响应式图片和影片 */
.news-image,
.news-video-player {
  max-width: 100%;
  height: auto;
  border-radius: 8px; /* 为媒体添加圆角 */
}

/* 让 PrimeVue 的 Image 组件内的图片也保持100%宽度 */
:deep(.news-image .p-image-preview-indicator),
:deep(.news-image img) {
  max-width: 100%;
  border-radius: 8px;
}
</style>
