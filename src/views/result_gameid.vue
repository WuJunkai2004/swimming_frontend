<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEventEnum } from "#/eventMapping";
import { sportApi, competitionApi } from "@/api/serve.js";

// --- 1. 初始化 ---
const route = useRoute();
const router = useRouter();
const { eventMap } = useEventEnum();

// 场次枚举 -> 中文（后端未提供查询接口，与 manage-schedule.vue 文案一致）
const timeMap = { MORNING: "上午", AFTERNOON: "下午", EVENING: "晚上" };

// 组别枚举（后端 /register/getGroupDetail 未上线，与 manage-schedule.vue 保持一致）
const groupOptions = [
  { label: "甲组", value: "A" },
  { label: "乙组", value: "B" },
];

// --- 2. 状态定义 ---
const gameId = ref("");
const gameName = ref("");

// 比赛日程：[{ date, time, total: [{ marked, program, totalGroup }] }]
const schedule = ref([]);
const selectedSessionIdx = ref(null);
const selectedGroup = ref("A");

const isLoading = ref(false);
const error = ref(null);

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

// 获取比赛日程并初始化场次选择
const fetchSchedule = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const res = await competitionApi.getGameSchedule({ id: gameId.value });
    const result = await res.json();
    if (result.statusCode === 200) {
      schedule.value = Array.isArray(result.data) ? result.data : [];
      if (schedule.value.length > 0) {
        selectedSessionIdx.value = 0;
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

// 场次 / 项目 / 组别选定后，跳转到一大组成绩详情页
const goToDetail = (item) => {
  if (!selectedSession.value) return;
  router.push({
    name: "ResultDetail",
    params: { gameid: gameId.value },
    query: {
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
    return;
  }
  fetchGameInfo();
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
            <div class="p-fluid formgrid grid mb-3">
              <div class="field col-7 md:col-8">
                <label for="session">场次</label>
                <Select
                  id="session"
                  v-model="selectedSessionIdx"
                  :options="sessionOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="请选择场次"
                />
              </div>
              <div class="field col-5 md:col-4">
                <label for="group">组别</label>
                <Select
                  id="group"
                  v-model="selectedGroup"
                  :options="groupSelectOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="请选择组别"
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
