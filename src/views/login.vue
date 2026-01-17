<script setup>
import { ref, computed, watch } from "vue";
import { useToken } from "@/composables/useToken";
import { useAlert } from "@/composables/useAlert";
import { SHA256 } from "@/composables/useHash";
import { useRouter } from "vue-router";
import { saveData } from "@/composables/useStorage";

const { setToken } = useToken();
const { alerts } = useAlert();
const router = useRouter();

const login_type = ref("ACCOUNT_SECRET_LOGIN");
const usertype = ref("VOLS");
const userOptions = [
  { label: "志愿者", value: "VOLS" },
  { label: "管理员", value: "ADMIN" },
];
const isVolsLogin = computed(() => usertype.value === "VOLS");
const username = ref("");
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

// 管理员登录所需数据
const password = ref("");
const passwordInputRef = ref(null);
// 登录状态
const is_loginning = ref(false);

const focusPasswordInput = () => {
  passwordInputRef.value?.$el?.querySelector("input")?.focus();
};

let debounceTimeout = null;

const queryCompetitions = async () => {
  if (!volsNumber.value || volsNumber.value.length !== 9) {
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
  if (newValue && newValue.length === 9) {
    debounceTimeout = setTimeout(queryCompetitions, 500);
  } else {
    availableCompetitions.value = [];
    selectedCompetitionId.value = "";
  }
});

const volsLogin = async () => {
  is_loginning.value = true;

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
    name: username.value,
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
      is_loginning.value = false;
    });
};

const adminLogin = async () => {
  is_loginning.value = true;
  const pw_sha = await SHA256(password.value);
  fetch("/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      loginType: login_type.value,
      userName: username.value,
      password: pw_sha,
    }),
  })
    .then((response) => {
      is_loginning.value = false;
      return response.json();
    })
    .then((data) => {
      if (data.statusCode === 200) {
        alerts("提示", "登录成功，正在跳转");
        setToken(data.data.token);
        router.push("/manage");
      } else {
        alerts("警告", "登录失败: " + data.message);
      }
    })
    .catch((e) => {
      console.error("Error:", e);
      alerts("警告", "登录请求失败，请稍后重试");
    });
};

