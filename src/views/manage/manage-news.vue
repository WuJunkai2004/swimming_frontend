<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToken } from '@/composables/useToken';
import { useAlert } from '@/composables/useAlert';

const router = useRouter();
const { alerts, awaitAlert } = useAlert();

const { getToken } = useToken();

// 响应式状态定义
const newsList = ref([]);               // 存储新闻列表数据
const isLoading = ref(true);            // 控制加载状态，用于显示加载动画
const error = ref(null);                // 存储API请求错误信息
const currentPage = ref(1);             // 当前页码
const limit = ref(10);                  // 每页显示数量
const showDeleted = ref(false);         // 是否显示已删除新闻的切换状态
const isLastPage = ref(false);          // 是否为最后一页，用于禁用“下一页”按钮

/**
 * 获取新闻列表的核心函数
 * 会根据 currentPage, limit, showDeleted 的值动态构建请求
 */
const fetchNews = async () => {
  isLoading.value = true;
  error.value = null;

  let fetch_response = null;
  if(showDeleted.value) {
    fetch_response = fetch(`/activity/getNewsList`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        page: currentPage.value,
        limit: limit.value,
        deletion: true,
        token: getToken(),
      })
    });
  } else {
    const params = new URLSearchParams({
      page: currentPage.value,
      limit: limit.value,
    });
    fetch_response = fetch(`/activity/getNewsList?${params.toString()}`);
  }

  const handleFetchResult = (data) => {
    if (data.statusCode === 200) {
      newsList.value = data.data || [];
      isLastPage.value = data.data.length < limit.value;
      error.value = null;
    } else {
      newsList.value = [];
      error.value = data.message || '获取新闻列表失败，请稍后重试。';
    }
    isLoading.value = false;
  };

  fetch_response
  .then(res => res.json())
  .then(handleFetchResult)
  .catch(err => {
    console.error('获取新闻列表失败:', err);
    error.value = '获取新闻列表失败，请稍后重试。';
    isLoading.value = false;
  });
};


const viewNews = (newsItem) => {
  router.push(`/activity/${newsItem.id}`);
};

const endOfFetch = (data) => {
  if(data.statusCode === 200){
    fetchNews();
  }
  alerts('操作结果', data.message, '关闭', 'hidden');
}

const deleteNews = (newsItem) => {
  asyncAlert('确认删除', 
    `您确定要删除新闻 "${newsItem.title}" 吗？`, 
    '确认删除', '取消',
    'pi pi-exclamation-triangle'
  )
  .then(() => {
    fetch('/admin/deleteNews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: newsItem.id,
        token: getToken()
      })
    })
    .then(res => res.json())
    .then(endOfFetch);
  })
  .catch(() => {
    // 用户取消删除
  });
};

const restoreNews = (newsItem) => {
  asyncAlert('确认恢复', 
    `您确定要恢复新闻 "${newsItem.title}" 吗？`, 
    '确认恢复', '取消',
    'pi pi-info-circle'
  )
  .then(() => {
    fetch('/admin/withdrawNews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: newsItem.id,
        token: getToken()
      })
    })
    .then(res => res.json())
    .then(endOfFetch);
  })
  .catch(() => {
    // 用户取消恢复
  });
};

// 需求 3: 分页控制函数
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};
const nextPage = () => {
  if (!isLastPage.value) {
    currentPage.value++;
  }
};

// --- 4. 监听器与生命周期钩子 ---

// 监听 currentPage 的变化，自动重新获取数据
watch(currentPage, fetchNews);

// 监听 showDeleted 的变化
watch(showDeleted, (newValue) => {
  // 当切换“显示已删除”时，我们应该重置回第一页
  if (currentPage.value !== 1) {
    currentPage.value = 1;
  } else {
    // 如果本来就在第一页，watch 不会触发，需要手动调用
    fetchNews();
  }
});

// 组件首次挂载时，获取初始数据
onMounted(fetchNews);

</script>

<template>
  <div class="p-4 surface-card shadow-2 border-round">

    <div class="controls-bar flex flex-wrap justify-content-between align-items-center gap-3 mb-4">

      <div class="flex align-items-center">
        <ToggleSwitch v-model="showDeleted" inputId="showDeletedSwitch" />
        <label for="showDeletedSwitch" class="ml-2 font-semibold">显示已删除新闻</label>
      </div>

      <div class="pagination-controls flex align-items-center">
        <Button 
          icon="pi pi-angle-left" 
          class="p-button-secondary p-button-outlined"
          @click="prevPage" 
          :disabled="currentPage === 1 || isLoading" 
        />
        <span class="mx-3 text-color-secondary">第 {{ currentPage }} 页</span>
        <Button 
          icon="pi pi-angle-right" 
          class="p-button-secondary p-button-outlined"
          @click="nextPage" 
          :disabled="isLastPage || isLoading" 
        />
      </div>
    </div>

    <Divider />

    <div>
      <div v-if="isLoading" class="text-center p-5">
        <ProgressSpinner strokeWidth="4" />
      </div>

      <div v-else-if="error">
        <Message severity="error" :closable="false">{{ error }}</Message>
      </div>

      <div v-else-if="newsList.length > 0" class="news-list">
        <div 
          v-for="item in newsList" 
          :key="item.id" 
          class="news-item flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center p-3"
        >
          <div class="news-title font-medium text-lg mb-2 md:mb-0">
            {{ item.title }}
          </div>
          <div class="actions flex gap-2">
            <template v-if="!showDeleted">
              <Button label="查看" icon="pi pi-eye" class="p-button-text p-button-sm" @click="viewNews(item)" />
              <Button label="删除" icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" @click="deleteNews(item)" />
            </template>
            <template v-else>
              <Button label="恢复" icon="pi pi-undo" class="p-button-text p-button-success p-button-sm" @click="restoreNews(item)" />
            </template>
          </div>
        </div>
      </div>

      <div v-else class="text-center p-5 text-color-secondary">
        <i class="pi pi-inbox" style="font-size: 2rem"></i>
        <p class="mt-2">当前分类下暂无新闻</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
.news-list {
  /* 创建一个列表项之间的分割线 */
  display: flex;
  flex-direction: column;
  gap: 0; /* 移除默认gap，由边框控制 */
}

.news-item {
  /* 为每个列表项添加底部边框，除了最后一个 */
  border-bottom: 1px solid var(--p-primary-100);
  transition: background-color 0.2s;
}

.news-item:last-child {
  border-bottom: none;
}

.news-item:hover {
  background-color: var(--p-content-hover-background);
}

/* 响应式设计：在移动端，让按钮组宽度适应内容，而不是拉伸 */
@media (max-width: 767px) {
  .actions {
    width: 100%;
    justify-content: flex-end; /* 按钮靠右对齐 */
    margin-top: 0.5rem;
  }
}
</style>