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
  fetch(`/api/funVolunteer/getReviewedResults`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: getToken(),
      eventId: props.currentEvent.eventId,
      round: props.currentEvent.round || 1,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.statusCode === 200) {
        results.value = data.data || [];
      } else {
        result.value = [];
      }
    })
    .catch((e) => {
      console.error("Fetch reviewed results error:", e);
      result.value = [];
    })
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
      round: props.currentEvent.round || 1,
    }),
  })
    .then((res) => res.json())
    .then(async (data) => {
      if (data.statusCode === 200) {
        alerts("提示", "成绩已最终确认");
        await fetchResult();
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
        <div v-else>
          <DataTable
            :value="results"
            responsiveLayout="scroll"
            class="p-datatable-sm mb-4"
            stripedRows
          >
            <Column field="road" header="道次" style="width: 5rem">
              <template #body="slotProps">
                <Tag :value="slotProps.data.road" severity="primary" />
              </template>
            </Column>
            <Column field="college" header="学院"></Column>
            <Column header="成绩">
              <template #body="slotProps">
                <span
                  v-if="slotProps.data.isValid === false"
                  class="text-red-500 font-bold"
                >
                  {{ slotProps.data.invalidReason || "无效" }}
                </span>
                <span v-else-if="slotProps.data.rawScore">
                  {{ slotProps.data.rawScore }}
                </span>
                <span v-else class="text-400">--</span>
              </template>
            </Column>
            <Column field="tempRanking" header="临时排名" style="width: 6rem">
              <template #body="slotProps">
                <span class="font-bold">{{
                  slotProps.data.tempRanking || "--"
                }}</span>
              </template>
            </Column>
            <Column field="tempPoints" header="临时积分" style="width: 6rem">
              <template #body="slotProps">
                <span class="font-bold">{{
                  slotProps.data.tempPoints || "--"
                }}</span>
              </template>
            </Column>
          </DataTable>

          <Message severity="warn" :closable="false" class="mb-3">
            确认后成绩将被锁定，志愿者无法再次修改，仅管理员可解锁修改。
          </Message>
        </div>
      </template>
    </Card>
  </div>
</template>
