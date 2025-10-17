<script setup>
// --- 1. 核心依赖导入 ---
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useAlert } from '@/composables/useAlert';
import { useToken } from '@/composables/useToken';
import { uploadImage, uploadVideo } from '@/composables/uploads';
import { useRouter } from 'vue-router';

// --- 2. 初始化 ---
const { alerts, asyncAlert } = useAlert();
const { getToken } = useToken();
const router = useRouter();

// --- 3. 状态定义 ---
const title = ref('');
const contentBlocks = ref([
  { type: 'text', data: '' } // 默认始于一个空的文本块
]);
const isSaving = ref(false);
const isPublishing = ref(false);

// 弹窗状态
let autosaveInterval = null;
const isImageDialogVisible = ref(false);
const isVideoDialogVisible = ref(false);
const editingBlockIndex = ref(-1);

// --- 4. 编辑器定制 ---

// 限制插入视频数量，最多1个
const maxVideoBlocks = 1;
const canAddVideoBlock = computed(() => {
  const videoCount = contentBlocks.value.filter(block => block.type === 'video').length;
  return videoCount < maxVideoBlocks;
});

// 添加一个新的文本块
const addTextBlock = () => {
  contentBlocks.value.push({ type: 'text', data: '' });
};

const addImageBlock = () => {
  contentBlocks.value.push({ type: 'image', url: '', preview: '' });
};

const addVideoBlock = () => {
  contentBlocks.value.push({ type: 'video', url: '', preview: '' });
}

// 打开图片上传弹窗
const openImageDialog = (index) => {
  editingBlockIndex.value = index;
  isImageDialogVisible.value = true;
};

// 打开视频上传弹窗
const openVideoDialog = (index) => {
  editingBlockIndex.value = index;
  isVideoDialogVisible.value = true;
};

// 删除一个块
const deleteBlock = (index) => {
  contentBlocks.value.splice(index, 1);
};

// 上移一个块
const moveBlockUp = (index) => {
  if(index === 0){
    return;
  }
  [contentBlocks.value[index - 1], contentBlocks.value[index]] = 
    [contentBlocks.value[index], contentBlocks.value[index - 1]];
};

// 下移一个块
const moveBlockDown = (index) => {
  if(index >= contentBlocks.value.length - 1){
    return;
  }
  [contentBlocks.value[index + 1], contentBlocks.value[index]] = 
    [contentBlocks.value[index], contentBlocks.value[index + 1]];
}

// --- 5. 自定义媒体处理函数 ---
const insertFunction = (type, deal, final) => {
  return (event) => {
    const editing = editingBlockIndex.value;
    const allowed = {
      "image": ["image"],
      "video": ["video", "image"], // 视频块允许上传视频和封面图
    }
    if(editing === -1 || !allowed[contentBlocks.value[editing].type].includes(type)){
      alerts('错误', `错误的函数调用方式`, {icon: 'pi pi-times-circle'});
      return;
    }
    const file = event.files[0];
    if(!file){
      alerts('错误', '未选择文件', {icon: 'pi pi-times-circle'});
      return;
    }
    const handler = {
      "image": uploadImage,
      "video": uploadVideo,
    }[type];
    handler(getToken(), file)
    .then(response => response.json())
    .then(deal)
    .catch(() => {
      alerts('上传失败', '网络异常，上传失败', {icon: 'pi pi-times-circle'});
    })
    .finally(final);
  }
}

const insertImage = insertFunction('image', 
  (result) => {
    if(result.statusCode === 200){
      const editing = editingBlockIndex.value;
      contentBlocks.value[editing].url = result.data.url;
    } else {
      alerts('上传失败', result.message, {icon: 'pi pi-times-circle'});
    }
  }, 
  () => {
    isImageDialogVisible.value = false;
  }
);

const insertVideoContent = insertFunction('video', 
  (result) => {
    if(result.statusCode === 200){
      const editing = editingBlockIndex.value;
      contentBlocks.value[editing].url = result.data.videoUrl;
    } else {
      alerts('上传失败', result.message, {icon: 'pi pi-times-circle'});
    }
  }, 
  () => {
    // 上传视频后不关闭弹窗，等待封面上传
  }
);

