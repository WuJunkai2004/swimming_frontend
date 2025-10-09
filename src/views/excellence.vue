<script setup>
import { ref, onMounted } from 'vue';
// --- 1. 状态定义 ---
// 优秀运动员列表的状态
const playersList = ref([]);
const isListLoading = ref(true); // 列表是否正在加载（用于骨架屏）
const listError = ref(null);     // 列表加载错误信息

// 详情弹窗的状态
const isDetailDialogVisible = ref(false); // 详情弹窗是否可见
const isDetailLoading = ref(false);       // 详情是否正在加载（用于弹窗内的Spinner）
const selectedPlayerDetail = ref(null); // 存储当前选中运动员的详细数据

// --- 2. API 调用逻辑 ---
/**
 * 异步函数：获取优秀运动员列表
 */
const fetchPlayerList = async () => {
  isListLoading.value = true;
  listError.value = null;
  fetch('/player/getExcellenceList')
  .then(response => response.json())
  .then(data => {
    if(data && data.statusCode === 200){
      playersList.value = data.data;
    } else {
      listError.value = data.message || '无法加载优秀运动员列表，请稍后重试。';
    }
  })
  .catch(e => {
    listError.value = '无法加载优秀运动员列表，请稍后重试。';
    console.error(e);
  })
  .finally(() => {
    isListLoading.value = false;
  });
};

/**
 * 异步函数：根据 ID 获取运动员详情
 * @param {string} playerId - 被点击的运动员ID
 */
const fetchPlayerDetail = async (playerId) => {
  // 1. 立即打开弹窗，并显示加载状态
  isDetailDialogVisible.value = true;
  isDetailLoading.value = true;
  selectedPlayerDetail.value = null; // 清空上次的数据

  fetch(`/player/getExcellenceDetail?id=${playerId}`)
  .then(response => response.json())
  .then(data => {
    if(data && data.statusCode === 200){
      selectedPlayerDetail.value = data.data;
    } else {
      selectedPlayerDetail.value = { error: data.message || '获取详情失败' };
    }
  })
  .catch(e => {
    selectedPlayerDetail.value = { error: '获取详情失败' };
    console.error(e);
  })
  .finally(() => {
    isDetailLoading.value = false;
  });
};

// --- 3. 生命周期钩子 ---

// 当组件挂载完成后，立即获取优秀运动员列表
onMounted(() => {
  fetchPlayerList();
});
</script>

<template>
  <div style="overflow-x: hidden;">
    <MobileMenuBar />
    <ComputerMenuBar />

      <div class="grid justify-content-center mt-4">
        <div class="col-12 lg:col-10 xl:col-8">

          <div class="page-header px-3 mb-4">
            <h1 class="text-3xl font-bold">优秀运动员表彰</h1>
            <Divider />
          </div>

          <div v-if="isListLoading" class="grid px-3">
            <div v-for="n in 3" :key="n" class="col-12 md:col-6 lg:col-4 p-2">
              <Skeleton height="350px" borderRadius="12px" />
            </div>
          </div>

          <div v-else-if="listError" class="px-3">
            <Message severity="error" :closable="false">{{ listError }}</Message>
          </div>

          <div v-else-if="playersList.length > 0" class="grid px-2">
            <div 
              v-for="player in playersList" 
              :key="player.id" 
              class="col-12 md:col-6 lg:col-4 p-2"
            >
              <Card class="player-card" @click="fetchPlayerDetail(player.id)">
                <template #header>
                  <div class="card-image-wrapper">
                    <img v-if="player.imgUrl" :src="player.imgUrl" :alt="player.name" class="player-image" />
                    <Avatar v-else :label="player.name.charAt(0)" size="xlarge" shape="circle" class="placeholder-avatar" />
                  </div>
                </template>
                <template #title>
                  {{ player.name }}
                </template>
                <template #subtitle>
                  {{ player.grade }} ({{ player.age }}岁)
                </template>
              </Card>
            </div>
          </div>

          <div v-else class="text-center p-5">
            <i class="pi pi-inbox" style="font-size: 2rem"></i>
            <p>暂无优秀运动员信息</p>
          </div>

        </div>
      </div>


    <Dialog 
      v-model:visible="isDetailDialogVisible" 
      modal 
      header="运动员详情" 
      :style="{ width: '90vw', maxWidth: '650px' }"
      :dismissableMask="true"
    >
      <div v-if="isDetailLoading" class="detail-loading text-center p-5">
        <ProgressSpinner />
        <p>正在加载详情...</p>
      </div>

      <div v-else-if="selectedPlayerDetail">
        <div v-if="selectedPlayerDetail.error">
            <Message severity="error" :closable="false">加载失败: {{ selectedPlayerDetail.error }}</Message>
        </div>

        <div v-else class="player-detail-content">
          <div class="flex flex-column align-items-center md:flex-row align-items-start gap-4">
            <Avatar v-if="!selectedPlayerDetail.imgUrl" :label="selectedPlayerDetail.name.charAt(0)" size="xlarge" shape="circle" class="detail-avatar" />
            <img v-else :src="selectedPlayerDetail.imgUrl" :alt="selectedPlayerDetail.name" class="detail-image" />

            <div class="flex-1 text-center md:text-left">
              <h2 class="text-3xl font-bold mb-2">{{ selectedPlayerDetail.name }}</h2>
              <Tag :value="selectedPlayerDetail.grade" severity="info" class="mr-2"></Tag>
              <Tag :value="`${selectedPlayerDetail.age}岁`"></Tag>
              <Divider />
              <p class="introduction">
                {{ selectedPlayerDetail.introduction || '暂无简介。' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
/* 页面标题 */
.page-header h1 {
  color: var(--p-text-color);
}

/* 优秀运动员卡片样式 */
.player-card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  border-radius: 12px; /* 增加圆角使其更柔和 */
  overflow: hidden; /* 确保图片圆角生效 */
}
.player-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* 卡片图片容器 */
.card-image-wrapper {
  height: 250px;
  background-color: var(--p-surface-200);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.player-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 确保图片填满容器而不变形 */
}
.placeholder-avatar {
  font-size: 3rem;
  width: 100px;
  height: 100px;
}

/* 弹窗详情页样式 */
.detail-image {
  width: 150px;
  height: 150px;
  border-radius: 50%; /* 圆形头像 */
  object-fit: cover;
  border: 4px solid var(--p-content-border-color);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.detail-avatar {
  font-size: 4rem;
  width: 150px;
  height: 150px;
}
.introduction {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--p-text-color);
}
</style>