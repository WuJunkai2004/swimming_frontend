<script setup>
import { ref, onMounted, computed } from "vue";
import { getData } from "@/composables/useStorage";
import { useAlert } from "@/composables/useAlert";
import { useToken } from "@/composables/useToken";
import { useRouter } from "vue-router";

const { alerts } = useAlert();
const { getToken } = useToken();
const router = useRouter();

// 状态
const gameId = ref("");
const road = ref("");
const schedule = ref([]);
const filteredSchedule = ref([]);
const selectedProgram = ref(null);
const foulEnum = ref({});
const submitting = ref(false);

// 表单数据
const score1 = ref("");
const score2 = ref("");
const isFoul = ref(false);
const selectedFoulReason = ref("");
const foulDescription = ref("");

// 辅助函数：将时间字符串转换为秒数
const parseTimeToSeconds = (timeStr) => {
  if (!timeStr) {
    return 0;
  }
  // 将中文冒号和句号替换为标准符号
  let str = timeStr.replace("：", ":").replace("。", ".");

  let minutes = 0;
  let seconds = 0;

  if (str.includes(":")) {
    const parts = str.split(":");
    if (parts.length === 2) {
      minutes = parseFloat(parts[0]);
      seconds = parseFloat(parts[1]);
    } else {
      return parseFloat(str) || 0;
    }
  } else {
    seconds = parseFloat(str);
  }

  return minutes * 60 + seconds;
};

// 计算平均成绩
const finalScore = computed(() => {
  const s1 = parseTimeToSeconds(score1.value);
  const s2 = parseTimeToSeconds(score2.value);

  if (!s1 || !s2) {
    return 0;
  }

  const avg = (s1 + s2) / 2;
  return avg.toFixed(2);
});

// 下拉框选项
const foulOptions = computed(() => {
  return Object.entries(foulEnum.value).map(([key, value]) => ({
    label: value,
    value: key,
  }));
});

// 获取当前时间段逻辑
const getCurrentTimePeriod = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "MORNING";
  if (hour >= 12 && hour < 17) return "AFTERNOON";
  return "EVENING"; // 17:00 - 06:00 (次日) - 简化为晚上
};

const getTodayDateStr = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// 加载赛程
const loadSchedule = () => {
  // 直接从本地存储获取赛程 (由父级 index.vue 加载)
  const storedSchedule = getData('schedule');
  if (storedSchedule && storedSchedule.length > 0) {
    schedule.value = storedSchedule;
    filterSchedule();
  } else {
    // 如果没有赛程，提示用户或显示空状态
    alerts('提示', '暂无赛程信息或赛程加载失败');
    schedule.value = [];
    filteredSchedule.value = [];
  }
};

const filterSchedule = () => {
  const today = getTodayDateStr();
  const period = getCurrentTimePeriod();

  // 查找今日和当前时间段的赛程项
  const currentSession = schedule.value.find(
    (item) => item.date === today && item.time === period,
  );

  if (currentSession && currentSession.total) {
    // 根据API文档，'total' 包含比赛项目
    // 我们将其映射为可用结构
    filteredSchedule.value = currentSession.total.map((item, index) => ({
      // 假设 'program' 是名称/ID。API文档显示 "program": "MAN_BUTTERFLY_50M"
      // 我们可能想要构建一个可读的标签，或者直接使用代码
      label: `${item.program} (组数: ${item.totalGroup})`,
      value: item, // 存储整个项目对象
      id: index, // 如果需要，提供临时ID用于选择
    }));
  } else {
    filteredSchedule.value = [];
    alerts("提示", `未找到今日 ${period} 的比赛安排`);
  }
};

