<script setup>
import { ref, watch, onMounted } from "vue";
import { useToken } from "#/useToken";

const props = defineProps(["currentEvent"]);

const { getToken } = useToken();

const results = ref([]);
const loading = ref(false);

const fetchResults = async () => {
  if (!props.currentEvent) return;

  loading.value = true;
  try {
    const res = await fetch("/api/funVolunteer/reviewResults", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: getToken(),
        eventId: props.currentEvent.eventId,
        round: props.currentEvent.round || 1,
      }),
    });
    const data = await res.json();
    if (data.statusCode === 200) {
      results.value = data.data || [];
    } else {
      results.value = [];
    }
  } catch (e) {
    console.error("Fetch review results error:", e);
    results.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => props.currentEvent, fetchResults);

// 暴露空 submit，避免父组件调用时报错
defineExpose({ submit: () => {} });

onMounted(() => {
  if (props.currentEvent) fetchResults();
});
</script>

<template>
  <div class="p-4">
    <Card>
      <template #title>成绩复核（审核视角）</template>
      <template #content>
        <div v-if="loading" class="text-center p-4">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        </div>
        <div v-else-if="results.length === 0" class="text-center p-4">
          暂无成绩数据
        </div>
        <DataTable
          v-else
          :value="results"
          responsiveLayout="scroll"
          class="p-datatable-sm"
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
              <span v-if="slotProps.data.isValid === false" class="text-red-500 font-bold">
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
              <Tag
                v-if="slotProps.data.tempRanking === 1"
                value="1"
                severity="warn"
              />
              <Tag
                v-else-if="slotProps.data.tempRanking === 2"
                value="2"
                severity="info"
              />
              <Tag
                v-else-if="slotProps.data.tempRanking === 3"
                value="3"
                severity="success"
              />
              <span v-else>{{ slotProps.data.tempRanking || "--" }}</span>
            </template>
          </Column>
          <Column field="tempPoints" header="临时积分" style="width: 6rem">
            <template #body="slotProps">
              <span class="font-bold">{{ slotProps.data.tempPoints || "--" }}</span>
            </template>
          </Column>
          <Column field="isValid" header="状态" style="width: 5rem">
            <template #body="slotProps">
              <Tag
                v-if="slotProps.data.isValid !== false"
                value="有效"
                severity="success"
              />
              <Tag v-else value="无效" severity="danger" />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>
