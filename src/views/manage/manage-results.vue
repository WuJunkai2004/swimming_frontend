<script setup>
import { ref, computed, onMounted } from "vue";
import { useToken } from "#/useToken";
import { useAlert } from "#/useAlert";
import { useCollegeEnum } from "#/collegeMapping";
import { useEventEnum } from "#/eventMapping";
import { useFoulEnum } from "#/foulMapping";
import ResultBoard from "@/components/ResultBoard.vue";
import { sportApi, adminApi, competitionApi } from "@/api/serve.js";

// --- 1. 初始化 ---
const { getToken } = useToken();
const { alerts } = useAlert();
const { collegeMap } = useCollegeEnum();
const { eventMap } = useEventEnum();
const foulState = useFoulEnum();

// 场次枚举 -> 中文（后端未提供查询接口，与 manage-schedule.vue 文案一致）
const timeMap = { MORNING: "上午", AFTERNOON: "下午", EVENING: "晚上" };

// --- 2. 状态定义 ---
const gameId = ref("");
const gameName = ref("");

// 比赛日程：[{ date, time, total: [{ marked, program, totalGroup }] }]
const schedule = ref([]);
// 级联选择：场次 -> 项目（第X项） -> 组别（甲组A/乙组B）
const selectedSessionIdx = ref(null);
const selectedItem = ref(null); // { marked, program, totalGroup }
const selectedGroup = ref("A");

// 组别枚举（后端 /register/getGroupDetail 未上线，与 manage-schedule.vue 保持一致）
const groupOptions = [
  { label: "甲组", value: "A" },
  { label: "乙组", value: "B" },
];

// 成绩数据
const results = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
const error = ref(null);

// 学院 / 犯规类型下拉选项（显示中文名，值为枚举码）
const collegeOptions = computed(() =>
  Object.entries(collegeMap).map(([value, label]) => ({ label, value })),
);
const foulOptions = computed(() =>
  Object.entries(foulState.foulMap)
    .filter(([value]) => value !== "NO_FOUL")
    .map(([value, label]) => ({ label, value })),
);

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

// 项目选项：第X项 + 项目名称 + 共Y组
const itemOptions = computed(() =>
  (selectedSession.value?.total || []).map((t) => ({
    label: `第${t.marked}项 · ${eventMap[t.program] || t.program}（共${t.totalGroup}组）`,
    value: t,
  })),
);

// 展示给成绩板的标题，如 “男子50米仰泳 · 下午 · 甲组”
const boardTitle = computed(() => {
  if (!selectedItem.value) return "";
  const parts = [eventMap[selectedItem.value.program] || selectedItem.value.program];
  if (selectedSession.value) {
    parts.push(timeMap[selectedSession.value.time] || selectedSession.value.time);
  }
  parts.push(groupOptions.find((g) => g.value === selectedGroup.value)?.label || selectedGroup.value);
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

// 获取比赛日程并初始化级联选择
const fetchSchedule = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const res = await competitionApi.getGameSchedule({ id: gameId.value });
    const result = await res.json();
    if (result.statusCode === 200) {
      schedule.value = Array.isArray(result.data) ? result.data : [];
      if (schedule.value.length > 0) {
        onSessionChange(0);
      }
    } else {
      error.value = result.message || "加载比赛日程失败";
    }
  } catch (e) {
    error.value = "网络错误，加载比赛日程失败";
  } finally {
    isLoading.value = false;
  }
};

const onSessionChange = (idx) => {
  selectedSessionIdx.value = idx;
  const items = schedule.value[idx]?.total || [];
  onItemChange(items.length > 0 ? items[0] : null);
};

const onItemChange = (item) => {
  selectedItem.value = item;
  fetchResults();
};

