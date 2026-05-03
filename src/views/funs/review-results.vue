<script setup>
import { ref, watch, onMounted } from "vue";
import { useToken } from "#/useToken";
import { useAlert } from "#/useAlert";

const props = defineProps(["currentEvent"]);

const { getToken } = useToken();
const { alerts } = useAlert();

const results = ref([]);
const loading = ref(false);

const fetchResults = async () => {
  if (!props.currentEvent) return;

  loading.value = true;
  try {
    const res = await fetch(
      `/api/funVolunteer/getPendingResults?eventId=${props.currentEvent.id}`,
    );
    const data = await res.json();
    if (data.statusCode === 200) {
      results.value = data.data || [];
    }
  } catch (e) {
    console.error("Fetch pending results error:", e);
  } finally {
    loading.value = false;
  }
};

watch(() => props.currentEvent, fetchResults);

const submitData = async () => {
  if (!props.currentEvent) {
    alerts("警告", "请先选择比赛项目");
    return;
  }

  try {
    const res = await fetch("/api/funVolunteer/reviewResults", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: getToken(),
        eventId: props.currentEvent.id,
        status: "REVIEWED",
      }),
    });
    const data = await res.json();
    if (data.statusCode === 200) {
      alerts("提示", "成绩复核完成");
    } else {
      alerts("错误", data.message);
    }
  } catch (e) {
    alerts("错误", "提交失败");
  }
};

defineExpose({ submit: submitData });

onMounted(() => {
  if (props.currentEvent) fetchResults();
});
</script>

<template>
  <div class="p-4">
    <Card>
      <template #title>成绩复核</template>
      <template #content>
        <div v-if="loading" class="text-center p-4">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        </div>
        <div v-else-if="results.length === 0" class="text-center p-4">
          暂无待复核成绩
        </div>
        <DataTable
          v-else
          :value="results"
          responsiveLayout="scroll"
          class="p-datatable-sm"
        >
          <Column field="athleteName" header="姓名"></Column>
          <Column field="score" header="成绩 (秒)"></Column>
          <Column field="recorder" header="记录员"></Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>