// 登录按钮的点击事件处理函数
const handleLogin = async () => {
  if (!username.value) {
    alerts("警告", "请输入用户名");
    return;
  }
  if (isVolsLogin.value) {
    if (!volsNumber.value) {
      alerts("警告", "请输入学号");
      return;
    }
    if (
      volsNumber.value.length !== 9 ||
      volsNumber.value.replace(/\d/g, "").length > 0
    ) {
      alerts("警告", "请输入正确的9位学号");
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
  } else {
    if (!password.value || password.value.length < 8) {
      alerts("警告", "密码长度不能少于8位");
      return;
    }
    await adminLogin();
  }
};

const goToHome = () => {
  router.back();
};
</script>

<template>
  <div class="login-container">
    <MobileMenuBar />
    <div class="flex h-full">
      <div
        class="w-7 hidden md:flex align-items-center justify-content-center p-5 text-white image-panel"
      >
        <div class="text-center">
          <h1 class="font-bold text-6xl mb-4">欢迎使用本系统</h1>
          <p class="text-2xl line-height-3">「安全第一、快乐游泳、共同进步」</p>
        </div>
      </div>

      <div
        class="w-full md:w-5 flex align-items-center justify-content-center p-4 relative"
      >
        <Button
          label="返回"
          icon="pi pi-arrow-left"
          class="back-button p-button-secondary"
          @click="goToHome"
        />
        <Card class="login-card w-full">
          <template #title>
            <h2 class="text-center text-3xl">用户登录</h2>
          </template>
          <template #content>
            <div class="flex flex-column gap-4">
              <SelectButton
                v-model="usertype"
                :options="userOptions"
                option-label="label"
                option-value="value"
                class="w-full"
                fluid
              />

              <div class="p-float-label">
                <label>用户名</label>
                <InputText
                  id="username"
                  v-model="username"
                  class="w-full"
                  @keydown.enter.prevent="focusPasswordInput"
                  :disabled="is_loginning"
                />
              </div>

              <div v-if="!isVolsLogin" class="p-float-label">
                <label>密码</label>
                <Password
                  id="password"
                  ref="passwordInputRef"
                  v-model="password"
                  class="w-full"
                  :feedback="false"
                  :disabled="is_loginning"
                  toggleMask
                  @keydown.enter="handleLogin"
                />
              </div>

              <div v-if="isVolsLogin" class="p-float-label">
                <label>学号</label>
                <InputText
                  id="volsNumber"
                  v-model="volsNumber"
                  class="w-full"
                  :disabled="is_loginning"
                  :invalid="volsNumber.replace(/\d/g, '').length > 0"
                  maxlength="9"
                />
              </div>

              <div v-if="isVolsLogin" class="p-float-label">
                <label>选择比赛</label>
                <Select
                  v-model="selectedCompetitionId"
                  :options="availableCompetitions"
                  option-label="competitionName"
                  option-value="id"
                  class="w-full"
                  :disabled="
                    is_loginning ||
                    (availableCompetitions.length === 0 &&
                      !isQueryingCompetitions)
                  "
                  :loading="isQueryingCompetitions"
                  placeholder="请选择比赛"
                >
                  <template #empty>
                    <div class="p-2">
                      <span
                        v-if="
                          volsNumber.length === 9 && !isQueryingCompetitions
                        "
                        class="text-red-500"
                        >未查询到可参与的比赛</span
                      >
                      <span v-else-if="isQueryingCompetitions"
                        >正在查询比赛信息...</span
                      >
                      <span v-else>请输入9位学号以获取比赛列表</span>
                    </div>
                  </template>
                </Select>
              </div>

              <div v-if="isVolsLogin" class="p-float-label">
                <label>职务</label>
                <Select
                  v-model="volsPosition"
                  :options="volsPositionOptions"
                  option-label="label"
                  option-value="value"
                  class="w-full"
                  :disabled="is_loginning"
                />
              </div>

              <div
                v-if="
                  isVolsLogin &&
                  (volsPosition === 'REINTAKE_INSPECTION' ||
                    volsPosition === 'TIMER')
                "
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
                  :disabled="is_loginning"
                  placeholder="请选择负责的泳道"
                />
              </div>

              <Button
                label="登录"
                icon="pi pi-sign-in"
                class="w-full mt-3"
                :class="{
                  'p-disabled':
                    !isVolsLogin && (password.length < 8 || is_loginning),
                }"
                @click="handleLogin"
              />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 容器全屏，并移除默认的边距 */
.login-container {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  background-color: var(--p-content-background); /* 使用主题的背景色 */
  overflow: hidden; /* 防止出现滚动条 */
}

/* 确保 flex 容器在 Menubar 下方时也能占满剩余高度 */
.flex.h-full {
  height: 100%;
}
@media (max-width: 767px) {
  /* 在移动端，MenuBar会占用一部分高度，所以需要计算剩余高度 */
  .flex.h-full {
    height: calc(100% - 50px); /* 假设 Menubar 高度约 50px */
  }
}

/* 返回主页按钮样式 */
.back-button {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10; /* 确保按钮位于最上层 */
}

/* 左侧图片面板样式 */
.image-panel {
  position: relative;
  background: url("/login.webp") no-repeat center center;
  background-size: cover;
}

/* 为图片面板添加一个半透明的遮罩层，让文字更清晰 */
.image-panel::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1;
}
/* 让文字内容在遮罩层之上 */
.image-panel > div {
  position: relative;
  z-index: 2;
}

/* 为图片实现羽化过渡效果 */
.image-panel {
  /* 使用 mask-image 和线性渐变来实现上下边缘的羽化（淡出到透明）
    这是一种现代的 CSS 技术，比图片处理更灵活
  */
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 10%,
    /* 从 10% 的位置开始完全显示 */ black 90%,
    /* 到 90% 的位置结束完全显示 */ transparent 100%
  );
}

/* 登录卡片的最大宽度，防止在超大屏幕上过于拉伸 */
.login-card {
  max-width: 450px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); /* 添加一点阴影使其更突出 */
}

/* 针对 Password 组件的样式微调，使其与 InputText 高度一致 */
:deep(.p-password-input) {
  width: 100%;
}
</style>
