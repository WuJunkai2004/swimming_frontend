<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCollegeEnum } from "#/collegeMapping";
import { useEventEnum } from "#/eventMapping";
import { sportApi, competitionApi } from "@/api/serve.js";

// --- 1. 初始化 ---
const route = useRoute();
const router = useRouter();
const { collegeMap } = useCollegeEnum();
const { eventMap } = useEventEnum();

// 场次枚举 -> 中文（后端未提供查询接口，与 manage-schedule.vue 文案一致）
const timeMap = { MORNING: "上午", AFTERNOON: "下午", EVENING: "晚上" };

// 组别枚举（后端 /register/getGroupDetail 未上线，与 manage-schedule.vue 保持一致）
const groupOptions = [
  { label: "甲组", value: "A" },
  { label: "乙组", value: "B" },
];

const queryModeOptions = [
  { label: "学院团体积分", value: "college" },
  { label: "单项成绩", value: "event" },
];

const collegeGroupOptions = [
  { label: "总分", value: "" },
  { label: "甲组", value: "A" },
  { label: "乙组", value: "B" },
];

// --- 2. 状态定义 ---
const gameId = ref("");
const gameName = ref("");
const queryMode = ref("event");

const collegePoints = ref([]);
const selectedCollegeGroup = ref("B");
const isCollegePointsLoading = ref(false);
const collegePointsError = ref(null);

// 比赛日程：[{ date, time, total: [{ marked, program, totalGroup }] }]
const schedule = ref([]);
const selectedSessionIdx = ref(null);
const selectedGroup = ref("A");

const isLoading = ref(false);
const error = ref(null);

const rankedCollegePoints = computed(() => {
  let points = [...collegePoints.value];
  if (gameId.value === "33a77c9afc6a42708c46ad91ca1e9c88") {
    const combinedColleges = new Set([
      "SCHOOL_OF_CHEMICAL_ENGINEERING",
      "FUTURE_MEMBRANE_TECHNOLOGY_INSTITUTE",
    ]);
    const combined = points.filter((item) => combinedColleges.has(item.college));
    if (combined.length > 0) {
      points = points.filter((item) => !combinedColleges.has(item.college));
      points.push({
        collegeName: "化工学院、未来技术学院",
        totalPoints: combined.reduce(
          (total, item) => total + (Number(item.totalPoints) || 0),
          0,
        ),
      });
    }
  }
  return points
    .sort((a, b) => Number(b.totalPoints) - Number(a.totalPoints))
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      collegeName: item.collegeName || collegeMap[item.college] || item.college,
    }));
});

// 场次选项：日期 + 上午/下午/晚上
const sessionOptions = computed(() =>
  schedule.value.map((day, index) => ({
    label: `${day.date} · ${timeMap[day.time] || day.time}`,
    value: index,
  })),
);
const selectedSession = computed(() =>
  selectedSessionIdx.value === null
    ? null
    : schedule.value[selectedSessionIdx.value] || null,
);

// 当前场次实际存在的组别（依据日程回传的 competitionGroup，甲组优先）
const availableGroups = computed(() => {
  const set = new Set();
  (selectedSession.value?.total || []).forEach((t) => {
    if (t.competitionGroup) set.add(t.competitionGroup);
  });
  return groupOptions.filter((g) => set.has(g.value));
});

// 修正组别选择：当前选中的组别在该场次没有项目时，回退到甲组，其次乙组
const fixGroupSelection = () => {
  const available = availableGroups.value;
  if (available.length === 0) return; // 未回传 competitionGroup，保持手动选择
  if (!available.some((g) => g.value === selectedGroup.value)) {
    selectedGroup.value = available[0].value;
  }
};

// 当前场次 + 当前组别的项目卡片列表（competitionGroup 缺失时视为全组别可见）
const itemCards = computed(() =>
  (selectedSession.value?.total || [])
    .filter(
      (t) => !t.competitionGroup || t.competitionGroup === selectedGroup.value,
    )
    .map((t) => ({
      ...t,
      eventName: eventMap[t.program] || t.program,
      gender: genderOf(t.program),
      groupLabel:
        groupOptions.find((g) => g.value === (t.competitionGroup || selectedGroup.value))
          ?.label || "",
    })),
);

