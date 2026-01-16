<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { getData } from "@/composables/useStorage";
import { useAlert } from "@/composables/useAlert";
import { useToken } from "@/composables/useToken";
import { useRouter } from "vue-router";

const props = defineProps(["currentProgram"]);

const { alerts } = useAlert();
const { getToken } = useToken();
const router = useRouter();

// 状态
const gameId = ref("");
const foulOccurred = ref(null); // 选中的泳道
const foulEnum = ref({});
const submitting = ref(false);
const selectedFoulReason = ref("");
const foulDescription = ref("");

// 泳道选项 (1-10道)
const roadOptions = Array.from({ length: 8 }, (_, i) => ({
  label: `${i + 1}`,
  value: i + 1,
}));

// 下拉框选项
const foulOptions = computed(() => {
  return Object.entries(foulEnum.value).map(([key, value]) => ({
    label: value,
    value: key,
  }));
});

const isSelectRoad = computed(() => !!foulOccurred.value);

// 监听项目变化，重置表单
watch(
  () => props.currentProgram,
  () => {
    foulOccurred.value = null;
    selectedFoulReason.value = "";
    foulDescription.value = "";
  },
);

const submitData = async () => {
  if (!props.currentProgram) {
    alerts("警告", "请先在上方选择比赛项目");
    return;
  }

  if (!foulOccurred.value) {
    alerts("警告", "请选择犯规泳道");
    return;
  }

  if (!selectedFoulReason.value) {
    alerts("警告", "请选择犯规原因");
    return;
  }

  submitting.value = true;

  try {
    const token = getToken();
    const payload = {
      token: token,
      gameId: gameId.value,
      // 使用选定项目的 program 字段作为标识符
      id: props.currentProgram.program,

      data: {
        foulOrNot: true, // 既然选了泳道并提交，肯定是有犯规
        foulReson: selectedFoulReason.value,
        foulDescription: foulDescription.value,
        road: foulOccurred.value, // 必须带上泳道号
      },
    };

    const res = await fetch(
      "/api/volunteer/uploadData?type=TECHNICAL_INSPECTION_OF_SWIMMING_IN",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await res.json();
    if (data.statusCode === 200) {
      alerts("成功", "犯规情况提交成功");
      // 重置表单，以便连续提交
      foulOccurred.value = null;
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
  const storedFoulEnum = getData("foulEnum");

  if (storedGameId) gameId.value = storedGameId;
  if (storedFoulEnum) foulEnum.value = storedFoulEnum;

  if (!gameId.value) {
    alerts("警告", "未找到比赛信息，请重新登录");
    router.push("/login");
  }
});
</script>

<template>
  <div class="insert-fouls-container p-4">
    <Card>
      <template #title>
        <div class="flex align-items-center justify-content-between">
          <span>泳道犯规情况汇报</span>
        </div>
      </template>
      <template #content>
        <div class="flex flex-column gap-4">
          <!-- 犯规勾选 -->

          <div class="field-checkbox flex align-items-center gap-2">
            <SelectButton
              v-model="foulOccurred"
              :options="roadOptions"
              :disabled="!props.currentProgram"
              option-label="label"
              option-value="value"
              class="w-full"
              fluid
            />
          </div>

          <!-- 犯规详情 -->
          <div class="field mb-3">
            <label class="block mb-2">犯规类型</label>
            <Select
              v-model="selectedFoulReason"
              :options="foulOptions"
              option-label="label"
              option-value="value"
              placeholder="选择犯规原因"
              class="w-full"
              :disabled="!isSelectRoad"
            />
          </div>

          <div class="field">
            <label class="block mb-2">备注说明</label>
            <Textarea
              v-model="foulDescription"
              rows="3"
              class="w-full"
              :disabled="!isSelectRoad"
            />
          </div>

          <!-- 提交按钮 -->
          <Button
            label="提交"
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
.insert-fouls-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>
