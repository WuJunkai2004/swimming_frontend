<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCollegeEnum } from "#/collegeMapping";
import { useEventEnum } from "#/eventMapping";
import { useFoulEnum } from "#/foulMapping";
import ResultGroupBoard from "@/components/ResultGroupBoard.vue";
import { sportApi, competitionApi } from "@/api/serve.js";

// --- 1. 初始化 ---
const route = useRoute();
const router = useRouter();
const { collegeMap } = useCollegeEnum();
const { eventMap } = useEventEnum();
const foulState = useFoulEnum();

// 场次枚举 -> 中文（后端未提供查询接口，与 manage-schedule.vue 文案一致）
const timeMap = { MORNING: "上午", AFTERNOON: "下午", EVENING: "晚上" };
// 组别枚举 -> 中文
const groupMap = { A: "甲组", B: "乙组" };

// --- 2. 状态定义 ---
const gameId = ref("");
const gameName = ref("");

// 查询参数（由赛程列表页跳转携带）
const query = ref({
  date: "",
  time: "",
  program: "",
  marked: null,
  totalGroup: null,
  group: "A",
});

// 成绩数据（一大组的全量数据，可能包含多个小组）
const results = ref([]);
const isLoading = ref(false);
const error = ref(null);

// 大标题：如 “男子50米仰泳 · 甲组”
const pageTitle = computed(() => {
  if (!query.value.program) return "比赛成绩";
  const parts = [
    eventMap[query.value.program] || query.value.program,
    groupMap[query.value.group] || query.value.group,
  ];
  return parts.join(" · ");
});

// 副标题：如 “2026-10-17 · 下午 · 第1项”
const pageSubtitle = computed(() => {
  const parts = [];
  if (query.value.date) parts.push(query.value.date);
  if (query.value.time) parts.push(timeMap[query.value.time] || query.value.time);
  if (query.value.marked) parts.push(`第${query.value.marked}项`);
  return parts.join(" · ");
});

// --- 3. API 调用与数据处理 ---

// 获取比赛名称
const fetchGameInfo = async () => {
  try {
    const res = await sportApi.getGameInfo({ game: gameId.value });
    const result = await res.json();
    if (result.statusCode === 200 && result.data) {
      gameName.value =
        result.data.competitionName || result.data.name || gameName.value;
    }
  } catch (e) {
    console.error("加载比赛信息失败:", e);
  }
};

// 查询一大组的全量成绩：marked 为项次（1 起），group 为组别（A=甲组 / B=乙组）
const fetchResults = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const res = await competitionApi.result({
      competitionId: gameId.value,
      time: query.value.time,
      program: query.value.program,
      marked: query.value.marked,
      group: query.value.group,
    });
    const result = await res.json();
    if (result.statusCode === 200) {
      results.value = (result.data || []).map((item, index) => ({
        key: `${item.id ?? item.name}-${item.studentNumber || index}`,
        id: item.id ?? null,
        name: item.name || "",
        studentNumber: item.studentNumber || "",
        college: item.college || "",
        score: Number(item.achievements ?? item.achievement ?? 0),
        foulOrNot: !!item.foulOrNot,
        foulReason: item.foulReason || item.foulReson || "",
        foulDescription: item.foulDescription || "",
        road: Number(item.road || 0),
        // 小组组次（athlete_group，直录/未编排记录为 0）
        heat:
          Number(
            item.athleteGroup ?? item.athlete_group ?? item.heat ?? item.group ?? 0,
          ) || null,
      }));
    } else {
      results.value = [];
      error.value = result.message || "查询成绩失败";
    }
  } catch (e) {
    console.error("查询成绩失败:", e);
    results.value = [];
    error.value = "网络错误，查询成绩失败";
  } finally {
    isLoading.value = false;
  }
};

// --- 4. 生命周期 ---
onMounted(() => {
  gameId.value = route.params.gameid || "";
  const q = route.query;
  query.value = {
    date: q.date || "",
    time: q.time || "",
    program: q.program || "",
    marked: q.marked ? Number(q.marked) : null,
    totalGroup: q.totalGroup ? Number(q.totalGroup) : null,
    group: q.group || "A",
  };

  if (
    !gameId.value ||
    !query.value.time ||
    !query.value.program ||
    !query.value.marked
  ) {
    error.value = "缺少必要的查询参数，请从赛程页面进入";
    return;
  }
  fetchGameInfo();
  fetchResults();
});
</script>

<template>
  <div style="overflow-x: hidden">
    <MobileMenuBar />
    <ComputerMenuBar />

    <div class="grid justify-content-center">
      <div class="col-12 md:col-10 lg:col-8 xl:col-6">
        <div class="p-3">
          <div class="mb-3">
            <Button
              label="返回赛程"
              icon="pi pi-chevron-left"
              class="p-button-text p-button-sm"
              @click="
                router.push({
                  name: 'Result',
                  params: { gameid: gameId },
                  query: {
                    session: route.query.session,
                    group: route.query.group,
                  },
                })
              "
            />
          </div>

          <div class="text-center mb-3">
            <p v-if="gameName" class="text-color-secondary text-sm m-0 mb-1">
              {{ gameName }}
            </p>
            <h1 class="text-2xl font-bold m-0">{{ pageTitle }}</h1>
            <p v-if="pageSubtitle" class="text-color-secondary mt-1 mb-0">
              {{ pageSubtitle }}
            </p>
          </div>

          <Message v-if="error" severity="error" :closable="false" class="mb-3">
            {{ error }}
          </Message>

          <!-- 一大组成绩展示板（领奖台 + 总排名/第N组 分组标签页） -->
          <ResultGroupBoard
            v-else
            :items="results"
            :loading="isLoading"
            :collegeMap="collegeMap"
            :foulMap="foulState.foulMap"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.rgb-list-head),
:deep(.rgb-row) {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}
</style>
