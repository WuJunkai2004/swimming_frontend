<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAlert } from '@/composables/useAlert';
import { Excetract } from '@/composables/excelUtils';

const { alerts, awaitAlert } = useAlert();

const gameId = ref(null);
const gameInfo = ref({});
const stage = ref('upload');  // 'upload' or 'manage'
const volunteerList = ref([]);

const isLoading = ref(false);

const isOverEnd = computed(() => {
  if (!gameInfo.value.endTime || gameInfo.value.endTime === '1970-01-01'){
    return false;
  }
  const now = new Date();
  const endTime = new Date(gameInfo.value.endTime);
  return now > endTime;
});

const addPreviewLine = (name, studentId, position, lane) => {
  volunteerList.value.push({
    name,
    studentId,
    position,
    lane
  });
};

const downloadVolunteerList = () => {
  // 表格是 /public/志愿者填写表.xlsx
  // 使用浏览器下载该文件
  const link = document.createElement('a');
  link.href = '/志愿者填写表.xlsx';
  link.download = '志愿者填写表.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const resetAll = async () => {
  const confirm_reset = await awaitAlert(
    '确认',
    '确定要返回上传页面吗？所有数据将会丢失。',
    {
      accept: '确认',
      reject: '取消'
    });
  if (!confirm_reset) {
    return;
  }
  volunteerList.value = [];
  stage.value = 'upload';
}

// 获取比赛信息
const loadGameInfo = () => {
  if (!gameId.value) {
    alerts('错误', '请从比赛管理页面进入该页。或咨询其他管理员。')
    return;
  }

  isLoading.value = true;
  fetch(`/sport/getGameInfo?game=${gameId.value}`)
  .then(response => response.json())
  .then(result => {
    if (result.statusCode === 200) {
      gameInfo.value = result.data;
    } else {
      alerts('错误', result.message || '无法加载赛事信息，请稍后重试');
    }
  })
  .catch(() => {
    alerts('错误', '网络异常，无法加载赛事信息，请稍后重试');
  })
  .finally(() => {
    isLoading.value = false;
  });
}

// 处理上传的Excel文件
const getExcelFile = async (event) => {
  const file = event.files[0];
  if (!file) {
    alerts('错误', '未选择文件，请重新选择');
    return;
  }
  const content = await Excetract.create(file);
  const vol_name = content.getColOf('姓名');
  const vol_id = content.getColOf('学号');
  const vol_position = content.getColOf('职务');
  const take_road = content.getColOf('泳道');
  if (!vol_name.length || !vol_id.length || !vol_position.length) {
    alerts('错误', '上传的表格格式不正确，请使用指定的志愿者填写表');
    return;
  }
  volunteerList.value = [];
  for (let i = 0; i < vol_name.length; i++) {
    const name = vol_name[i];
    const studentId = vol_id[i];
    const position = vol_position[i];
    const road = take_road[i] || '';
    addPreviewLine(name, studentId, position, road);
  }
  stage.value = 'manage';
}

onMounted(() => {
  const params = window.location.href.split('?')[1];
  if (!params){
    alerts('错误', '请从比赛管理页面进入该页。或咨询其他管理员。')
    return;
  }
  const urlParams = new URLSearchParams(params);
  gameId.value = urlParams.get('game');

  loadGameInfo();
})

</script>

<template>
  <div class="p-4 surface-card shadow-3 border-round">

    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold m-0">志愿者管理</h1>
      <Button
        v-if="stage === 'upload'"
        label="下载志愿者填写表"
        icon="pi pi-download"
        @click="downloadVolunteerList"
      />
      <div v-if="stage === 'manage'" class="flex gap-2">
        <Button
          label="返回上传"
          icon="pi pi-eye"
          @click="resetAll"
        />
        <Button
          label="上传志愿者报名表"
          icon="pi pi-upload"
          @click="stage = 'upload'"
        />
      </div>
    </div>
    <Divider />

    <Card class="mb-4" :class="{ 'border-1 border-red-500': isOverEnd }">
      <template #title>
        <div :class="{ 'text-red-500': isOverEnd }">{{ gameInfo.name }}</div>
      </template>
      <template #content>
        <div class="flex align-items-center gap-2">
          <i class="pi pi-calendar text-xl" :class="isOverEnd ? 'text-red-500' : 'text-primary'"></i>
          <span class="text-xl" :class="{ 'text-red-500 font-bold': isOverEnd }">
            截止时间：{{ gameInfo.endTime }}
            <span v-if="isOverEnd">已截止</span>
          </span>
        </div>
      </template>
    </Card>

    <div v-if="stage === 'upload'">
      <Card class="upload-panel">
        <template #content>
          <FileUpload
            name="gameExcel"
            @uploader="getExcelFile"
            auto
            customUpload
            accept=".xlsx, .xls"
            :maxFileSize="10000000"
            :multiple="false"
            chooseLabel="选择表格文件"
            :showUploadButton="false"
            :showCancelButton="false"
          >
            <template #empty>
              <div class="flex align-items-center justify-content-center flex-column p-5">
                <i class="pi pi-cloud-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
                <p class="mt-4 mb-0 text-xl">将比赛报名总表 (Excel) 拖拽到此处</p>
                <p class="mt-2 text-color-secondary">或点击选择文件</p>
              </div>
            </template>
          </FileUpload>
        </template>
      </Card>
    </div>

    <div v-if="stage === 'manage'">
      <DataTable :value="volunteerList" showGridlines stripedRows responsiveLayout="scroll">
        <template #header>
          <div class="flex justify-content-between align-items-center">
            <span class="text-xl font-bold">预览上传结果</span>
          </div>
        </template>
        <Column field="name" header="姓名"></Column>
        <Column field="studentId" header="学号"></Column>
        <Column field="position" header="职务"></Column>
        <Column field="lane" header="泳道"></Column>
      </DataTable>
    </div>

  </div>
</template>

<style scoped>
</style>