const submitData = async () => {
  if (!selectedProgram.value) {
    alerts("警告", "请选择比赛项目");
    return;
  }

  if (!score1.value || !score2.value) {
    alerts("警告", "请输入两次成绩");
    return;
  }

  if (isFoul.value && !selectedFoulReason.value) {
    alerts("警告", "请选择犯规原因");
    return;
  }

  submitting.value = true;

  try {
    const token = getToken();
    const payload = {
      token: token,
      // API文档中的参数: { token: "...", id: "...", gameId: "...", data: {...} }
      // id: 结果编号
      // gameId: uuid

      gameId: gameId.value,
      // 使用选定项目的 program 字段作为标识符，因为这是当前唯一的会话标识
      id: selectedProgram.value.program,

      data: {
        foulOrNot: isFoul.value,
        foulReson: isFoul.value ? selectedFoulReason.value : "",
        foulDescription: foulDescription.value,
        achievements: parseFloat(finalScore.value),
      },
    };

    const res = await fetch("/api/volunteer/uploadData?type=TIMER", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.statusCode === 200) {
      alerts("成功", "成绩提交成功");
      // 重置表单
      score1.value = "";
      score2.value = "";
      isFoul.value = false;
      selectedFoulReason.value = "";
      foulDescription.value = "";
    } else {
      alerts("失败", data.message || "提交失败");
    }
  } catch (e) {
    console.error(e);
    alerts("错误", "提交出错");
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  const storedGameId = getData("gameId");
  const storedRoad = getData("road");
  const storedFoulEnum = getData("foulEnum");

  if (storedGameId) gameId.value = storedGameId;
  if (storedRoad) road.value = storedRoad;
  if (storedFoulEnum) foulEnum.value = storedFoulEnum;

  if (gameId.value) {
    loadSchedule();
  } else {
    alerts("警告", "未找到比赛信息，请重新登录");
    router.push("/login");
  }
});
</script>

<template>
  <div class="insert-score-container p-4">
    <Card>
      <template #title>
        <div class="flex align-items-center justify-content-between">
          <span>第 {{ road }} 泳道成绩录入</span>
        </div>
      </template>
      <template #content>
        <div class="flex flex-column gap-4">
          <!-- 选择比赛项目 -->
          <div class="field">
            <label class="block mb-2 font-bold"
              >选择比赛项目 (今日 {{ getCurrentTimePeriod() }})</label
            >
            <Select
              v-model="selectedProgram"
              :options="filteredSchedule"
              option-label="label"
              placeholder="请选择当前进行的比赛项目"
              class="w-full"
            />
          </div>

          <!-- 成绩输入 -->
          <div class="field">
            <label class="block mb-2 font-bold"
              >第一次手计时 (秒 或 分:秒)</label
            >
            <InputText
              v-model="score1"
              placeholder="例如: 28.5 或 1:05.20"
              class="w-full"
            />
          </div>

          <div class="field">
            <label class="block mb-2 font-bold"
              >第二次手计时 (秒 或 分:秒)</label
            >
            <InputText
              v-model="score2"
              placeholder="例如: 28.6 或 1:05.30"
              class="w-full"
            />
          </div>

          <div class="field">
            <label class="block mb-2 font-bold">最终成绩 (平均)</label>
            <div class="text-xl text-primary font-bold">
              {{ finalScore }} 秒
            </div>
          </div>

          <!-- 犯规部分 -->
          <div class="field-checkbox flex align-items-center gap-2">
            <Checkbox v-model="isFoul" :binary="true" inputId="foulCheck" />
            <label for="foulCheck" class="font-bold">是否犯规</label>
          </div>

          <div
            v-if="isFoul"
            class="foul-details p-3 surface-ground border-round"
          >
            <div class="field mb-3">
              <label class="block mb-2">犯规类型</label>
              <Select
                v-model="selectedFoulReason"
                :options="foulOptions"
                option-label="label"
                option-value="value"
                placeholder="选择犯规原因"
                class="w-full"
              />
            </div>

            <div class="field">
              <label class="block mb-2">备注说明</label>
              <Textarea v-model="foulDescription" rows="3" class="w-full" />
            </div>
          </div>

          <!-- 提交按钮 -->
          <Button
            label="提交成绩"
            icon="pi pi-check"
            class="w-full"
            @click="submitData"
            :loading="submitting"
            :disabled="submitting || !selectedProgram"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.insert-score-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>