// 查询成绩：marked 为日程中的项次（1 起），group 为组别（A=甲组 / B=乙组）
const fetchResults = async () => {
  if (!selectedSession.value || !selectedItem.value) {
    results.value = [];
    return;
  }
  isLoading.value = true;
  error.value = null;
  try {
    const res = await competitionApi.result({
      competitionId: gameId.value,
      time: selectedSession.value.time,
      program: selectedItem.value.program,
      marked: selectedItem.value.marked,
      group: selectedGroup.value,
    });
    const result = await res.json();
    if (result.statusCode === 200) {
      results.value = (result.data || []).map((item, index) => ({
        key: `${item.id ?? item.name}-${item.studentNumber || index}`,
        // 成绩记录主键 id，9.14 修改成绩时用于定位
        id: item.id ?? null,
        name: item.name || "",
        studentNumber: item.studentNumber || "",
        college: item.college || "",
        score: Number(item.achievements ?? item.achievement ?? 0),
        foulOrNot: !!item.foulOrNot,
        foulReason: item.foulReason || item.foulReson || "",
        foulDescription: item.foulDescription || "",
        road: Number(item.road || 0),
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

// 新增：直录接口（9.13），统一上传枚举码
const createResult = (data) => {
  return adminApi
    .uploadResultDirect({
      token: getToken(),
      gameId: gameId.value,
      event: selectedItem.value.program,
      time: selectedSession.value.time,
      marked: selectedItem.value.marked,
      group: selectedGroup.value,
      syncAthlete: true,
      data: [data],
    })
    .then((res) => res.json())
    .then((result) => {
      if (result.statusCode !== 200) {
        throw new Error(result.message || "保存失败");
      }
      const summary = result.data;
      if (summary && summary.failed > 0) {
        const reasons = (summary.errors || [])
          .map((e) => `${e.name}: ${e.reason}`)
          .join("；");
        throw new Error(reasons || "保存失败");
      }
    });
};

// 修改：管理员修改成绩记录接口（9.14），按成绩记录主键 id 定位
const updateResult = (original, data) => {
  if (original.id === null || original.id === undefined) {
    return Promise.reject(new Error("该记录缺少 id，无法修改，请刷新后重试"));
  }
  const payload = {
    token: getToken(),
    id: original.id,
    competitionId: gameId.value,
    time: selectedSession.value.time,
    program: selectedItem.value.program,
    group: selectedGroup.value,
    name: original.name,
    foulOrNot: data.foulOrNot,
  };
  if (!data.foulOrNot) {
    payload.achievement = data.achievement;
  }
  if (data.name && data.name !== original.name) {
    payload.newName = data.name;
  }
  if (data.studentNumber) {
    payload.studentNumber = data.studentNumber;
  }
  if (data.college) {
    payload.college = data.college;
  }
  return adminApi
    .updateAchievement(payload)
    .then((res) => res.json())
    .then((result) => {
      if (result.statusCode !== 200) {
        throw new Error(result.message || "保存失败");
      }
      // 犯规类型/犯规描述不在 9.14 可修改字段内，走直录接口重建犯规明细
      if (data.foulOrNot && data.foulReason) {
        return adminApi
          .uploadResultDirect({
            token: getToken(),
            gameId: gameId.value,
            event: selectedItem.value.program,
            time: selectedSession.value.time,
            marked: selectedItem.value.marked,
            group: selectedGroup.value,
            syncAthlete: false,
            data: [data],
          })
          .then((res) => res.json())
          .then((r) => {
            if (r.statusCode !== 200 || (r.data && r.data.failed > 0)) {
              alerts(
                "警告",
                "成绩已更新，但犯规明细写入失败，请检查学院/学号信息后重试",
              );
            }
          });
      }
    });
};

const onSaveResult = ({ original, data }) => {
  isSaving.value = true;
  const request = original ? updateResult(original, data) : createResult(data);
  request
    .then(() => {
      alerts("成功", `已保存 ${data.name} 的成绩`);
      fetchResults();
    })
    .catch((e) => {
      console.error(e);
      alerts("错误", e.message || "网络异常，请稍后重试");
    })
    .finally(() => {
      isSaving.value = false;
    });
};

// --- 4. 生命周期 ---
onMounted(() => {
  const hash = window.location.hash;
  const queryString = hash.includes("?") ? hash.split("?")[1] : "";
  const urlParams = new URLSearchParams(queryString);
  gameId.value = urlParams.get("game") || "";
  gameName.value = urlParams.get("name") || "";

  if (!gameId.value) {
    alerts("错误", "缺少比赛ID参数");
    return;
  }
  fetchGameInfo();
  fetchSchedule();
});
</script>

<template>
  <div class="p-4 surface-card shadow-2 border-round">
    <div
      class="flex justify-content-between align-items-center mb-4 flex-wrap gap-2"
    >
      <h1 class="text-3xl font-bold m-0">成绩管理</h1>
      <span v-if="gameName" class="text-color-secondary">{{ gameName }}</span>
    </div>

    <Divider />

    <Message v-if="error" severity="error" :closable="false" class="mb-3">
      {{ error }}
    </Message>

    <Message
      v-else-if="!isLoading && schedule.length === 0"
      severity="info"
      :closable="false"
      class="mb-3"
    >
      该比赛暂无日程安排，请先在“安排”页面编排项目后再管理成绩。
    </Message>

    <!-- 筛选条件：场次 -> 项目（第X项） -> 组别（甲组/乙组） -->
    <div v-else class="p-fluid formgrid grid mb-3">
      <div class="field col-12 md:col-4">
        <label for="session">场次</label>
        <Select
          id="session"
          :modelValue="selectedSessionIdx"
          :options="sessionOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="请选择场次"
          @change="onSessionChange($event.value)"
        />
      </div>
      <div class="field col-12 md:col-4">
        <label for="item">项目</label>
        <Select
          id="item"
          :modelValue="selectedItem"
          :options="itemOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="请选择项目"
          @change="onItemChange($event.value)"
        />
      </div>
      <div class="field col-6 md:col-4">
        <label for="group">组别</label>
        <Select
          id="group"
          v-model="selectedGroup"
          :options="groupOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="请选择组别"
          @change="fetchResults"
        />
      </div>
    </div>

    <!-- 成绩展示板（可复用组件） -->
    <ResultBoard
      v-if="schedule.length > 0"
      :items="results"
      :loading="isLoading || isSaving"
      :editable="true"
      :title="boardTitle"
      :collegeOptions="collegeOptions"
      :foulOptions="foulOptions"
      :collegeMap="collegeMap"
      :foulMap="foulState.foulMap"
      @save="onSaveResult"
    />
  </div>
</template>

<style scoped>
:deep(.rb-list-head),
:deep(.rb-row) {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}
</style>
