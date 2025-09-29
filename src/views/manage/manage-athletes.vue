<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToken } from '@/composables/useToken';
import { useAlert } from '@/composables/useAlert';

const { getToken } = useToken(); // 获取 Token 的函数
const { alerts, awaitAlert, asyncAlert } = useAlert(); // 弹窗提示服务

const athletesList = ref([]);
const isLoading = ref(true);
const error = ref(null);

// 弹窗状态
const isDialogVisible = ref(false);
const dialogMode = ref('add'); // 'add' 或 'edit'
const isDialogLoading = ref(false); // 用于弹窗内部的操作（获取详情、提交）
const editingAthleteId = ref(null); // 存储正在编辑的运动员ID

// 表单数据状态
const formName = ref('');
const formAge = ref(null);
const formGrade = ref('');
const formIntroduction = ref('');
const formImgUrl = ref(''); // 用于头像展示

const allRequiredField = computed(() => {
  return formName.value && formAge.value && formGrade.value && formIntroduction.value;
});

// --- 4. API 调用逻辑 ---

// 获取运动员列表
const fetchAthletesList = async () => {
  isLoading.value = true;
  error.value = null;
  fetch('/player/getExcellenceList')
  .then(response => response.json())
  .then(data => {
    if(data.statusCode === 200){
      athletesList.value = data.data;
    } else {
      error.value = data.message;
    }
  })
  .finally(() => {
    isLoading.value = false;
  })
};


/**
 * 处理自定义头像上传的函数
 * @param {object} event - FileUpload 组件传出的事件对象，包含选中的文件
 */
const handleAvatarUpload = async (event) => {
  const file = event.files[0];
  if (!file) {
    return; // 如果用户没有选择文件，则不执行任何操作
  }
  // 开始上传，显示加载状态
  isDialogLoading.value = true; 
  const token = getToken();
  // 1. 创建一个 FormData 对象来构建请求体
  const formData = new FormData();
  formData.append('token', token);
  formData.append('title', '用户头像')
  formData.append('content', file);
  // 4. 执行您自己的 fetch 请求
  fetch('/admin/uploadImage', {
    method: 'POST',
    body: formData,
  })
  .then(response => response.json())
  .then(result => {
    if(result.statusCode === 200){
      formImgUrl.value = result.data;
    }
    alerts('提示', result.message);
  })
  .finally(() => {
    isDialogLoading.value = false;
  })
};

// 获取运动员详情 (用于修改时预填表单)
const fetchAthleteDetail = async (id) => {
  isDialogLoading.value = true;
  fetch(`/player/getExcellenceDetail?id=${id}`)
  .then(response => response.json())
  .then(result => {
    if (result.statusCode === 200) {
      const detail = result.data;
      formName.value = detail.name;
      formAge.value = parseInt(detail.age, 10);
      formGrade.value = detail.grade;
      formIntroduction.value = detail.introduction;
      formImgUrl.value = detail.imgUrl;
    } else {
      alerts('错误', result.message);
    }
  })
  .finally(() => {
    isDialogLoading.value = false;
  });
};

// 新增运动员
const addExcellence = async () => {
  const token = getToken();
  if (!token){
    return false;
  }
  const response = await fetch('/admin/addExcellence', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: token,
      name: formName.value,
      age: formAge.value,
      grade: formGrade.value,
      introduction: formIntroduction.value,
      imgUrl: formImgUrl.value,
    }),
  });
  const result = await response.json();
  if(result.statusCode === 200){
    fetchAthletesList(); // 成功后刷新列表
    return true;
  }
  alerts("错误", result.message);
  return false;
};

// 删除运动员
const deleteExcellence = async (id) => {
  const token = getToken();
  if (!token){
    return false;
  }
  const response = await fetch('/admin/deleteExcellence', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: token,
      id: id,
    }),
  });
  const result = await response.json();
  if(result.statusCode === 200){
    fetchAthletesList();
    return true;
  }
  alerts("错误", result.message);
  return false;
};

// --- 5. 页面交互函数 ---

// 重置表单
const resetForm = () => {
  formName.value = '';
  formAge.value = null;
  formGrade.value = '';
  formIntroduction.value = '';
  formImgUrl.value = '';
  editingAthleteId.value = null;
};

// 需求 1 & 2: 打开新增弹窗
const openAddDialog = () => {
  resetForm();
  dialogMode.value = 'add';
  isDialogVisible.value = true;
};

// 需求 4: 打开修改弹窗
const openEditDialog = (athlete) => {
  resetForm();
  dialogMode.value = 'edit';
  editingAthleteId.value = athlete.id;
  isDialogVisible.value = true;
  fetchAthleteDetail(athlete.id);
};

