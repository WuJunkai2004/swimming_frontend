<script setup>
import { ref, watch, onMounted } from "vue";
import { useToken } from "#/useToken";
import { useAlert } from "#/useAlert";
import { getData } from "#/useStorage";

const props = defineProps(["currentEvent"]);

const { getToken } = useToken();
const { alerts } = useAlert();

const athleteList = ref([]);
const scores = ref({}); // { athleteId: score }
const loading = ref(false);

const fetchAthleteList = async () => {
  if (!props.currentEvent) return;

  loading.value = true;
  try {
    const res = await fetch(
      `/api/funVolunteer/getAthleteList?eventId=${props.currentEvent.id}`,
    );
    const data = await res.json();
    if (data.statusCode === 200) {
      athleteList.value = data.data || [];
      // 初始化成绩表
      data.data.forEach((athlete) => {
        if (!scores.value[athlete.id]) {
          scores.value[athlete.id] = "";
        }
      });
    }
  } catch (e) {
    console.error("Fetch athlete list error:", e);
  } finally {
    loading.value = false;
  }
};

watch(() => props.currentEvent, fetchAthleteList);

const submitData = async () => {
  if (!props.currentEvent) {
    alerts("警告", "请先选择比赛项目");
    return;
  }

  const payload = {
    token: getToken(),
    eventId: props.currentEvent.id,
    results: Object.entries(scores.value).map(([id, score]) => ({
      athleteId: id,
      score: parseFloat(score) || 0,
    })),
  };

  try {
    const res = await fetch("/api/funVolunteer/uploadResult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.statusCode === 200) {
      alerts("提示", "成绩录入成功");
    } else {
      alerts("错误", data.message);
    }
  } catch (e) {
    alerts("错误", "提交失败");
  }
};

defineExpose({ submit: submitData });

onMounted(() => {
  if (props.currentEvent) fetchAthleteList();
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
        <div v-else-if="athleteList.length === 0" class="text-center p-4">
          请选择项目或该项目暂无选手
        </div>
        <div v-else class="flex flex-column gap-3">
          <div
            v-for="athlete in athleteList"
            :key="athlete.id"
            class="flex align-items-center justify-content-between p-2 border-bottom-1 surface-border"
          >
            <div class="flex flex-column">
              <span class="font-bold">{{ athlete.name }}</span>
              <span class="text-sm text-color-secondary">{{
                athlete.studentNumber
              }}</span>
            </div>
            <div class="flex align-items-center gap-2">
              <InputNumber
                v-model="scores[athlete.id]"
                :minFractionDigits="2"
                placeholder="输入成绩"
                class="w-8rem"
              />
              <span>秒</span>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>
