<script setup>
import { ref } from "vue";
import { useToken } from "#/useToken";
import { useAlert } from "#/useAlert";
import { SHA256 } from "#/useHash";
import { useRouter } from "vue-router";

const props = defineProps({
  username: String,
  isLoginning: Boolean,
});

const emit = defineEmits(["update:username", "update:isLoginning"]);

const { setToken } = useToken();
const { alerts } = useAlert();
const router = useRouter();

const password = ref("");
const passwordInputRef = ref(null);

const focusPasswordInput = () => {
  passwordInputRef.value?.$el?.querySelector("input")?.focus();
};

const athleteLogin = async () => {
  emit("update:isLoginning", true);
  const pw_sha = await SHA256(password.value);

  fetch(
    `/athlete/login?name=${encodeURIComponent(props.username)}&password=${encodeURIComponent(pw_sha)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.statusCode === 200) {
        alerts("提示", "登录成功，正在跳转");
        setToken(data.data.token);
        router.push("/athlete");
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
  if (!password.value) {
    alerts("警告", "请输入密码");
    return;
  }
  await athleteLogin();
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
