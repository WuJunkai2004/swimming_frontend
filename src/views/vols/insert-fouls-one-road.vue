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
const isFoul = ref(false);
const selectedFoulReason = ref("");
const foulDescription = ref("");

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
      },
    };

    const res = await fetch(
      "/api/volunteer/uploadData?type=REINTAKE_INSPECTION",
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
      // 重置表单
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
  <div class="insert-fouls-container p-4">
    <Card>
      <template #title>
        <div class="flex align-items-center justify-content-between">
          <span>第 {{ road }} 泳道犯规情况汇报</span>
        </div>
      </template>
      <template #content>
        <div class="flex flex-column gap-4">
          <!-- 犯规勾选 -->
          <div class="field-checkbox flex align-items-center gap-2">
            <Checkbox v-model="isFoul" :binary="true" inputId="foulCheck" />
            <label for="foulCheck" class="font-bold">是否犯规</label>
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
              :disabled="!isFoul"
            />
          </div>

          <div class="field">
            <label class="block mb-2">备注说明</label>
            <Textarea
              v-model="foulDescription"
              rows="3"
              class="w-full"
              :disabled="!isFoul"
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
