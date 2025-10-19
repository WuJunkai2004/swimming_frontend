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
const selectedLeaderDetail = ref(null); // 存储当前选中领导的详细数据

// 计算属性：控制弹窗显示状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

/**
 * 异步函数：根据 ID 获取领导详情
 * @param {string} leaderId - 被点击的领导ID
 */
const fetchLeaderDetail = (leaderId) => {
  // 1. 显示加载状态
  isDetailLoading.value = true;
  selectedLeaderDetail.value = null; // 清空上次的数据

  fetch(`/leader/getLeaderDetail?id=${leaderId}`)
  .then(response => response.json())
  .then(data => {
    if(data && data.statusCode === 200){
      selectedLeaderDetail.value = data.data;
    } else {
      selectedLeaderDetail.value = { error: data.message || '获取详情失败' };
    }
  })
  .catch(e => {
    selectedLeaderDetail.value = { error: '获取详情失败' };
    console.error(e);
  })
  .finally(() => {
    isDetailLoading.value = false;
  });
};

// 暴露方法给父组件调用
defineExpose({
  fetchLeaderDetail
});
</script>

<template>
  <Dialog 
    v-model:visible="dialogVisible" 
    modal 
    header="成员详情" 
    :style="{ width: '90vw', maxWidth: '650px' }"
    dismissableMask
    :draggable="false"
  >
    <div v-if="isDetailLoading" class="detail-loading text-center p-5">
      <ProgressSpinner />
      <p>正在加载详情...</p>
    </div>

    <div v-else-if="selectedLeaderDetail">
      <div v-if="selectedLeaderDetail.error">
        <Message severity="error" :closable="false">加载失败: {{ selectedLeaderDetail.error }}</Message>
      </div>

      <div v-else class="leader-detail-content">
        <div class="flex flex-column align-items-center md:flex-row align-items-start gap-4">
          <Avatar v-if="!selectedLeaderDetail.imgUrl" :label="selectedLeaderDetail.name.charAt(0)" size="xlarge" shape="circle" class="detail-avatar" />
          <img v-else :src="selectedLeaderDetail.imgUrl" :alt="selectedLeaderDetail.name" class="detail-image" />

          <div class="flex-1 text-center md:text-left">
            <h2 class="text-3xl font-bold mb-2">{{ selectedLeaderDetail.name }}</h2>
            <Tag :value="selectedLeaderDetail.position" severity="info" class="mr-2"></Tag>
            <Tag :value="`${selectedLeaderDetail.age}岁`"></Tag>
            <Divider />
            <p class="introduction">
              {{ selectedLeaderDetail.introduction || '暂无简介。' }}
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