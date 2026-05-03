<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import VolsLogin from "@/components/login/VolsLogin.vue";
import AdminLogin from "@/components/login/AdminLogin.vue";
import AlumnLogin from "@/components/login/AlumnLogin.vue";

const router = useRouter();

const usertype = ref("VOLS");
const userOptions = [
  { label: "志愿者", value: "VOLS" },
  { label: "管理员", value: "ADMIN" },
  { label: "校友", value: "ALUMN" },
];

const username = ref("");
const is_loginning = ref(false);
const enableChangeLoginType = ref(true);

const autoChangeLoginType = () => {
  const hash = window.location.hash;
  if (!hash) {
    return;
  }
  const type = hash.slice(1).toUpperCase();
  if (userOptions.map((opt) => opt.value).includes(type)) {
    usertype.value = type;
    enableChangeLoginType.value = false;
  }
};

onMounted(() => {
  autoChangeLoginType();
  window.addEventListener("hashchange", autoChangeLoginType);
});

onUnmounted(() => {
  window.removeEventListener("hashchange", autoChangeLoginType);
});
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
          class="back-button p-button-secondary hidden md:inline-flex"
          @click="router.back"
        />
        <Card class="login-card w-full">
          <template #title>
            <h2 class="text-center text-3xl">
              {{
                userOptions.find((opt) => opt.value === usertype)?.label ||
                "用户"
              }}登录
            </h2>
          </template>
          <template #content>
            <div class="flex flex-column gap-4">
              <SelectButton
                v-if="enableChangeLoginType"
                v-model="usertype"
                :options="userOptions"
                option-label="label"
                option-value="value"
                class="w-full"
                fluid
              />

              <VolsLogin
                v-if="usertype === 'VOLS'"
                v-model:username="username"
                v-model:is-loginning="is_loginning"
              />
              <AdminLogin
                v-else-if="usertype === 'ADMIN'"
                v-model:username="username"
                v-model:is-loginning="is_loginning"
              />
              <AlumnLogin
                v-else-if="usertype === 'ALUMN'"
                v-model:username="username"
                v-model:is-loginning="is_loginning"
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