// 处理弹窗提交
const handleSubmit = async () => {
  const proceedToSubmit = async () => {
    isDialogLoading.value = true;
    let success = false;
    if (dialogMode.value === 'add') {
      success = await addExcellence();
    } else if (dialogMode.value === 'edit') {
      // 需求 4: 执行“先删除后新增”的修改逻辑
      const deleteSuccess = await deleteExcellence(editingAthleteId.value);
      if (deleteSuccess) {
        success = await addExcellence();
      }
    }
    if (success) {
      isDialogVisible.value = false;
      fetchAthletesList(); // 成功后刷新列表
    }
  }

  if (formImgUrl.value === '') {
    if(!await awaitAlert(
      '确认操作', 
      '您还未为运动员上传头像，确定要继续提交吗？', 
      {
        accept: '继续提交（无头像）',
        reject: '返回上传',
        icon: 'pi pi-exclamation-triangle',
      })){
      return;
    }
  }
  proceedToSubmit();
};

// 处理删除按钮点击
const handleDelete = async (athlete) => {
  const confirm_del = await awaitAlert(
    '确认删除', 
    `您确定要删除运动员 "${athlete.name}" 吗？`, 
    {
      acceet: '确认删除',
      reject: '取消',
      icon: 'pi pi-exclamation-triangle'
    });
  if(!confirm_del){
    return; // 用户选择取消，退出函数
  }
  const success = await deleteExcellence(athlete.id);
  if (success) {
    fetchAthletesList(); // 成功后刷新列表
  }
};

// --- 6. 生命周期钩子 ---
onMounted(fetchAthletesList);

</script>

<template>
  <div class="p-4 surface-card shadow-2 border-round">
    
    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold m-0">优秀运动员管理</h1>
      <Button label="新增运动员" icon="pi pi-plus" @click="openAddDialog" />
    </div>

    <Divider />

    <div>
      <div v-if="isLoading">
        <DataTable :value="[{}, {}, {}]" class="p-datatable-striped">
          <Column header="姓名"> <template #body><Skeleton /></template> </Column>
          <Column header="操作"> <template #body><Skeleton height="2rem" width="8rem" /></template> </Column>
        </DataTable>
      </div>

      <div v-else-if="error">
        <Message severity="error" :closable="false">{{ error }}</Message>
      </div>
      
      <DataTable v-else :value="athletesList" responsiveLayout="scroll">
        <Column field="name" header="姓名"></Column>
        <Column header="操作" style="width: 10rem">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button icon="pi pi-pencil" class="p-button-text" @click="openEditDialog(slotProps.data)" />
              <Button icon="pi pi-trash" class="p-button-text p-button-danger" @click="handleDelete(slotProps.data)" />
            </div>
          </template>
        </Column>
      </DataTable>

    </div>

    <Dialog 
      v-model:visible="isDialogVisible" 
      modal 
      :header="dialogMode === 'add' ? '新增优秀运动员' : '修改运动员信息'" 
      :style="{ width: '90vw', maxWidth: '800px' }"
      :dismissableMask="true"
    >
      <div v-if="isDialogLoading" class="flex justify-content-center p-5">
        <ProgressSpinner />
      </div>
      
      <div v-else class="grid formgrid p-fluid">
        <div class="col-12 md:col-4 flex flex-column align-items-center">
          <Avatar 
            :image="formImgUrl" 
            :label="formImgUrl ? '' : '头像'"
            shape="square" 
            class="mb-3 rounded-avatar keep-width" 
            style="width: 150px; height: 150px; font-size: 4rem;" 
          />

          <FileUpload 
            mode="basic" 
            name="avatar"
            accept="image/*" 
            :maxFileSize="1000000" 
            :customUpload="true" 
            @uploader="handleAvatarUpload" 
            chooseLabel="上传头像" 
            auto
          />
          <small class="text-color-secondary mt-2">支持图片格式, 小于1MB</small>
        </div>
        <div class="col-12 md:col-8">
          <div class="field">
            <label for="name">姓名 </label>
            <InputText id="name"  class="w-full" v-model="formName" />
          </div>
          <div class="field">
            <label for="age">年龄 </label>
            <InputNumber id="age" class="w-full" v-model="formAge" />
          </div>
          <div class="field">
            <label for="grade">年段 </label>
            <InputText id="grade" class="w-full" v-model="formGrade" />
          </div>
          <div class="field">
            <label for="introduction">介绍</label>
            <Textarea 
              id="introduction" 
              v-model="formIntroduction" 
              rows="5"
              class="w-full resize-none" autoResize/>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="取消" icon="pi pi-times" @click="isDialogVisible = false" class="p-button-text" />
        <Button :label="dialogMode === 'add' ? '确认新增' : '确认修改'" icon="pi pi-check" @click="handleSubmit" :loading="isDialogLoading" :disabled="!allRequiredField" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
/* 响应式布局主要由 PrimeVue 组件和 PrimeFlex 完成，
   只需少量样式微调
*/
:deep(.p-datatable-tbody > tr > td) {
  /* 优化表格单元格的垂直对齐 */
  vertical-align: middle;
}

/* 添加圆角样式给Avatar */
:deep(.rounded-avatar > img) {
  border-radius: 12px;
}

/* 保持宽度固定，高度按原图比例 */
:deep(.keep-width) {
  height: auto !important;
}

:deep(.keep-width > img) {
  height: auto !important;
  object-fit: contain !important;
  max-height: 200px; /* 设置最大高度避免过高 */
}
</style>