<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useToken } from "@/composables/useToken";
import { getData } from "@/composables/useStorage";
import { useAlert } from "@/composables/useAlert";
import { useRouter } from "vue-router";

const props = defineProps([
  "currentProgram",
  "currentGroup"
]);

const { getToken } = useToken();
const { alerts } = useAlert();
const router = useRouter();

// --- 状态 ---
const results = ref([]);
const isEditing = ref(false);
const loading = ref(false);
const submitting = ref(false);
const foulEnum = ref({});
const expandedRows = ref({}); // key: road, value: boolean

// --- 辅助函数 ---
const getCurrentTimePeriod = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "MORNING";
  if (hour >= 12 && hour < 17) return "AFTERNOON";
  return "EVENING";
};

// --- API 调用 ---
const fetchResults = async () => {
  if (!props.currentProgram || !props.currentGroup) return;

  loading.value = true;
  try {
    const token = getToken();
    const gameId = getData("gameId");
    
    // 构建请求参数
    const payload = {
      token,
      competitionId: gameId,
      time: getCurrentTimePeriod(),
      program: props.currentProgram.program,
      marked: props.currentProgram.marked,
      group: props.currentGroup
    };

    const res = await fetch("/api/volunteer/reviewResult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.statusCode === 200) {
      // 初始化数据，确保每个结果都有响应式字段
      results.value = (data.data || []).map(item => ({
        ...item,
        // 确保字段存在，防止 undefined
        foulReson: item.foulReson || "",
        foulDescription: item.foulDescription || ""
      }));
    } else {
      alerts("错误", data.message || "获取成绩失败");
    }
  } catch (err) {
    console.error(err);
    alerts("错误", "网络请求失败");
  } finally {
    loading.value = false;
  }
};

const updateResult = async () => {
  submitting.value = true;
  try {
    const token = getToken();
    const gameId = getData("gameId");

    // 准备提交的数据
    const updateData = results.value.map(item => ({
      name: item.name,
      achievements: Number(item.achievements),
      foulOrNot: item.foulOrNot,
      foulReson: item.foulOrNot ? item.foulReson : "",
      foulDescription: item.foulOrNot ? item.foulDescription : "",
      road: item.road // API文档没写需要传road，但为了对应选手，通常需要标识。如果后端是按顺序或名字匹配，这里保留road较安全，或者后端只看data列表顺序？假设按顺序或名字。API文档只说了data[]里的字段。
      // 根据 api_volunteer_updateResult.json，data 是一个列表。
      // 为了安全起见，我们还是传所有字段。
    }));

    const payload = {
      token,
      competitionId: gameId,
      time: getCurrentTimePeriod(),
      program: props.currentProgram.program,
      marked: props.currentProgram.marked,
      group: props.currentGroup,
      data: updateData
    };

    const res = await fetch("/api/volunteer/updateResult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.statusCode === 200) {
      alerts("成功", "成绩修改成功");
      isEditing.value = false;
      // 重新获取数据以确保同步
      await fetchResults();
    } else {
      alerts("失败", data.message || "修改失败");
    }
  } catch (err) {
    console.error(err);
    alerts("错误", "提交失败");
  } finally {
    submitting.value = false;
  }
};

const confirmResult = async () => {
  // 确认前可能需要简单的校验？或者直接确认
  submitting.value = true;
  try {
    const token = getToken();
    const gameId = getData("gameId");

    const payload = {
      token,
      competitionId: gameId,
      time: getCurrentTimePeriod(),
      program: props.currentProgram.program,
      marked: props.currentProgram.marked,
      group: props.currentGroup
    };

    const res = await fetch("/api/volunteer/confirmResult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.statusCode === 200) {
      alerts("成功", "成绩已确认");
    } else {
      alerts("失败", data.message || "确认失败");
    }
  } catch (err) {
    console.error(err);
    alerts("错误", "请求失败");
  } finally {
    submitting.value = false;
  }
};

// --- UI 交互 ---
const toggleExpand = (road) => {
  expandedRows.value[road] = !expandedRows.value[road];
};

const foulOptions = computed(() => {
  return Object.entries(foulEnum.value).map(([key, value]) => ({
    label: value,
    value: key
  }));
});

const getFoulLabel = (key) => {
  return foulEnum.value[key] || key;
};

// --- 生命周期 & 监听 ---
onMounted(() => {
  const storedFoulEnum = getData("foulEnum");
  if (storedFoulEnum) {
    foulEnum.value = storedFoulEnum;
  }
  
  if (props.currentProgram && props.currentGroup) {
    fetchResults();
  }
});

