<script setup>
import { ref } from 'vue';
import { useConfirm } from 'primevue/useconfirm';

const confirm = useConfirm();

const showAlert = (message) => {
  console.log(`message ${message}`)
  confirm.require({
    header: '警告',
    message: message,
    icon: 'pi pi-info-circle',
    acceptClass: 'p-button-primary',
    acceptLabel: '确定',
    rejectClass: 'hidden', 
  });
};

const username = ref('');
const password = ref('');
const passwordInputRef = ref(null)
const is_loginning = ref(false);

async function SHA256(str) {
  const message    = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', message);
  const hashArray  = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const focusPasswordInput = () => {
  passwordInputRef.value?.$el?.querySelector('input')?.focus();
};

// 登录按钮的点击事件处理函数
const handleLogin = () => {
  if(!username.value) {
    showAlert('请输入用户名');
    return;
  }
  if(!password.value || password.value.length < 8){
    showAlert('密码长度不能少于8位');
  }
  
  (async function login(){
    is_loginning.value = true;
    let pw_sha = await SHA256(password.value);
    let url = '/admin/login'
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        password: pw_sha
      })
    }).then(response => {
      is_loginning.value = false;
      return response.json()
    }).then(data => {
      if(data.code === 200){
        showAlert('登录成功，欢迎 ' + data.username);
        localStorage.token = data.data.token;
        window.location.href = '/manage';
      } else {
        showAlert('登录失败: ' + data.message);
      }
    }).catch(error =>{
      console.error('Error:', error);
      showAlert('登录请求失败，请稍后重试');
    });
  })()
};
</script>

<template>
  <div class="login-container">
    <MobileMenuBar />
    <div class="flex h-full">
      <div class="w-7 hidden md:flex align-items-center justify-content-center p-5 text-white image-panel">
        <div class="text-center">
          <h1 class="font-bold text-6xl mb-4">欢迎使用本系统</h1>
          <p class="text-2xl line-height-3">一个现代化、响应式的管理平台，由 Vue 和 PrimeVue 强力驱动。</p>
        </div>
      </div>

      <div class="w-full md:w-5 flex align-items-center justify-content-center p-4">
        <Card class="login-card w-full">
          <template #title>
            <h2 class="text-center text-3xl">用户登录</h2>
          </template>
          <template #content>
            <div class="flex flex-column gap-4">
              <div class="p-float-label">
                <InputText 
                  id="username" 
                  v-model="username" 
                  class="w-full" 
                  @keydown.enter.prevent="focusPasswordInput"
                  :disabled="is_loginning"
                />
                <label for="username">用户名</label>
              </div>

              <div class="p-float-label">
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
                <label for="password">密码</label>
              </div>

              <Button 
                label="登录" 
                icon="pi pi-sign-in" 
                class="w-full mt-3" 
                :class="{ 'p-disabled': password.length < 8 || is_loginning}" 
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
  background-color: var(--surface-ground); /* 使用主题的背景色 */
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

/* 左侧图片面板样式 */
.image-panel {
  position: relative;
  background: url('https://imags.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2070&auto=format&fit=crop') no-repeat center center;
  background-size: cover;
}

/* 为图片面板添加一个半透明的遮罩层，让文字更清晰 */
.image-panel::before {
  content: '';
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
    black 10%, /* 从 10% 的位置开始完全显示 */
    black 90%, /* 到 90% 的位置结束完全显示 */
    transparent 100%
  );
}


/* 登录卡片的最大宽度，防止在超大屏幕上过于拉伸 */
.login-card {
  max-width: 450px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1); /* 添加一点阴影使其更突出 */
}

/* 针对 Password 组件的样式微调，使其与 InputText 高度一致 */
:deep(.p-password-input) {
  width: 100%;
}
</style>