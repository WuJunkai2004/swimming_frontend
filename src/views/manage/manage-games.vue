<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToken } from '@/composables/useToken';
import { useAlert } from '@/composables/useAlert';
import { useCollegeEnum } from '@/composables/collegeMapping';
import { Copying } from '@/composables/useCopy';

// --- 1. 初始化 ---
const { getToken } = useToken();
const { alerts } = useAlert();
const { collegeMap } = useCollegeEnum();

// --- 2. 状态定义 ---
// 列表状态
const gamesList = ref([]);
const isLoading = ref(true);
const error = ref(null);
const expandedRows = ref({}); // 控制 DataTable 的行展开状态

// 预览弹窗状态
const isPreviewVisible = ref(false);
const isPreviewLoading = ref(false);
const previewData = ref(null);

// 分享弹窗状态
const isShareVisible = ref(false);
const currentGame = ref(null);

const showShareDialog = (game) => {
  currentGame.value = game;
  isShareVisible.value = true;
};

const shareLink = computed(() => {
  if (!currentGame.value){
    return '';
  }
  return `${window.location.origin}/register/${currentGame.value.uuid}`;
});

const copyShareLink = () => {
  console.log("正在复制")
  if (!shareLink.value){
    return;
  }
  const text = `${currentGame.value.Name}报名，请访问以下链接：\n${shareLink.value}`;
  Copying(text)
  .then(() => {
    alerts("提示", "复制成功");
    isShareVisible.value = false;
  })
  .catch(() => {
    alerts("警告", "复制失败，请手动复制");
  })
};

// --- 3. API 调用与数据处理 ---

// 获取比赛列表 (在页面加载时调用)
const fetchGamesList = async () => {
  isLoading.value = true;
  error.value = null;
  fetch('/sport/getGameList')
  .then(response => response.json())
  .then(result =>{
    if (result.statusCode === 200) {
      // 为每行数据添加用于控制展开后内容的属性
      gamesList.value = result.data.map(game => ({
        ...game,
        details: null, // 存储展开后的详情
        isLoadingDetails: false, // 控制展开后的加载状态
      }));
    } else {
      error.value = result.message || '无法加载比赛列表，请稍后重试'
    }
  })
  .catch(() => {
    error.value = '网络错误，请稍后重试';
  })
  .finally(() => {
    isLoading.value = false;
  })
};

// 需求 2.2: 当用户展开某一行时，按需加载该比赛的详细信息
const onRowExpand = async (event) => {
  const game = event.data;
  // 如果是展开行，并且尚未加载过详情
  if (!game.details) {
    game.isLoadingDetails = true;
    fetch(`/sport/getGameInfo?game=${game.uuid}`)
    .then(response => response.json())
    .then(result => {
      if (result.statusCode === 200) {
        game.details = {
          ...result.data,
          error: null
        };
      } else {
        game.details = { error: result.message || '加载详情失败' };
      }
    })
    .catch(() => {
      game.details = { error: '网络错误，加载详情失败' };
    })
    .finally(() => {
      game.isLoadingDetails = false;
    });
  }
};

const jumpToPublish = () => {
  window.location.hash = '#/publish-game';
}

// 需求 2.3: 预览比赛报名情况
const showPreview = async (game) => {
  isPreviewVisible.value = true;
  isPreviewLoading.value = true;
  previewData.value = null;
  currentGame.value = game;

  try {
    const response = await fetch('/sport/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: getToken(),
        gameid: game.uuid
      })
    });
    const result = await response.json();

    if (result.statusCode === 200) {
      previewData.value = result.data;
    } else {
      throw new Error(result.message || '预览失败');
    }
  } catch (e) {
    previewData.value = { error: e.message };
  } finally {
    isPreviewLoading.value = false;
  }
};

// 需求 2.4: 导出比赛数据 (POST 请求下载)
const exportData = async (game) => {
  const exportButton = document.getElementById(`export-btn-${game.uuid}`);
  exportButton.disabled = true; // 临时禁用按钮防止重复点击

  try {
    const response = await fetch('/sport/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: getToken(),
        gameId: game.uuid
      })
    });

    if (!response.ok) {
      throw new Error('导出失败，服务器返回错误');
    }

    // 1. 将返回的二进制流转换为 Blob 对象
    const blob = await response.blob();
    // 2. 从响应头中获取文件名 (如果后端设置了的话)
    const disposition = response.headers.get('Content-Disposition');
    let filename = `${game.Name}_报名表.xlsx`; // 默认文件名
    if (disposition && disposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    // 3. 创建一个隐藏的 <a> 标签来触发下载
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); // 需要将 a 标签添加到 DOM 中才能在 Firefox 中正常工作
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch(e) {
    alerts('错误', '导出失败', {icon: 'pi pi-exclamation-triangle'});
  } finally {
    exportButton.disabled = false; // 重新启用按钮
  }
};

// --- 6. 生命周期钩子 ---
onMounted(fetchGamesList);

</script>

