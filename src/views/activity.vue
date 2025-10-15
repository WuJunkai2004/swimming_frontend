<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Vue Router 实例
const route = useRoute();
const router = useRouter();

// 响应式状态
const news = ref([]);
const loadingFirst = ref(true);
const loadingMore = ref(false);
const error = ref(null);
const currentPage = ref(1);
const limit = ref(20);
const isLastPage = ref(false); // 是否是最后一页

// 核心数据获取函数
const fetchNews = async (page) => {
  if(loadingMore.value || isLastPage.value){
    return
  }
  if(page === 1){
    loadingFirst.value = true;
  } else {
    loadingMore.value = true;
  }
  error.value = null;
  fetch(`/activity/getNewsList?page=${page}&limit=${limit.value}`)
  .then(response => response.json())
  .then(result => {
    if (result.statusCode === 200) {
      news.value.push(...result.data);
      // 判断是否是最后一页：如果返回的数据量小于请求的 limit，则认为是最后一页
      isLastPage.value = result.data.length < limit.value;
    } else {
      error.value = result.message || '获取新闻失败。';
    }
  })
  .catch(() => {
    error.value = '网络错误，请稍后再试';
  })
  .finally(() => {
    loadingFirst.value = false;
    loadingMore.value = false;
  });
};

// 滚动事件
const handleScroll = () => {
  // 获取页面的滚动高度、可视高度和总高度
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const clientHeight = document.documentElement.clientHeight;
  const scrollHeight = document.documentElement.scrollHeight;

  // 预留 50px 的缓冲区，在快要到底部时就提前加载
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    // 触发加载下一页
    fetchNews(currentPage.value + 1);
    currentPage.value += 1;
  }
};

// 点击卡片时导航到详情页
const goToDetail = (id) => {
  router.push(`/activity/${id}`);
};

// 组件挂载时，初始化参数并获取数据
onMounted(() => {
  // 从 URL 初始化 page 和 limit
  const pageFromUrl = parseInt(route.query.page, 10);
  const limitFromUrl = parseInt(route.query.limit, 10);

  currentPage.value = !isNaN(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;
  limit.value = !isNaN(limitFromUrl) && limitFromUrl > 0 ? limitFromUrl : 20;

  fetchNews(1);

  window.addEventListener('scroll', handleScroll);
});

// 组件卸载时，移除滚动事件监听，防止内存泄漏
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div style="overflow-x: hidden;">
    <MobileMenuBar />
    <ComputerMenuBar />

    <div class="grid justify-content-center">
      <div class="col-12 lg:col-8 xl:col-6">

        <div v-if="loadingFirst" class="text-center p-5">
          <ProgressSpinner />
          <p>正在加载新闻...</p>
        </div>

        <div v-else-if="error" class="p-3">
            <Message severity="error">{{ error }}</Message>
        </div>

        <div v-else>
          <div class="news-list p-3">
            <Card v-for="item in news" :key="item.id" class="mb-3 news-item" @click="goToDetail(item.id)">
              <template #title>
                <a class="news-title-link">{{ item.title }}</a>
              </template>
              <template #content>
                <div class="flex justify-content-between align-items-center text-sm text-gray-500">
                  <span>发布于: {{ item.publishTime }}</span>
                  <span class="flex align-items-center">
                    <i class="pi pi-eye mr-1"></i>
                    {{ item.view }}
                  </span>
                </div>
              </template>
            </Card>
          </div>

          <div v-if="news.length === 0" class="text-center p-5">
            <i class="pi pi-inbox" style="font-size: 2rem"></i>
            <p>暂无新闻内容</p>
          </div>

          <div v-if="loadingMore" class="text-center p-4">
            <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="3" />
            <p class="text-color-secondary mt-2">正在加载更多...</p>
          </div>

          <div v-if="isLastPage && news.length > 0" class="end-of-list p-4">
            <Divider align="center">
              <span class="text-color-secondary text-sm">没有更多内容了</span>
            </Divider>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 响应式布局的核心由 PrimeFlex 的 grid 和 col-* 类处理，无需太多自定义 CSS */
.news-item {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.news-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.news-title-link {
  text-decoration: none;
  color: var(--p-text-color);
  transition: color 0.2s;
}

.news-title-link:hover {
  color: var(--p-primary-color);
}

.pagination-controls {
  position: sticky;
  bottom: 0;
  background-color: var(--p-content-background);
  border-top: 1px solid var(--p-content-border-color);
}
</style>
