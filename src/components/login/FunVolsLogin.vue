<script setup>
import { ref, watch } from "vue";
import { useToken } from "#/useToken";
import { useAlert } from "#/useAlert";
import { SHA256 } from "#/useHash";
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

const studentNumber = ref("");
const password = ref("");
const selectedCompetitionId = ref("");
const availableCompetitions = ref([]);
const isQueryingCompetitions = ref(false);
let debounceTimeout = null;

const passwordInputRef = ref(null);

const focusPasswordInput = () => {
  passwordInputRef.value?.$el?.querySelector("input")?.focus();
};

const queryCompetitions = async () => {
  if (!studentNumber.value) return;

  isQueryingCompetitions.value = true;
  fetch(`/api/competition/queryCompetition?studentNumber=${studentNumber.value}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.statusCode === 200) {
        availableCompetitions.value = data.data || [];
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

watch(studentNumber, (newValue) => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  if (newValue && newValue.length >= 9) {
    debounceTimeout = setTimeout(queryCompetitions, 750);
  } else {
    availableCompetitions.value = [];
    selectedCompetitionId.value = "";
  }
});

const handleLogin = async () => {
  if (!props.username) {
    alerts("警告", "请输入用户名");
    return;
  }
  if (!studentNumber.value) {
    alerts("警告", "请输入学号");
    return;
  }
  if (!selectedCompetitionId.value) {
    alerts("警告", "请选择一个比赛");
    return;
  }
  if (!password.value) {
    alerts("警告", "请输入密码");
    return;
  }

  emit("update:isLoginning", true);
  
  const pw_sha = await SHA256(password.value);
  
  const payload = {
    name: props.username,
    studentNumber: studentNumber.value,
    password: pw_sha,
    competitionId: selectedCompetitionId.value,
  };

  fetch("/api/funVolunteer/login", {
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
        router.push("/fun-volunteer");
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
        @keydown.enter.prevent="focusPasswordInput"
        :disabled="isLoginning"
      />
    </div>

    <div class="p-float-label">
      <label>学号</label>
      <InputText
        id="studentNumber"
        v-model="studentNumber"
        class="w-full"
        :disabled="isLoginning"
        :invalid="studentNumber.replace(/\d/g, '').length > 0"
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
              v-if="studentNumber.length >= 9 && !isQueryingCompetitions"
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
      <label>密码</label>
      <Password
        id="password"
        ref="passwordInputRef"
        v-model="password"
        class="w-full"
        :feedback="false"
        :disabled="isLoginning"
        toggleMask
        @keydown.enter="handleLogin"
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