// 从项目枚举前缀推断性别标签：男子 / 女子 / 男女
const genderOf = (program) => {
  const name = eventMap[program] || "";
  if (name.startsWith("男子")) return { label: "男子", severity: "info" };
  if (name.startsWith("女子")) return { label: "女子", severity: "danger" };
  return { label: "男女", severity: "secondary" };
};

// 组别下拉选项：优先展示当前场次实际存在的组别
const groupSelectOptions = computed(() =>
  availableGroups.value.length > 0 ? availableGroups.value : groupOptions,
);

// --- 3. API 调用与数据处理 ---

// 场次变化时修正组别选择（没有甲组则默认乙组）
watch(selectedSessionIdx, () => {
  fixGroupSelection();
});

// 把当前场次/组别选择同步到路由 query，从详情页返回时可恢复
watch([selectedSessionIdx, selectedGroup], ([idx, group]) => {
  if (idx === null) return;
  router.replace({
    query: { ...route.query, session: idx, group },
  });
});

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

const fetchCollegePoints = async () => {
  isCollegePointsLoading.value = true;
  collegePointsError.value = null;
  try {
    const res = await competitionApi.getTotalCollegePoints({
      competitionId: gameId.value,
      competitionGroup: selectedCollegeGroup.value,
    });
    const result = await res.json();
    if (result.statusCode === 200) {
      collegePoints.value = Array.isArray(result.data) ? result.data : [];
    } else {
      collegePoints.value = [];
      collegePointsError.value = result.message || "查询学院团体积分失败";
    }
  } catch (e) {
    console.error("查询学院团体积分失败:", e);
    collegePoints.value = [];
    collegePointsError.value = "网络错误，查询学院团体积分失败";
  } finally {
    isCollegePointsLoading.value = false;
  }
};

// 获取比赛日程并初始化场次选择（优先恢复路由 query 中保存的选择）
const fetchSchedule = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const res = await competitionApi.getGameSchedule({ id: gameId.value });
    const result = await res.json();
    if (result.statusCode === 200) {
      schedule.value = Array.isArray(result.data) ? result.data : [];
      if (schedule.value.length > 0) {
        const fromQuery = Number.parseInt(route.query.session, 10);
        selectedSessionIdx.value =
          Number.isInteger(fromQuery) &&
          fromQuery >= 0 &&
          fromQuery < schedule.value.length
            ? fromQuery
            : 0;
        const groupFromQuery = String(route.query.group || "");
        if (groupOptions.some((g) => g.value === groupFromQuery)) {
          selectedGroup.value = groupFromQuery;
        }
        fixGroupSelection();
      }
    } else {
      error.value = result.message || "加载比赛日程失败";
    }
  } catch (e) {
    console.error("加载比赛日程失败:", e);
    error.value = "网络错误，加载比赛日程失败";
  } finally {
    isLoading.value = false;
  }
};

// 场次 / 项目 / 组别选定后，跳转到一大组成绩详情页（携带场次便于返回时恢复）
const goToDetail = (item) => {
  if (!selectedSession.value) return;
  router.push({
    name: "ResultDetail",
    params: { gameid: gameId.value },
    query: {
      session: selectedSessionIdx.value,
      date: selectedSession.value.date,
      time: selectedSession.value.time,
      program: item.program,
      marked: item.marked,
      totalGroup: item.totalGroup,
      group: item.competitionGroup || selectedGroup.value,
    },
  });
};

// --- 4. 生命周期 ---
onMounted(() => {
  gameId.value = route.params.gameid || "";
  if (!gameId.value) {
    error.value = "缺少比赛ID参数";
    collegePointsError.value = "缺少比赛ID参数";
    return;
  }
  fetchGameInfo();
  fetchCollegePoints();
  fetchSchedule();
});
</script>

