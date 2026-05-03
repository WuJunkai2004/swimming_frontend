<script setup>
import { ref, watch } from "vue";
import { useToken } from "#/useToken";
import { useAlert } from "#/useAlert";
import { useRouter } from "vue-router";
import { saveData } from "#/useStorage";

const props = defineProps({
  username: String,
  isLoginning: Boolean,
});

const emit = defineEmits(["update:username", "update:isLoginning"]);

const { setToken } = useToken();
const { alerts } = useAlert();
const router = useRouter();

// 志愿者登录所需数据
const volsNumber = ref(""); // 学号
const volsPosition = ref("STARTER");
const volsPositionMap = {
  EXECUTIVE_PRESIDENT: "执行总裁",
  STARTER: "发令员",
  TIMER: "计时员",
  TECHNICAL_INSPECTION_OF_SWIMMING_IN: "游进技术检查",
  REINTAKE_INSPECTION: "转身检查",
  REBORN_INSPECTOR: "转身检查长",
  OTHER: "其他",
};
const volsPositionOptions = Object.entries(volsPositionMap).map(
  ([value, label]) => ({ value, label }),
);
const volsTakeRoad = ref(0); // 所负责的泳道数组
const availableCompetitions = ref([]);
const selectedCompetitionId = ref("");
const isQueryingCompetitions = ref(false);

let debounceTimeout = null;

const queryCompetitions = async () => {
  if (!volsNumber.value) {
    return;
  }

  isQueryingCompetitions.value = true;
  fetch(`/api/competition/queryCompetition?studentNumber=${volsNumber.value}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.statusCode === 200) {
        availableCompetitions.value = data.data || [];
        // 如果只有一个比赛，默认选中
        if (availableCompetitions.value.length === 1) {
          selectedCompetitionId.value = availableCompetitions.value[0].id;
        } else {
          selectedCompetitionId.value = "";
        }
      } else {
        availableCompetitions.value = [];
        alerts("提示", data.message || "未查询到相关比赛信息");
      }
    })
    .catch((error) => {
      console.error("Query competitions error:", error);
      alerts("警告", "查询比赛信息失败");
      availableCompetitions.value = [];
    })
    .finally(() => {
      isQueryingCompetitions.value = false;
    });
};

watch(volsNumber, (newValue) => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
  if (newValue && newValue.length >= 9) {
    debounceTimeout = setTimeout(queryCompetitions, 750);
  } else {
    availableCompetitions.value = [];
    selectedCompetitionId.value = "";
  }
});

const volsLogin = async () => {
  emit("update:isLoginning", true);

  const getRoadArray = () => {
    if (["START", "OTHER"].includes(volsPosition.value)) {
      return [];
    }
    if (["TIMER", "REINTAKE_INSPECTION"].includes(volsPosition.value)) {
      return [volsTakeRoad.value];
    }
    return Array.from({ length: 8 }, (_, i) => i + 1);
  };

  // 构造请求数据
  const payload = {
    name: props.username,
    position: volsPosition.value,
    studentNumber: volsNumber.value,
    road: getRoadArray(),
    gameId: selectedCompetitionId.value,
  };

  fetch("/api/volunteer/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.statusCode === 200) {
        alerts("提示", "登录成功，正在跳转");
        setToken(data.data.token);
        saveData("gameId", selectedCompetitionId.value);
        saveData("position", volsPositionMap[volsPosition.value] || "未知职务");
        if (data.data.road.length) {
          saveData("road", data.data.road[0]);
        }
        saveData("foulEnum", data.data.foulEnum);
        saveData("permission", data.data.permission);
        router.push("/volunteer");
      } else {
        alerts("警告", "登录失败: " + data.message);
      }
    })
    .catch((e) => {
      console.error("Error:", e);
      alerts("警告", "登录请求失败，请稍后重试");
    })
    .finally(() => {
      emit("update:isLoginning", false);
    });
};

const handleLogin = async () => {
  if (!props.username) {
    alerts("警告", "请输入用户名");
    return;
  }
  if (!volsNumber.value) {
    alerts("警告", "请输入学号");
    return;
  }
  if (
    volsNumber.value.length < 9 ||
    volsNumber.value.replace(/\d/g, "").length > 0
  ) {
    alerts("警告", "请输入正确的学号");
    return;
  }
  if (!selectedCompetitionId.value) {
    alerts("警告", "请选择一个比赛");
    return;
  }
  if (!volsPosition.value) {
    alerts("警告", "请选择职务");
    return;
  }
  if (
    (volsPosition.value === "REINTAKE_INSPECTION" ||
      volsPosition.value === "TIMER") &&
    !volsTakeRoad.value
  ) {
    alerts("警告", "请选择负责泳道");
    return;
  }
  await volsLogin();
};
</script>

<template>
  <div class="flex flex-column gap-4">
    <div class="p-float-label">
      <label>用户名</label>
      <InputText
        id="username"
        :model-value="username"
        @update:model-value="emit('update:username', $event)"
        class="w-full"
        :disabled="isLoginning"
      />
    </div>

    <div class="p-float-label">
      <label>学号</label>
      <InputText
        id="volsNumber"
        v-model="volsNumber"
        class="w-full"
        :disabled="isLoginning"
        :invalid="volsNumber.replace(/\d/g, '').length > 0"
        maxlength="15"
      />
    </div>

    <div class="p-float-label">
      <label>选择比赛</label>
      <Select
        v-model="selectedCompetitionId"
        :options="availableCompetitions"
        option-label="competitionName"
        option-value="id"
        class="w-full"
        :disabled="
          isLoginning ||
          (availableCompetitions.length === 0 && !isQueryingCompetitions)
        "
        :loading="isQueryingCompetitions"
        placeholder="请选择比赛"
      >
        <template #empty>
          <div class="p-2">
            <span
              v-if="volsNumber.length >= 9 && !isQueryingCompetitions"
              class="text-red-500"
              >未查询到可参与的比赛</span
            >
            <span v-else-if="isQueryingCompetitions">正在查询比赛信息...</span>
            <span v-else>请输入学号以获取比赛列表</span>
          </div>
        </template>
      </Select>
    </div>

    <div class="p-float-label">
      <label>职务</label>
      <Select
        v-model="volsPosition"
        :options="volsPositionOptions"
        option-label="label"
        option-value="value"
        class="w-full"
        :disabled="isLoginning"
      />
    </div>

    <div
      v-if="volsPosition === 'REINTAKE_INSPECTION' || volsPosition === 'TIMER'"
      class="p-float-label"
    >
      <label>负责泳道</label>
      <Select
        v-model="volsTakeRoad"
        :options="
          Array.from({ length: 8 }, (_, i) => ({
            label: `泳道 ${i + 1}`,
            value: i + 1,
          }))
        "
        class="w-full"
        option-label="label"
        option-value="value"
        :disabled="isLoginning"
        placeholder="请选择负责的泳道"
      />
    </div>

    <Button
      label="登录"
      icon="pi pi-sign-in"
      class="w-full mt-3"
      :loading="isLoginning"
      @click="handleLogin"
    />
  </div>
</template>
