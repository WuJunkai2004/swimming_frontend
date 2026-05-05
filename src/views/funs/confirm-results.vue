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
  if (!props.currentEvent) {
    return;
  }

  loading.value = true;
  fetch(`/api/funVolunteer/getReviewedResults?eventId=${props.currentEvent.id}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.statusCode === 200) {
        results.value = data.data || [];
      }
    })
    .catch((e) => console.error("Fetch reviewed results error:", e))
    .finally(() => (loading.value = false));
};

watch(() => props.currentEvent, fetchResults);

const submitData = async () => {
  if (!props.currentEvent) {
    alerts("警告", "请先选择比赛项目");
    return;
  }

  fetch("/api/funVolunteer/confirmResults", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: getToken(),
      eventId: props.currentEvent.id,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.statusCode === 200) {
        alerts("提示", "成绩已最终确认");
      } else {
        alerts("错误", data.message);
      }
    })
    .catch((e) => {
      alerts("错误", "提交失败");
    });
};

defineExpose({ submit: submitData });

onMounted(() => {
  if (props.currentEvent) fetchResults();
});
</script>

<template>
  <div class="p-4">
    <Card>
      <template #title>成绩确认</template>
      <template #content>
        <div v-if="loading" class="text-center p-4">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        </div>
        <div v-else-if="results.length === 0" class="text-center p-4">
          暂无待确认成绩
        </div>
        <DataTable
          v-else
          :value="results"
          responsiveLayout="scroll"
          class="p-datatable-sm"
        >
          <Column field="athleteName" header="姓名"></Column>
          <Column field="score" header="成绩 (秒)"></Column>
          <Column field="reviewer" header="复核员"></Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>
