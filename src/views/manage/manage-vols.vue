<script setup>
import { ref, onMounted } from 'vue';
import { useAlert } from '@/composables/useAlert';

const { alerts } = useAlert();

const gameId = ref(null);

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

const loadGameInfo = () => {
  if (!gameId.value) {
    alerts('错误', '请从比赛管理页面进入该页。或咨询其他管理员。')
    return;
  }
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
        label="下载志愿者填写表"
        icon="pi pi-download"
        @click="downloadVolunteerList"
      />
    </div>

  </div>
</template>

<style scoped>
</style>