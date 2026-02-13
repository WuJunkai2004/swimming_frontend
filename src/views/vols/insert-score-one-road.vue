<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { getData } from "@/composables/useStorage";
import { useAlert } from "@/composables/useAlert";
import { useToken } from "@/composables/useToken";
import { useRouter } from "vue-router";

const props = defineProps(["currentProgram", "currentGroup", "athleteList"]);

const { alerts } = useAlert();
const { getToken } = useToken();
const router = useRouter();

// 状态
const gameId = ref("");
const road = ref("");
const foulEnum = ref({});
const submitting = ref(false);
const uploadId = ref(null);

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

// 获取上传ID
const setUploadId = () => {
  uploadId.value = null;
  if (!props.currentProgram || !props.currentGroup || !props.athleteList) {
    return;
  }

  const found = props.athleteList.find(item =>
    item.group === props.currentGroup &&
    item.marked === props.currentProgram.marked
  );

  if (found) {
    uploadId.value = found.id;
  }
};

// 监听项目和组别以及选手列表变化
watch(
  [() => props.currentProgram, () => props.currentGroup, () => props.athleteList],
  () => {
    score1.value = "";
    score2.value = "";
    isFoul.value = false;
    selectedFoulReason.value = "";
    foulDescription.value = "";

    setUploadId();
  },
);

const submitData = async () => {
  if (!props.currentProgram) {
    alerts("警告", "请先在上方选择比赛项目");
    return;
  }

  if (!props.currentGroup) {
    alerts("警告", "请先在上方选择组别");
    return;
  }

  if (!uploadId.value) {
    alerts("警告", "无法获取上传ID，请确认选组和泳道信息是否匹配");
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

  const getFoulReason = (index) => {
    if (!isFoul.value) {
      return "";
    }
    return foulOptions.value[index] ? foulOptions.value[index].label : "";
  }

  try {
    const token = getToken();
    const payload = {
      token: token,
      gameId: gameId.value,
      id: uploadId.value,

      data: {
        foulOrNot: isFoul.value,
        foulReason: getFoulReason(selectedFoulReason.value),
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

  if (!gameId.value) {
    alerts("警告", "未找到比赛信息，请重新登录");
    router.push("/login");
  } else {
    setUploadId();
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
            :disabled="submitting || !props.currentProgram"
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
