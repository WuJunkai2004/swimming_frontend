<script setup>
// --- 1. 核心依赖导入 ---
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useAlert } from '@/composables/useAlert';

// --- 2. 初始化 ---
const { alerts, asyncAlert } = useAlert();
const editorRef = ref(null);

// --- 3. 状态定义 (保持不变) ---
const title = ref('');
const content = ref('');
const isSaving = ref(false);
const isPublishing = ref(false);
let autosaveInterval = null;
const isImageDialogVisible = ref(false);
const isVideoDialogVisible = ref(false);
let cursorIndex = 0;

// --- 4. 编辑器定制 (保持不变) ---
const customImageHandler = () => {
  const quill = editorRef.value.quill;
  cursorIndex = quill.getSelection(true).index;
  isImageDialogVisible.value = true;
};

const customVideoHandler = () => {
  const quill = editorRef.value.quill;
  cursorIndex = quill.getSelection(true).index;
  isVideoDialogVisible.value = true;
};

// 自定义媒体处理函数
const handleImageUpload = (file) => {
  console.log('开始上传图片:', file);
  const imageUrl = 'https://primefaces.org/cdn/primevue/images/galleria/galleria1.jpg';

  // 获取 Quill 实例
  const quill = editorRef.value.quill
  quill.insertEmbed(cursorIndex, 'image', imageUrl);
  isImageDialogVisible.value = false;
  alerts('成功', '图片插入成功', {icon: 'pi pi-check-circle'});
};

const handleVideoUpload = (videoFile, previewFile) => {
  console.log('开始上传视频:', videoFile, '预览图:', previewFile);
  const videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
  const quill = editorRef.value.quill;
  quill.insertEmbed(cursorIndex, 'video', videoUrl);
  isVideoDialogVisible.value = false;
  alerts('成功', '视频插入成功', {icon: 'pi pi-check-circle'});
};

// 草稿管理
const DRAFT_KEY = 'news_draft';
const saveDraft = () => {
  isSaving.value = true;
  const draft = {
    title: title.value,
    content: content.value,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  // 自动保存的提示可以考虑移除，避免频繁打扰
  console.log('草稿已自动保存');
  setTimeout(() => isSaving.value = false, 1000);
};

const loadDraft = () => {
  const draftString = localStorage.getItem(DRAFT_KEY);
  if (!draftString) {
    return;
  }
  const draft = JSON.parse(draftString);
  if(!draft.content && !draft.title){
    return;
  }
  asyncAlert(
    '发现本地草稿',
    `我们发现了一份您在 ${new Date(draft.savedAt).toLocaleString()} 保存的草稿，要恢复吗？`,
    {
      accept: '恢复草稿',
      reject: '放弃',
      icon: 'pi pi-history'
    })
  .then(() => {
    title.value = draft.title;
    content.value = draft.content;
    alerts('成功', '草稿已恢复', {icon: 'pi pi-check-circle'});
  })
  .catch(() => {
    localStorage.removeItem(DRAFT_KEY);
    alerts('提示', '草稿已放弃', {icon: 'pi pi-exclamation-triangle'});
  })
};

const clearDraft = () => {
  localStorage.removeItem(DRAFT_KEY);
  console.log('本地草稿已清除');
};

// 发布新闻
const publishNews = async () => {
  if (!title.value || content.value.length < 20) {
    alerts('无法发布', '请填写标题和至少一些内容', {icon: 'pi pi-exclamation-triangle'});
    return;
  }

  isPublishing.value = true;
  console.log('准备发布新闻:', { title: title.value, content: content.value });
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    alerts('发布成功', '新闻已成功发布！', {icon: 'pi pi-check-circle'});
    title.value = '';
    content.value = '';
    clearDraft();
  } catch (e) {
    alerts('发布失败', e.message, {icon: 'pi pi-times-circle'});
  } finally {
    isPublishing.value = false;
  }
};

// --- 6. 生命周期钩子 (保持不变) ---
onMounted(() => {
  loadDraft();
  autosaveInterval = setInterval(saveDraft, 3 * 60 * 1000);

  // 需要等待下一个tick，确保编辑器已经渲染完成
  setTimeout(() => {
    const quill = editorRef.value.quill;
    const toolbar = quill.getModule('toolbar');
    if (toolbar) {
      toolbar.addHandler('image', customImageHandler);
      toolbar.addHandler('video', customVideoHandler);
      console.log('成功设置自定义处理器');
    }
  }, 500);
});

onBeforeUnmount(() => {
  if (autosaveInterval) {
    clearInterval(autosaveInterval);
  }
});
</script>


<template>
  <div class="p-4 surface-card shadow-2 border-round">

    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold m-0">新闻编辑</h1>
      <div class="flex gap-2">
        <Button 
          label="保存草稿" 
          icon="pi pi-save" 
          severity="secondary" 
          outlined 
          @click="saveDraft" 
          :loading="isSaving" 
        />
        <Button 
          label="发布" 
          icon="pi pi-send" 
          @click="publishNews" 
          :loading="isPublishing" 
        />
      </div>
    </div>
    <Divider />

    <InputText 
      v-model="title" 
      placeholder="请输入新闻标题..." 
      class="title-input w-full p-3 mb-4 text-2xl" 
    />

    <Editor v-model="content" editorStyle="height: 450px" ref="editorRef">
      <template #toolbar>
        <span class="ql-formats">
          <button class="ql-bold"></button>
          <button class="ql-italic"></button>
          <button class="ql-underline"></button>
        </span>
        <span class="ql-formats">
          <button class="ql-list" value="ordered"></button>
          <button class="ql-list" value="bullet"></button>
        </span>
        <span class="ql-formats">
          <select class="ql-align"></select>
        </span>
        <span class="ql-formats">
          <button class="ql-link"></button>
          <button class="ql-image"></button>
          <button class="ql-video"></button>
        </span>
      </template>
    </Editor>

    <Dialog v-model:visible="isImageDialogVisible" modal header="插入图片">
      <p>请选择要上传的图片：</p>
      <Button label="模拟上传并插入" @click="handleImageUpload('mock_file.jpg')" />
    </Dialog>

    <Dialog v-model:visible="isVideoDialogVisible" modal header="插入视频">
      <p>请选择视频和预览图：</p>
      <Button label="模拟上传并插入" @click="handleVideoUpload('mock_video.mp4', 'mock_preview.jpg')" />
    </Dialog>
  </div>
</template>

<style scoped>
/* 标题输入框样式，使其更像一个标题而不是普通输入框 */
.title-input {
  border: none;
  border-bottom: 1px solid var(--p-inputtext-border-color);
  border-radius: 0;
  box-shadow: none !important;
  font-weight: 600;
}

.title-input:focus {
  border-bottom-color: var(--p-primary-color);
}

/* 编辑器默认字体设置 */
:deep(.ql-editor) {
  /*font-family: '宋体', 'SimSun', serif;  默认字体为宋体 */
  font-size: 1.1rem; /* 默认字号 */
}

/* 确保 p-fluid 表单样式能正确应用 */
.field {
  margin-bottom: 1rem;
}
</style>