<script setup>
import { ref, computed } from 'vue';

// 定义 props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

// 定义 emits
const emit = defineEmits(['update:visible']);

// 详情弹窗的状态
const isDetailLoading = ref(false);     // 详情是否正在加载（用于弹窗内的Spinner）
const selectedPlayerDetail = ref(null); // 存储当前选中领导的详细数据

// 计算属性：控制弹窗显示状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

/**
 * 异步函数：根据 ID 获取运动员详情
 * @param {string} playerId - 被点击的运动员ID
 */
const fetchPlayerDetail = (playerId) => {
  // 1. 显示加载状态
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

// 暴露方法给父组件调用
defineExpose({
  fetchPlayerDetail
});
</script>

<template>
  <Dialog 
    v-model:visible="dialogVisible" 
    modal 
    header="运动员详情" 
    :style="{ width: '90vw', maxWidth: '650px' }"
    dismissableMask
    :draggable="false"
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
</template>

<style scoped>
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