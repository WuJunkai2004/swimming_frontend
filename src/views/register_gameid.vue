<script setup>
// --- 1. 核心依赖导入 ---
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAlert } from '@/composables/useAlert';

// --- 2. 静态资源导入 ---;
// 导入学院枚举数据
import { collegeMap } from '@/composables/collegeMapping';

// --- 3. 初始化 ---
const route = useRoute();      // 用于获取路由参数
const { alerts } = useAlert(); // 用于错误提示

// 从 URL 中获取比赛 ID
const gameId = route.params.gameid;

// --- 4. 表单数据状态 (Refs) ---
const name = ref('');
const academicNumber = ref(null);
const selectedCollege = ref(null); // 将存储 KEY (例如: SCHOOL_OF_BIOLOGICAL_SCIENCES_AND_ENGINEERING)
const selectedSport = ref(null);   // 将存储 Enum (例如: FREESTYLES_100M)

// --- 5. 选项与加载状态 ---
const gameName = ref("运动员赛事")
const sportOptions = ref([]); // 存储从 API 获取的比赛项目
const isLoading = ref(true);    // 控制页面加载状态（主要用于获取项目列表）
const isSubmitting = ref(false); // 控制提交按钮，防止重复提交
const error = ref(null);        // 存储错误信息

// --- 6. 数据处理与 API 调用 ---

// (处理需求 3): 转换学院枚举对象为 PrimeVue Select 组件所需的数组格式
const collegeOptions = ref(
  Object.entries(collegeMap()).map(([key, value]) => ({
    label: value, // 显示中文名
    value: key   // 提交 KEY
  }))
);

/**
 * (处理需求 4): 组件挂载时，根据 gameId 获取允许的比赛项目
 */
const fetchGameInfo = async () => {
  isLoading.value = true;
  error.value = null;
  fetch(`/sport/getGameInfo?game=${gameId}`)
  .then(response => response.json())
  .then(result => {
    if (result.statusCode === 200) {
      gameName.value = result.data.name || "运动员赛事";
      sportOptions.value = result.data.events.map(item => ({
        label: item.name, // 显示中文名
        value: item.enum  // 提交 Enum
      }));
    } else {
      error.value = result.message || '无法加载赛事信息，请稍后重试';
    }
  })
  .catch(() => {
    error.value = '网络异常，无法加载赛事信息，请稍后重试';
  })
  .finally(() => {
    isLoading.value = false;
  });
};

// 组件挂载后立即执行数据获取
onMounted(fetchGameInfo);

/**
 * (处理需求 5): 提交报名表单
 */
const isAllowSubmit = computed(() => {
  return name.value && academicNumber.value && selectedCollege.value && selectedSport.value && !isSubmitting.value;
});

const handleSubmit = async () => {
  if (!isAllowSubmit.value) {
    alerts('提交失败', '请填写所有必填项', {icon: 'pi pi-exclamation-triangle'});
    return;
  }

  isSubmitting.value = true;

  const registrationData = {
    name: name.value,
    academicNumber: academicNumber.value,
    sportType: selectedSport.value,
    college: selectedCollege.value,
    gameId: gameId
  };

  fetch('/sport/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(registrationData)
  })
  .then(response => response.json())
  .then(result => {
    if (result.statusCode === 200) {
      alerts('提交成功', '您已成功报名！', {icon: 'pi pi-check-circle'});
      name.value = '';
      academicNumber.value = null;
      selectedCollege.value = null;
      selectedSport.value = null;
    } else {
      error.value = result.message || '报名失败，请稍后重试';
    }
  })
  .catch(() => {
    error.value = '网络异常，报名失败，请稍后重试';
  })
  .finally(() => {
    isSubmitting.value = false;
    if(error.value) {
      alerts('提交出错', error.value, {icon: 'pi pi-times-circle'});
    }
  });
};
</script>

<template>
  <div style="overflow-x: hidden;">
    <MobileMenuBar />
    <ComputerMenuBar />

    <div class="hero-section text-white flex align-items-center justify-content-center">
      <div class="hero-overlay"></div>
      <h1 class="hero-title text-center">{{ gameName }}报名</h1>
    </div>

    <div class="grid justify-content-center main-content">
      <div class="col-12 md:col-10 lg:col-8 xl:col-6">

        <Card class="query-panel">
          <template #content>

            <div v-if="isLoading" class="text-center p-5">
              <ProgressSpinner />
              <p class="mt-2">正在加载赛事信息...</p>
            </div>

            <div v-else-if="error">
              <Message severity="error" :closable="false">{{ error }}</Message>
            </div>

            <div v-else class="flex flex-column gap-5">

              <div class="step p-float-label">
                <label class="step-label">姓名</label>
                <InputText id="name" v-model="name" class="w-full" />
              </div>

              <div class="step p-float-label">
                <label class="step-label">学号</label>
                <InputNumber id="academicNumber" v-model="academicNumber" class="w-full" :useGrouping="false" />
              </div>

              <div class="step p-float-label">
                <label class="step-label">学院</label>
                <Select
                  id="college"
                  v-model="selectedCollege"
                  :options="collegeOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="请选择学院"
                  class="w-full"
                />
              </div>

              <div class="step p-float-label">
                <label class="step-label">比赛项目</label>
                <Select
                  id="sport"
                  v-model="selectedSport"
                  :options="sportOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="请选择报名的项目"
                  class="w-full"
                  :disabled="sportOptions.length === 0"
                />
              </div>

              <Button
                label="确认提交报名"
                icon="pi pi-check"
                class="w-full mt-3"
                :loading="isSubmitting"
                :disabled="!isAllowSubmit"
                @click="handleSubmit"
              />

            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-section {
  position: relative;
  height: 40vh;
  min-height: 250px;
  /* 您可以替换成赛事相关的背景图 */
  background: url('https://images.unsplash.com/photo-1575361204480-aadea2503968?q=80&w=2070&auto=format&fit=crop') no-repeat center center;
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
  background-color: var(--p-surface-50);
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

/* 让 Select 和 InputNumber 在 FloatLabel 中宽度100% */
:deep(.p-select) {
  width: 100%;
}
:deep(.p-inputnumber) {
  width: 100%;
}
</style>