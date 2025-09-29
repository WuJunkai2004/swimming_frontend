<script setup>
import { ref, computed } from 'vue';
import { useAlert } from '@/composables/useAlert';
import { swimLevels } from '@/composables/swimmingLevel';

// 1. 状态管理：定义所有需要的数据
// ========================================================================
const levelData = ref(swimLevels());
const { alerts } = useAlert();

// 用户输入和选择的状态
const selectedPoolType = ref('50mPools');
const selectedProjectName = ref(null);
const selectedGender = ref(null);
const inputMinutes = ref(null);
const inputSeconds = ref(null);

// 选项数据
const poolOptions = ref([
  { label: '50米池 (长池)', value: '50mPools' },
  { label: '25米池 (短池)', value: '25mPools' }
]);
const genderOptions = ref([
  { label: '男子', value: 'manLevel' },
  { label: '女子', value: 'womanLevel' }
]);


// 2. 计算属性：根据用户输入动态计算出所需的数据和状态
// ========================================================================

// 动态生成项目下拉选项
const projectOptions = computed(() => {
  if (!selectedPoolType.value) return [];
  return levelData.value[selectedPoolType.value].map(p => ({
    label: p.project,
    value: p.project
  }));
});

// 将用户输入的分钟和秒转换成总秒数
const userTotalSeconds = computed(() => {
  const mins = parseFloat(inputMinutes.value) || 0;
  const secs = parseFloat(inputSeconds.value) || 0;
  return mins * 60 + secs;
});

// 根据用户的选择，筛选出对应的等级标准表格数据
const currentLevelStandard = computed(() => {
  if (!selectedPoolType.value || !selectedProjectName.value || !selectedGender.value) {
    return null;
  }
  const projectData = levelData.value[selectedPoolType.value].find(
    p => p.project === selectedProjectName.value
  );
  return projectData ? projectData[selectedGender.value] : null;
});

// 核心计算逻辑：根据用户成绩计算出达到的等级
const showResultDialog = (levelName) => {
  console.log('评定结果:', levelName);
  alerts('评定结果', levelName, {icon: 'pi pi-check-circle'});
};

// 新增提交查询的函数
const handleSubmitQuery = () => {
  console.log('用户总秒数:', userTotalSeconds.value);
  if (!userTotalSeconds.value || userTotalSeconds.value <= 0) {
    showResultDialog('请输入有效的成绩');
    return;
  }

  const standards = [...currentLevelStandard.value].reverse();
  for (const level of standards) {
    if (userTotalSeconds.value <= level.marks) {
      // 找到最高等级并弹窗显示
      showResultDialog(level.levelName);
      return;
    }
  }
  showResultDialog('未达到等级标准');
};

// 3. 辅助函数：处理UI交互
// 当用户的选择变化时，重置后续的步骤
const resetFollowingSteps = (step) => {
  if (step <= 1) {
    selectedProjectName.value = null;
  }
  if (step <= 2) {
    selectedGender.value = null;
  }
  if (step <= 3) {
    inputMinutes.value = null;
    inputSeconds.value = null;
  }
};
</script>

<template>
  <div>
    <MobileMenuBar />
    <ComputerMenuBar />

    <div class="hero-section text-white flex align-items-center justify-content-center">
      <div class="hero-overlay"></div>
      <h1 class="hero-title text-center">游泳运动员技术等级查询</h1>
    </div>

    <div class="grid justify-content-center main-content">
      <div class="col-12 md:col-10 lg:col-8 xl:col-6">

        <Card class="query-panel">
          <template #content>
            <div class="flex flex-column gap-5">

              <div class="step">
                <label class="step-label">泳池类型</label>
                <SelectButton
                  v-model="selectedPoolType"
                  :options="poolOptions"
                  optionLabel="label"
                  optionValue="value"
                  @change="resetFollowingSteps(1)"
                />
              </div>

              <transition name="fade">
                <div v-if="selectedPoolType" class="step">
                  <label class="step-label">选择竞赛项目</label>
                  <Select
                    v-model="selectedProjectName"
                    :options="projectOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="请选择项目"
                    class="w-full"
                    @change="resetFollowingSteps(2)"
                  />
                </div>
              </transition>

              <transition name="fade">
                <div v-if="selectedProjectName" class="step">
                  <label class="step-label">选择性别</label>
                  <SelectButton
                    v-model="selectedGender"
                    :options="genderOptions"
                    optionLabel="label"
                    optionValue="value"
                    @change="resetFollowingSteps(3)"
                  />
                </div>
              </transition>

              <transition name="fade">
                <div v-if="selectedGender" class="step">
                  <label class="step-label">最好成绩</label>
                  <InputGroup>
                    <InputNumber v-model="inputMinutes" placeholder="分" :min="0" />
                    <InputGroupAddon>:</InputGroupAddon>
                    <InputNumber v-model="inputSeconds" placeholder="秒" mode="decimal" :min="0" :max="59.99" :minFractionDigits="2" :maxFractionDigits="2" />
                  </InputGroup>
                  <Button
                    label="查询等级"
                    icon="pi pi-search"
                    class="w-full mt-4"
                    :disabled="!inputSeconds"
                    @click="handleSubmitQuery"
                  />
                </div>
              </transition>

            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid {
  width: 100%;
}
.hero-section {
  position: relative;
  height: 40vh;
  min-height: 250px;
  background: url('https://images.unsplash.com/photo') no-repeat center center;
  background-size: cover;
}
.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.4);
  z-index: 1;
}
.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 20, 40, 0.7), rgba(0, 50, 90, 0.5));
}
.hero-title {
  position: relative;
  z-index: 1;
  font-size: 3rem;
  font-weight: 300;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

/* 主内容区 */
.main-content {
  margin-top: -100px; /* 负边距实现悬浮效果 */
  position: relative;
  z-index: 2;
  padding-bottom: 4rem;
}
.query-panel {
  background-color: var(--p-card-color);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

/* 步骤样式 */
.step {
  display: flex;
  flex-direction: column;
}
.step-label {
  display: block;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--p-text-color);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 移动端响应式调整 */
@media (max-width: 767px) {
  .hero-title {
    font-size: 2rem;
  }
  .main-content {
    margin-top: -80px;
  }
}
</style>