const insertVideoPreview = insertFunction('image', 
  (result) => {
    if(result.statusCode === 200){
      const editing = editingBlockIndex.value;
      contentBlocks.value[editing].preview = result.data.url;
    } else {
      alerts('上传失败', result.message, {icon: 'pi pi-times-circle'});
    }
  }, 
  () => {
    // 上传封面后不关闭弹窗，等待用户确认插入
  }
);

const insertVideoFinish = async () => {
  const editing = editingBlockIndex.value;
  if(editing === -1 || contentBlocks.value[editing].type !== 'video'){
    alerts('错误', `错误的函数调用方式`, {icon: 'pi pi-times-circle'});
    return;
  }
  if(!contentBlocks.value[editing].url){
    alerts('错误', '请先上传视频文件', {icon: 'pi pi-times-circle'});
    return;
  }
  if(!contentBlocks.value[editing].preview){
    if(!await awaitAlert('确认插入', '您还未上传封面图，是否继续？', {
      icon: 'pi pi-exclamation-triangle',
      accept: '继续插入',
      reject: '取消'
    })){
      return;
    }
  }
  isVideoDialogVisible.value = false;
}

// 草稿管理
const DRAFT_KEY = 'news_draft';
const saveDraft = () => {
  isSaving.value = true;
  const draft = {
    title: title.value,
    content: contentBlocks.value,
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
    contentBlocks.value = draft.content;
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
  const isContentEmpty = () => {
    return contentBlocks.value.every(block => {
      if (block.type === 'text') {
        return !block.data.trim();
      }
      if (block.type === 'image' || block.type === 'video') {
        return !block.url;
      }
      return true;
    });
  }
  if (!title.value || isContentEmpty()) {
    alerts('无法发布', '请填写标题和一些内容', {icon: 'pi pi-exclamation-triangle'});
    return;
  }
  isPublishing.value = true;
  console.log('准备发布新闻:', { title: title.value, content: contentBlocks.value });
  fetch('/admin/uploadNews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: getToken(),
      title: title.value,
      content: contentBlocks.value
    })
  })
  .then(response => response.json())
  .then(result => {
    if (result.statusCode === 200) {
      title.value = '';
      contentBlocks.value = [];
      clearDraft();
      asyncAlert('恭喜', '新闻发布成功！', {
        icon: 'pi pi-check-circle',
        accept: '查看新闻',
        reject: '关闭'
      })
      .then(() => {
        router.push(`/activity/${result.data}`);
      })
      .catch(() => {
        error.value = '网络错误，请稍后重试';
      });
    } else {
      alerts('发布失败', result.message, {icon: 'pi pi-times-circle'});
    }
  })
  .catch(err => {
    alerts('发布失败', err.message, {icon: 'pi pi-times-circle'});
  })
  .finally(() => {
    isPublishing.value = false;
  });
};

// --- 一些ui上的细节 --- 
const handleTextareaInput = (event) => {
  const textarea = event.target;
  // 1. 先将高度重置为'auto'，让浏览器重新计算scrollHeight的最小值
  textarea.style.height = 'auto';
  // 2. 然后将高度设置为当前内容所需的实际高度
  textarea.style.height = `${textarea.scrollHeight}px`;
};