watch(
  [() => props.currentProgram, () => props.currentGroup],
  ([newProgram, newGroup]) => {
    if (newProgram && newGroup) {
      results.value = [];
      isEditing.value = false;
      expandedRows.value = {};
      fetchResults();
    }
  }
);
</script>

<template>
  <div class="update-fouls-container p-4">
    <div v-if="!props.currentProgram || !props.currentGroup" class="text-center">
      <p>请选择比赛项目和组别</p>
    </div>

    <div v-else>
      <div v-if="loading" class="flex justify-content-center">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      </div>

      <div v-else class="flex flex-column gap-3">
        <!-- 列表卡片 -->
        <div v-for="item in results" :key="item.road">
          <Card :class="{ 'foul-bg': item.foulOrNot && !isEditing }">
            <template #content>
              <!-- 头部信息 -->
              <div class="flex align-items-center justify-content-between">
                <div class="flex align-items-center gap-3">
                  <span class="text-xl w-5rem">第{{ item.road }}道</span>
                  <span class="font-bold text-lg">{{ item.name }}</span>
                </div>
                
                <div class="flex align-items-center gap-3">
                  <span 
                    class="font-bold text-xl" 
                    :class="{ 'text-red-500': item.foulOrNot && !isEditing }"
                  >
                    {{ item.achievements }}s
                  </span>
                  <Button 
                    icon="pi pi-angle-down" 
                    text 
                    rounded 
                    @click="toggleExpand(item.road)"
                    :aria-label="expandedRows[item.road] ? '收起' : '展开'"
                    :class="{ 'rotate-180': expandedRows[item.road] }"
                    class="transition-transform duration-200"
                  />
                </div>
              </div>

              <!-- 展开内容 -->
              <div v-if="expandedRows[item.road]" class="mt-3 border-top-1 surface-border pt-3">
                
                <!-- 查看模式 -->
                <div v-if="!isEditing">
                  <div v-if="item.foulOrNot">
                    <div class="mb-2">
                      <span class="font-bold text-red-500 mr-2">犯规类型:</span>
                      <span>{{ getFoulLabel(item.foulReson) }}</span>
                    </div>
                    <div>
                      <span class="font-bold text-red-500 mr-2">备注:</span>
                      <span>{{ item.foulDescription || '无详细备注' }}</span>
                    </div>
                  </div>
                  <div v-else class="text-green-500 font-bold">
                    <i class="pi pi-check-circle mr-2"></i>无异常
                  </div>
                </div>

                <!-- 编辑模式 -->
                <div v-else class="flex flex-column gap-3">
                  <div class="field grid">
                    <label class="col-12 mb-2 md:col-2 md:mb-0">成绩</label>
                    <div class="col-12 md:col-10">
                      <InputNumber 
                        v-model="item.achievements" 
                        mode="decimal" 
                        :minFractionDigits="2" 
                        :maxFractionDigits="2" 
                        class="w-full"
                      />
                    </div>
                  </div>

                  <div class="field-checkbox">
                    <Checkbox v-model="item.foulOrNot" :binary="true" :inputId="'foul-' + item.road" />
                    <label :for="'foul-' + item.road">是否犯规</label>
                  </div>

                  <div class="field grid" v-if="item.foulOrNot">
                    <label class="col-12 mb-2 md:col-2 md:mb-0">犯规类型</label>
                    <div class="col-12 md:col-10">
                      <Select
                        v-model="item.foulReson"
                        :options="foulOptions"
                        option-label="label"
                        option-value="value"
                        placeholder="选择犯规原因"
                        class="w-full"
                      />
                    </div>
                  </div>

                  <div class="field grid" v-if="item.foulOrNot">
                    <label class="col-12 mb-2 md:col-2 md:mb-0">备注说明</label>
                    <div class="col-12 md:col-10">
                      <Textarea
                        v-model="item.foulDescription"
                        rows="2"
                        class="w-full"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </template>
          </Card>
        </div>

        <!-- 底部按钮区 -->
        <div class="flex justify-content-between mt-4 gap-3 sticky-bottom">
          <template v-if="!isEditing">
            <Button 
              label="修改" 
              icon="pi pi-pencil" 
              severity="warning" 
              class="flex-1"
              @click="isEditing = true"
              :disabled="loading || submitting"
            />
            <Button 
              label="确认" 
              icon="pi pi-check" 
              severity="success" 
              class="flex-1"
              @click="confirmResult"
              :disabled="loading || submitting"
            />
          </template>
          
          <template v-else>
            <Button 
              label="完成修改" 
              icon="pi pi-save" 
              class="w-full"
              @click="updateResult"
              :loading="submitting"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.update-fouls-container {
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 5rem; /* Space for bottom buttons if needed */
}

.foul-bg {
  background-color: var(--red-50) !important;
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>