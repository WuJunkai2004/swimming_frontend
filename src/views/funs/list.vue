<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

// 响应式状态
const competitions = ref([]);
const total = ref(0);
const loading = ref(true);
const error = ref(null);
const currentPage = ref(1);
const limit = ref(10);

// 状态映射 (针对趣味赛)
const statusMap = {
  REGISTRATION_IN: "报名中",
  COMPETITION_IN_PROGRESS: "进行中",
  COMPETITION_FINISHED: "已结束",
};

const formatStatus = (status) => {
  return statusMap[status] || status;
};

const severityMap = {
  REGISTRATION_IN: "info",
  COMPETITION_IN_PROGRESS: "warn",
  COMPETITION_FINISHED: "error",
};

const getSeverity = (status) => {
  return severityMap[status] || "info";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString();
};

// 核心数据获取函数
const fetchCompetitions = async (page) => {
  loading.value = true;
  error.value = null;

  // 使用接口文档中的接口: GET /api/funGame/list?page=1&size=10
  fetch(`/api/funGame/list?page=${page}&size=${limit.value}`)
    .then((response) => response.json())
    .then((result) => {
      if (result.statusCode === 200) {
        competitions.value = result.data.list;
        total.value = result.data.total;
      } else {
        error.value = result.message || "获取活动列表失败。";
        competitions.value = [];
      }
    })
    .catch(() => {
      error.value = "网络错误，请稍后再试";
      competitions.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
};

// 分页控制
const prevPage = () => {
  if (currentPage.value > 1) {
    updatePage(currentPage.value - 1);
  }
};

const nextPage = () => {
  // 根据 total 判断是否有下一页
  if (currentPage.value * limit.value < total.value) {
    updatePage(currentPage.value + 1);
  }
};

const updatePage = (page) => {
  router.push({
    query: {
      ...route.query,
      page: page,
    },
  });
};

// 点击卡片跳转到成绩页
const goToDetail = (id) => {
  router.push({
    path: "/fun/results",
    query: { game: id },
  });
};

// 监听路由参数变化
watch(
  () => route.query.page,
  (newPage) => {
    const p = parseInt(newPage, 10);
    currentPage.value = !isNaN(p) && p > 0 ? p : 1;
    fetchCompetitions(currentPage.value);
  },
);

watch(
  () => route.query.limit,
  (newLimit) => {
    const l = parseInt(newLimit, 10);
    if (!isNaN(l) && l > 0) {
      limit.value = l;
      fetchCompetitions(currentPage.value);
    }
  },
);

// 组件挂载时，初始化参数并获取数据
onMounted(() => {
  const pageFromUrl = parseInt(route.query.page, 10);
  const limitFromUrl = parseInt(route.query.limit, 10);

  if (!isNaN(pageFromUrl) && pageFromUrl > 0) {
    currentPage.value = pageFromUrl;
  }
  if (!isNaN(limitFromUrl) && limitFromUrl > 0) {
    limit.value = limitFromUrl;
  }

  fetchCompetitions(currentPage.value);
});
</script>

<template>
  <div style="overflow-x: hidden">
    <MobileMenuBar />
    <ComputerMenuBar />

    <div class="grid justify-content-center">
      <div class="col-12 lg:col-8 xl:col-6">
        <div v-if="loading" class="text-center p-5">
          <ProgressSpinner />
          <p>正在加载趣味运动会...</p>
        </div>

        <div v-else-if="error" class="p-3">
          <Message severity="error">{{ error }}</Message>
        </div>

        <div v-else>
          <div class="competition-list p-3">
            <Card
              v-for="item in competitions"
              :key="item.competitionId"
              class="mb-3 competition-item"
              @click="goToDetail(item.competitionId)"
            >
              <template #title>
                <span class="competition-title">{{ item.gameName }}</span>
              </template>
              <template #content>
                <div class="flex flex-column gap-2 text-sm text-gray-600">
                  <div class="flex align-items-center">
                    <i class="pi pi-calendar mr-2"></i>
                    <span>开始时间: {{ formatDate(item.startTime) }}</span>
                  </div>
                  <div class="flex align-items-center">
                    <i class="pi pi-calendar-times mr-2"></i>
                    <span>结束时间: {{ formatDate(item.endTime) }}</span>
                  </div>
                  <div class="flex align-items-center">
                    <i class="pi pi-info-circle mr-2"></i>
                    <span
                      >状态:
                      <Tag
                        :value="formatStatus(item.status)"
                        :severity="getSeverity(item.status)"
                    /></span>
                  </div>
                </div>
              </template>
            </Card>
          </div>

          <div v-if="competitions.length === 0" class="text-center p-5">
            <i class="pi pi-inbox" style="font-size: 2rem"></i>
            <p>暂无趣味运动会信息</p>
          </div>

          <!-- Pagination Controls -->
          <div class="flex justify-content-between p-3 pagination-controls">
            <Button
              label="上一页"
              icon="pi pi-chevron-left"
              @click="prevPage"
              :disabled="currentPage === 1"
              class="p-button-text"
            />
            <span class="flex align-items-center">第 {{ currentPage }} 页</span>
            <Button
              label="下一页"
              icon="pi pi-chevron-right"
              iconPos="right"
              @click="nextPage"
              :disabled="currentPage * limit >= total"
              class="p-button-text"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.competition-item {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
}

.competition-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.competition-title {
  color: var(--p-text-color);
  font-weight: bold;
}

.pagination-controls {
  background-color: var(--p-content-background);
  border-top: 1px solid var(--p-content-border-color);
  margin-top: 1rem;
}
</style>