<template>
  <div style="overflow-x: hidden">
    <MobileMenuBar />
    <ComputerMenuBar />

    <div class="grid justify-content-center">
      <div class="col-12 md:col-8 lg:col-6 xl:col-5">
        <div class="p-3">
          <div class="text-center mb-3">
            <h1 class="text-3xl font-bold m-0">赛程成绩</h1>
            <p v-if="gameName" class="text-color-secondary mt-2 mb-0">
              {{ gameName }}
            </p>
          </div>

          <div class="flex justify-content-center mb-4">
            <SelectButton
              v-model="queryMode"
              :options="queryModeOptions"
              optionLabel="label"
              optionValue="value"
              :allowEmpty="false"
              aria-label="成绩查询类型"
            />
          </div>

          <template v-if="queryMode === 'college'">
            <div class="field mb-3">
              <label for="college-group" class="block mb-2">组别</label>
              <Select
                id="college-group"
                v-model="selectedCollegeGroup"
                :options="collegeGroupOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="请选择组别"
                fluid
                @change="fetchCollegePoints"
              />
            </div>

            <Message
              v-if="collegePointsError"
              severity="error"
              :closable="false"
              class="mb-3"
            >
              {{ collegePointsError }}
            </Message>

            <div v-else-if="isCollegePointsLoading" class="text-center p-5">
              <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="6" />
              <p class="text-color-secondary">正在加载学院团体积分...</p>
            </div>

            <Message
              v-else-if="rankedCollegePoints.length === 0"
              severity="info"
              :closable="false"
              class="mb-3"
            >
              暂无学院团体积分数据。
            </Message>

            <DataTable
              v-else
              :value="rankedCollegePoints"
              responsiveLayout="scroll"
              stripedRows
            >
              <Column field="rank" header="排名" style="width: 5rem"></Column>
              <Column field="collegeName" header="学院"></Column>
              <Column field="totalPoints" header="团体积分" style="width: 7rem"></Column>
            </DataTable>
          </template>

          <template v-else>
            <Message v-if="error" severity="error" :closable="false" class="mb-3">
              {{ error }}
            </Message>

            <div v-else-if="isLoading" class="text-center p-5">
              <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="6" />
              <p class="text-color-secondary">正在加载赛程...</p>
            </div>

            <Message
              v-else-if="schedule.length === 0"
              severity="info"
              :closable="false"
              class="mb-3"
            >
              该比赛暂无日程安排，成绩尚未发布。
            </Message>

            <template v-else>
              <!-- 筛选条件：场次 + 组别 -->
              <div class="grid mb-3">
                <div class="col-7 md:col-8 flex flex-column gap-1">
                  <label for="session">场次</label>
                  <Select
                    id="session"
                    v-model="selectedSessionIdx"
                    :options="sessionOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="请选择场次"
                    fluid
                  />
                </div>
                <div class="col-5 md:col-4 flex flex-column gap-1">
                  <label for="group">组别</label>
                  <Select
                    id="group"
                    v-model="selectedGroup"
                    :options="groupSelectOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="请选择组别"
                    fluid
                  />
                </div>
              </div>

              <!-- 项目卡片列表（点击跳转一大组成绩详情） -->
              <div class="flex flex-column gap-2">
                <div
                  v-for="item in itemCards"
                  :key="`${item.marked}-${item.program}`"
                  class="schedule-card surface-card border-round shadow-1 p-3 flex align-items-center gap-3"
                  role="button"
                  tabindex="0"
                  @click="goToDetail(item)"
                  @keydown.enter="goToDetail(item)"
                >
                  <Tag
                    :value="item.gender.label"
                    :severity="item.gender.severity"
                    class="schedule-gender"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="schedule-title">
                      第{{ item.marked }}项 · {{ item.groupLabel }}
                      {{ item.eventName }}
                    </div>
                    <div class="schedule-sub">共 {{ item.totalGroup }} 组</div>
                  </div>
                  <i class="pi pi-chevron-right text-color-secondary"></i>
                </div>

                <div
                  v-if="itemCards.length === 0"
                  class="text-center p-5 text-color-secondary"
                >
                  <i class="pi pi-inbox" style="font-size: 2rem"></i>
                  <p>该场次当前组别暂无项目安排</p>
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-card {
  cursor: pointer;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}

.schedule-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.schedule-gender {
  flex-shrink: 0;
  writing-mode: horizontal-tb;
}

.schedule-title {
  font-weight: 600;
  color: var(--p-text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.schedule-sub {
  margin-top: 0.2rem;
  font-size: 0.8rem;
  color: var(--p-text-secondary-color);
}
</style>
