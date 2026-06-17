<script setup>
import { ref, watch, onMounted } from "vue";
import { useToken } from "#/useToken";
import { useAlert } from "#/useAlert";
import { useFoulEnum } from "#/foulMapping";
import { funVolunteerApi } from "@/api/serve.js";

const props = defineProps(["currentEvent"]);

const { getToken } = useToken();
const { alerts } = useAlert();
const foulState = useFoulEnum();

const results = ref([]);
const loading = ref(false);
const hasChanges = ref(false);

// 从 reviewResults 获取当前项目+轮次的道次列表和成绩
const fetchResults = async () => {
  if (!props.currentEvent) return;

  loading.value = true;
  try {
    const res = await funVolunteerApi.reviewResults({
      token: getToken(),
      eventId: props.currentEvent.eventId,
      round: props.currentEvent.round || 1,
    });
    const data = await res.json();
    if (data.statusCode === 200) {
      // 为每条记录增加编辑字段
      results.value = (data.data || []).map((item) => ({
        ...item,
        _rawScore: item.rawScore,
        _isValid: item.isValid !== false,
        _invalidType: item.invalidType || null,
        _invalidReason: item.invalidReason || "",
      }));
      hasChanges.value = false;
    } else {
      alerts("错误", data.message || "获取成绩列表失败");
      results.value = [];
    }
  } catch (e) {
    console.error("Fetch results error:", e);
    alerts("错误", "网络异常，无法获取成绩列表");
  } finally {
    loading.value = false;
  }
};

watch(() => props.currentEvent, fetchResults);

const foulOptions = ref([]);
const loadFoulOptions = () => {
  foulOptions.value = Object.entries(foulState.foulMap).map(([value, label]) => ({
    label,
    value,
  }));
};

const markChanged = () => {
  hasChanges.value = true;
};

const submitData = async () => {
  if (!props.currentEvent) {
    alerts("警告", "请先选择比赛项目");
    return;
  }

  if (!hasChanges.value) {
    alerts("提示", "没有需要提交的修改");
    return;
  }

  const token = getToken();
  const eventId = props.currentEvent.eventId;
  const round = props.currentEvent.round || 1;

  let successCount = 0;
  let failCount = 0;

  for (const item of results.value) {
    const payload = {
      token,
      eventId,
      road: item.road,
      round,
      rawScore: item._rawScore,
      isValid: item._isValid,
    };

    if (!item._isValid) {
      payload.invalidType = item._invalidType;
      payload.invalidReason = item._invalidReason;
    }

    try {
      const res = await funVolunteerApi.uploadResult(payload);
      const data = await res.json();
      if (data.statusCode === 200) {
        successCount++;
      } else {
        failCount++;
        console.error(`Upload failed for road ${item.road}:`, data.message);
      }
    } catch (e) {
      failCount++;
      console.error(`Upload error for road ${item.road}:`, e);
    }
  }

  if (failCount === 0) {
    alerts("提示", `成功录入 ${successCount} 条成绩`);
    hasChanges.value = false;
    await fetchResults();
  } else {
    alerts("错误", `成功 ${successCount} 条，失败 ${failCount} 条，请检查网络或刷新重试`);
    await fetchResults();
  }
};

defineExpose({ submit: submitData });

onMounted(() => {
  loadFoulOptions();
  if (props.currentEvent) fetchResults();
});
</script>

<template>
  <div class="p-4">
    <Card>
      <template #title>成绩录入</template>
      <template #content>
        <div v-if="loading" class="text-center p-4">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        </div>
        <div v-else-if="results.length === 0" class="text-center p-4">
          请选择项目或该项目暂无选手
        </div>
        <div v-else class="flex flex-column gap-3">
          <div
            v-for="item in results"
            :key="item.road"
            class="p-3 border-round surface-card shadow-1 border-1 surface-border"
          >
            <div class="flex align-items-center justify-content-between mb-2">
              <div class="flex align-items-center gap-2">
                <Tag :value="`第 ${item.road} 道`" severity="primary" />
                <span class="font-bold">{{ item.college }}</span>
              </div>
              <div class="flex align-items-center gap-2">
                <label class="text-sm">成绩有效</label>
                <Checkbox
                  v-model="item._isValid"
                  :binary="true"
                  @change="markChanged"
                />
              </div>
            </div>

            <div class="flex flex-column gap-2">
              <div class="flex align-items-center gap-2">
                <InputText
                  v-model="item._rawScore"
                  placeholder="输入成绩"
                  class="w-10rem"
                  @update:model-value="markChanged"
                />
                <span class="text-color-secondary">{{ props.currentEvent?.unit || '' }}</span>
              </div>

              <div v-if="!item._isValid" class="flex flex-column gap-2 mt-2">
                <Select
                  v-model="item._invalidType"
                  :options="foulOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="选择犯规类型"
                  class="w-full"
                  @update:model-value="markChanged"
                />
                <InputText
                  v-model="item._invalidReason"
                  placeholder="犯规原因备注（可选）"
                  class="w-full"
                  @update:model-value="markChanged"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>