// --- 6. 生命周期钩子 ---
onMounted(() => {
  loadDraft();
  autosaveInterval = setInterval(saveDraft, 3 * 60 * 1000);
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

    <div class="block-editor">
      <div 
        v-for="(block, index) in contentBlocks" 
        :key="index" 
        class="block-item"
      >
        <div class="block-actions">
          <Button icon="pi pi-arrow-up"   class="p-button-rounded p-button-text p-button-help" @click="moveBlockUp(index)" :disabled="index===0" />
          <Button icon="pi pi-trash"      class="p-button-rounded p-button-text p-button-danger" @click="deleteBlock(index)" />
          <Button icon="pi pi-arrow-down" class="p-button-rounded p-button-text p-button-help" @click="moveBlockDown(index)" :disabled="index===contentBlocks.length-1" />
        </div>

        <Textarea 
          v-if="block.type === 'text'" 
          v-model="block.data" 
          autoResize 
          class="w-full text-block" 
          placeholder="请输入正文..."
          @input="handleTextareaInput"
        />
        
        <div v-else-if="block.type === 'image'" class="media-block" @click="openImageDialog(index)">
          <img v-if="block.url" :src="block.url" alt="已插入图片" />
          <div v-else class="placeholder">
            <i class="pi pi-image"></i>
            <span>点击上传图片</span>
          </div>
        </div>

        <div v-else-if="block.type === 'video'" class="media-block" @click="openVideoDialog(index)">
          <video v-if="block.url" :src="block.url" :poster="block.preview" controls></video>
          <div v-else class="placeholder">
            <i class="pi pi-video"></i>
            <span>点击上传视频</span>
          </div>
        </div>

      </div>

      <div class="add-block-actions mt-4">
        <Divider align="left">
          <span class="text-color-secondary">添加内容</span>
        </Divider>
        <div class="flex gap-2">
          <Button label="文本" icon="pi pi-align-left" @click="addTextBlock" class="p-button-outlined" />
          <Button label="图片" icon="pi pi-image" @click="addImageBlock" class="p-button-outlined" />
          <Button label="视频" icon="pi pi-video" @click="addVideoBlock" class="p-button-outlined" :disabled="!canAddVideoBlock"/>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="isImageDialogVisible" modal header="插入图片" :style="{ width: '50rem' }">
      <FileUpload 
        name="image" 
        @uploader="insertImage" 
        :customUpload="true" 
        accept="image/*" 
        :maxFileSize="5000000"
        chooseLabel="选择图片"
        :auto="true" 
        :showUploadButton="false"
        :showCancelButton="false"
      >
        <template #empty>
          <div class="flex align-items-center justify-content-center flex-column">
            <i class="pi pi-cloud-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
            <p class="mt-4 mb-0">将文件拖拽到此处上传</p>
          </div>
        </template>
      </FileUpload>
    </Dialog>

    <Dialog v-model:visible="isVideoDialogVisible" modal header="插入视频" :style="{ width: '50rem' }">
      <div class="grid formgrid">
        <div class="col-12 field">
          <label>上传视频文件</label>
          <FileUpload 
            name="video" 
            @uploader="insertVideoContent" 
            :customUpload="true" 
            accept="video/*" 
            chooseLabel="选择视频" 
            :auto="true" 
            :showUploadButton="false"
            :showCancelButton="false"
          />
        </div>
        <div class="col-12 field">
          <label>上传视频封面</label>
          <FileUpload 
            name="preview" 
            @uploader="insertVideoPreview" 
            :customUpload="true" 
            accept="image/*" 
            :maxFileSize="5000000"
            chooseLabel="选择封面图" 
            :auto="true"
            :showUploadButton="false"
            :showCancelButton="false"
          />
        </div>
      </div>
       <template #footer>
        <Button label="取消" @click="isVideoDialogVisible=false" class="p-button-text" />
        <Button label="确认插入" @click="insertVideoFinish" />
      </template>
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

/* 块编辑器容器 */
.block-editor {
  border: 1px solid var(--p-inputtext-border-color);
  border-radius: 6px;
  padding: 1rem;
}

/* 每个内容块的样式 */
.block-item {
  position: relative;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 4px;
}
.block-item:hover {
  border-color: var(--p-primary-color);
}
.block-item:hover .block-actions {
  opacity: 1;
  transform: translateY(-50%) translateX(-1rem);
  pointer-events: auto;
}

/* 块操作按钮 (删除、移动) */
.block-actions {
  position: absolute;
  top: 50%;
  left: -1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.0rem; /* 按钮之间的垂直间距 */
  opacity: 0;
  transform: translateY(-50%) translateX(0); /* 初始向右偏移，translateY 用于垂直居中 */
  background-color: var(--p-surface-50);
  border-radius: 8px;
  padding: 0;
  transition: all 0.2s ease-in-out; /* 对所有属性应用过渡效果 */
  pointer-events: none; /* 隐藏时禁用鼠标事件 */
}

/* 文本块 (Textarea) 样式 */
.text-block {
  font-size: 1.1rem;
  line-height: 1.8;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  background: transparent !important;
}

/* 媒体块 (图片/视频) 样式 */
.media-block {
  width: 100%;
  min-height: 200px;
  background-color: var(--p-surface-100);
  border: 2px dashed var(--p-inputtext-border-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
}
.media-block:hover {
  border-color: var(--p-primary-color);
}
.media-block img,
.media-block video {
  max-width: 100%;
  max-height: 500px;
  display: block;
}
.media-block .placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--p-inputtext-color);
}
.media-block .placeholder i {
  font-size: 3rem;
  margin-bottom: 1rem;
}
</style>
