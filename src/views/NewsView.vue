<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Vue Router 实例
const route = useRoute();
const router = useRouter();

// 响应式状态
const news = ref([]);
const loading = ref(true);
const error = ref(null);
const currentPage = ref(1);
const limit = ref(20);
const isLastPage = ref(false); // 是否是最后一页

// 核心数据获取函数
/*const fetchNews = async () => {
  loading.value = true;
  error.value = null;
  try {
    // 模拟 API 请求
    // 在真实项目中，请替换成您的 fetch 或 axios 调用
    const response = await fetch(`/activity/getNewsList?page=${currentPage.value}&limit=${limit.value}`);
    if (!response.ok) {
      throw new Error('网络错误，无法获取新闻列表。');
    }
    const result = await response.json();

    if (result.statusCode === 200) {
      news.value = result.data;
      // 判断是否是最后一页：如果返回的数据量小于请求的 limit，则认为是最后一页
      isLastPage.value = result.data.length < limit.value;
    } else {
      throw new Error(result.message || '获取新闻失败。');
    }
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};*/

const fetchNews = async () => {
  const debug_data = {
    "statusCode": 200,
    "message" : "获取新闻成功",
    "data" : [
      {
        "title": "活动1",
        "id": "1",
        "publishTime": "2021-01-01",
        "view": "10086"
      },
      {
        "title": "活动2",
        "id": "2",
        "publishTime": "2021-01-02",
        "view": "8888"
      },
      {
        "title": "活动3",
        "id": "3",
        "publishTime": "2021-01-03",
        "view": "6666"
      },
      {
        "title": "活动4",
        "id": "4",
        "publishTime": "2021-01-04",
        "view": "1234"
      },
      {
        "title": "活动5",
        "id": "5",
        "publishTime": "2021-01-05",
        "view": "4321"
      }
    ]
  };
  isLastPage.value = false;
  news.value = debug_data.data;
  loading.value = false;
}

// 页面切换函数
const changePage = (newPage) => {
  // 更新 URL 查询参数，这将触发 watch 来重新获取数据
  router.push({ query: { page: newPage, limit: limit.value } });
};

// 组件挂载时，初始化参数并获取数据
onMounted(() => {
  // 从 URL 初始化 page 和 limit
  const pageFromUrl = parseInt(route.query.page, 10);
  const limitFromUrl = parseInt(route.query.limit, 10);

  currentPage.value = !isNaN(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;
  limit.value = !isNaN(limitFromUrl) && limitFromUrl > 0 ? limitFromUrl : 20;
  
  fetchNews();
});

// 监听路由变化，以便在用户点击浏览器前进/后退按钮时也能更新数据
watch(() => route.query, (newQuery) => {
  const newPage = parseInt(newQuery.page, 10) || 1;
  const newLimit = parseInt(newQuery.limit, 10) || 10;

  if (newPage !== currentPage.value || newLimit !== limit.value) {
    currentPage.value = newPage;
    limit.value = newLimit;
    fetchNews();
  }
}, { deep: true });
fetchNews();
</script>

<template>
  <div>
    <MobileMenuBar />
    <ComputerMenuBar />

    <div class="grid justify-content-center">
      <div class="col-12 lg:col-8 xl:col-6">
        
        <div v-if="loading" class="text-center p-5">
          <ProgressSpinner />
          <p>正在加载新闻...</p>
        </div>

        <div v-else-if="error" class="p-3">
            <Message severity="error">{{ error }}</Message>
        </div>

        <div v-else>
          <div class="news-list p-3">
            <Card v-for="item in news" :key="item.id" class="mb-3 news-item">
              <template #title>
                <a :href="`/news/${item.id}`" class="news-title-link">{{ item.title }}</a>
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

          <div v-if="news.length > 0" class="pagination-controls flex justify-content-between p-3">
            <Button 
              label="上一页" 
              icon="pi pi-angle-left" 
              :disabled="currentPage === 1" 
              @click="changePage(currentPage - 1)" 
            />
            <span class="p-button-label">第 {{ currentPage }} 页</span>
            <Button 
              label="下一页" 
              icon="pi pi-angle-right" 
              iconPos="right" 
              :disabled="isLastPage" 
              @click="changePage(currentPage + 1)" 
            />
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
  color: var(--text-color);
  transition: color 0.2s;
}

.news-title-link:hover {
  color: var(--primary-color);
}

.pagination-controls {
  position: sticky;
  bottom: 0;
  background-color: var(--surface-card);
  border-top: 1px solid var(--surface-border);
}
</style>