<script setup>
import { ref, onMounted } from 'vue';
// --- 1. 状态定义 ---
// 优秀校友列表的状态
const playersList = ref([]);
const isListLoading = ref(true); // 列表是否正在加载（用于骨架屏）
const listError = ref(null);     // 列表加载错误信息

// 详情弹窗的状态
const isDetailDialogVisible = ref(false); // 详情弹窗是否可见
const playerDialogRef = ref(null);

// --- 2. API 调用逻辑 ---
/**
 * 异步函数：获取优秀校友列表
 */
const fetchPlayerList = async () => {
  isListLoading.value = true;
  listError.value = null;
  fetch('/alumnus/getAlumnusList')
  .then(response => response.json())
  .then(data => {
    if(data && data.statusCode === 200){
      playersList.value = data.data;
    } else {
      listError.value = data.message || '无法加载优秀校友列表，请稍后重试。';
    }
  })
  .catch(e => {
    listError.value = '无法加载优秀校友列表，请稍后重试。';
    console.error(e);
  })
  .finally(() => {
    isListLoading.value = false;
  });
};

/**
 * 异步函数：根据 ID 获取校友详情
 * @param {string} playerId - 被点击的校友ID
 */
const fetchPlayerDetail = async (playerId) => {
  isDetailDialogVisible.value = true;
  playerDialogRef.value.fetchPlayerDetail(playerId);
};

// --- 3. 生命周期钩子 ---

// 当组件挂载完成后，立即获取优秀校友列表
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
          <h1 class="text-3xl font-bold">校友墙</h1>
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
              <template>
                {{ player.wetherInSchool ? '在校生' : '校友' }}
              </template>
            </Card>
          </div>
        </div>

        <div v-else class="text-center p-5">
          <i class="pi pi-inbox" style="font-size: 2rem"></i>
          <p>暂无优秀校友信息</p>
        </div>

      </div>
    </div>

    <PlayerDialog
      ref="playerDialogRef"
      v-model:visible="isDetailDialogVisible"
    />
  </div>
</template>

<style scoped>
/* 页面标题 */
.page-header h1 {
  color: var(--p-text-color);
}

/* 优秀校友卡片样式 */
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
</style>