<template>
  <div class="p-4 surface-card shadow-2 border-round">

    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold m-0">比赛管理</h1>
      <Button
        label="发布新比赛"
        icon="pi pi-plus"
        @click=jumpToPublish
      />
    </div>

    <Divider />

    <div>
      <div v-if="isLoading">
        <DataTable :value="[{}, {}, {}]" class="p-datatable-striped">
          <Column expander/>
          <Column header="比赛名称">
            <template #body>
              <Skeleton />
            </template>
          </Column>
          <Column header="操作">
            <template #body>
              <Skeleton height="2rem" width="10rem" />
            </template>
          </Column>
        </DataTable>
      </div>

      <div v-else-if="error">
        <Message severity="error" :closable="false">{{ error }}</Message>
      </div>

      <DataTable
        v-else
        :value="gamesList"
        v-model:expandedRows="expandedRows"
        @row-expand="onRowExpand"
        dataKey="uuid"
        responsiveLayout="scroll"
      >
        <Column expander style="width: 3rem" />

        <Column field="Name" header="比赛名称"></Column>

        <Column header="操作" style="width: 12rem">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button
                label="分享"
                class="p-button-text p-button-sm p-button-success"
                @click="showShareDialog(slotProps.data)"
              />
              <Button
                label="预览"
                class="p-button-text p-button-sm"
                @click="showPreview(slotProps.data)"
              />
              <Button
                label="导出"
                class="p-button-text p-button-sm"
                :id="`export-btn-${slotProps.data.uuid}`"
                @click="exportData(slotProps.data)"
              />
            </div>
          </template>
        </Column>

        <template #expansion="slotProps">
          <div class="expansion-content p-3">
            <div v-if="slotProps.data.isLoadingDetails" class="flex align-items-center">
              <ProgressSpinner style="width: 24px; height: 24px" strokeWidth="6" />
              <span class="ml-2">正在加载详情...</span>
            </div>
            <div v-else-if="slotProps.data.details">
              <div v-if="slotProps.data.details.error" class="text-red-500">
                {{ slotProps.data.details.error }}
              </div>
              <div v-else class="flex flex-wrap gap-4">
                <div>
                  <span class="font-semibold">报名截止日期: </span>
                  <span>{{ new Date(slotProps.data.details.endTime).toLocaleString() }}</span>
                </div>
                <div>
                  <span class="font-semibold">项目总数: </span>
                  <span>{{ slotProps.data.details.events.length }} 个</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="isShareVisible"
      modal
      header="分享比赛报名链接"
      :style="{ width: '90vw', maxWidth: '500px' }"
    >
      <div v-if="currentGame">
        <div class="share-link-text p-3 mb-4 surface-100 border-round">
          <p>{{ currentGame.Name }}报名，请访问以下链接：</p>
          <p>{{ shareLink }}</p>
        </div>
      </div>
      <template #footer>
        <Button label="关闭" @click="isShareVisible = false" class="p-button-text" />
        <Button label="复制" @click="copyShareLink" icon="pi pi-copy" />
        <a :href="shareLink" target="_blank" rel="noopener noreferrer">
          <Button label="跳转预览" icon="pi pi-external-link" />
        </a>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="isPreviewVisible"
      modal
      header="比赛报名情况预览"
      :style="{ width: '90vw', maxWidth: '960px' }"
      dismissableMask
    >
      <div v-if="isPreviewLoading" class="text-center p-5">
        <ProgressSpinner />
      </div>
      <div v-else-if="previewData">
        <div v-if="previewData.error">
           <Message severity="error" :closable="false">{{ previewData.error }}</Message>
        </div>
        <div v-else>
          <div class="preview-summary p-3 mb-4 surface-100 border-round flex justify-content-between align-items-start">
            <div>
              <p><strong>比赛名称:</strong> {{ previewData.competitionName }}</p>
              <p><strong>报名截止时间:</strong> {{ new Date(previewData.endTime).toLocaleString() }}</p>
              <p><strong>负责人联系方式:</strong> {{ previewData.leaderPhone }}</p>
            </div>
            <div>
              <Button
                label="导出此预览"
                icon="pi pi-download"
                class="p-button-sm"
                @click="exportData(currentGame)"
              />
            </div>
          </div>
          <DataTable :value="previewData.athleteDetail" responsiveLayout="scroll">
            <Column field="athleteName" header="姓名"></Column>
            <Column field="athleteId" header="学号"></Column>
            <Column field="college" header="学院">
              <template #body="slotProps">
                {{ collegeMap[slotProps.data.college] || slotProps.data.college }}
              </template>
            </Column>
            <Column field="registerEvents" header="报名项目">
              <template #body="slotProps">
                {{ slotProps.data.registerEvents.join(', ') }}
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
/* 展开行的内容样式 */
.expansion-content {
  background-color: var(--p-surface-100);
}

/* 分享链接的预览区域文字自动换行 */
.share-link-text p {
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
  overflow-wrap: break-word;
}
</style>