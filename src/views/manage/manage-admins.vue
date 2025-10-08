<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToken } from '@/composables/useToken';
import { useAlert } from '@/composables/useAlert';
import { SHA256 } from '@/composables/useHash';

const { getToken } = useToken(); // 获取 Token 的函数
const { alerts, awaitAlert } = useAlert(); // 弹窗提示服务

const adminsList = ref([]);
const isLoading = ref(true);
const error = ref(null);

// 弹窗状态
const isDialogVisible = ref(false);
const dialogMode = ref('add'); // 'add' 或 'edit'
const isDialogLoading = ref(false); // 用于弹窗内部的操作（获取详情、提交）
const editingAdminId = ref(null); // 存储正在编辑的管理员ID

// 表单数据状态
const formUsername = ref('');
const formPassword = ref('');

const passwordStrength = computed(() => {
  let score = 0;
  const pw = formPassword.value;
  if (!pw){
    return 0;
  }
  if (/[a-z]/.test(pw)){
    score++;
  }
  if (/[A-Z]/.test(pw)){
    score++;
  }
  if (/[0-9]/.test(pw)){
    score++;
  }
  if (/[^a-zA-Z0-9]/.test(pw)){
    score++;
  }
  return score;
});

// 【新增】一个计算属性，将强度分数转换为对应的标签文字和颜色
const strengthLabel = computed(() => {
  const score = passwordStrength.value;
  switch (score) {
    case 1:
      return { text: '弱', colorClass: 'text-red-500' };
    case 2:
      return { text: '中', colorClass: 'text-yellow-500' };
    case 3:
      return { text: '强', colorClass: 'text-green-500' };
    case 4:
      return { text: '极强', colorClass: 'text-blue-500' };
    default:
      if (formPassword.value && formPassword.value.length > 0) {
        return { text: '太短', colorClass: 'text-gray-500' };
      }
      return { text: '', colorClass: '' };
  }
});

const allRequiredField = computed(() => {
  return formUsername.value && formPassword.value && 
         formPassword.value.length >= 8 && passwordStrength.value >= 2;
});

// --- 4. API 调用逻辑 ---

// 获取管理员列表
const fetchAdminsList = async () => {
  isLoading.value = true;
  error.value = null;
  fetch('/admin/getAdminList', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: getToken(),
    })
  })
  .then(response => response.json())
  .then(data => {
    if(data.statusCode === 200){
      adminsList.value = data.data;
    } else {
      error.value = data.message;
    }
  })
  .finally(() => {
    isLoading.value = false;
  })
};

// 新增管理员
const addAdmin = async () => {
  const pw_sha = await SHA256(formPassword.value);
  const response = await fetch('/admin/addAdmin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: getToken(),
      adminName: formUsername.value,
      password: pw_sha,
    }),
  });
  const result = await response.json();
  if(result.statusCode === 200){
    fetchAdminsList(); // 成功后刷新列表
    return true;
  }
  alerts("错误", result.message);
  return false;
};

// 更新管理员信息
const updateAdmin = async () => {
  const pw_sha = await SHA256(formPassword.value);
  const response = await fetch('/admin/updateAdmin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: getToken(),
      id: editingAdminId.value,
      adminName: formUsername.value,
      password: pw_sha,
    }),
  });
  const result = await response.json();
  if(result.statusCode === 200){
    fetchAdminsList(); // 成功后刷新列表
    return true;
  }
  alerts("错误", result.message);
  return false;
}

// 删除管理员
const deleteAdmin = async (id) => {
  const response = await fetch('/admin/deleteAdmin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: getToken(),
      id: id,
    }),
  });
  const result = await response.json();
  if(result.statusCode === 200){
    fetchAdminsList();
    return true;
  }
  alerts("错误", result.message);
  return false;
};

// --- 5. 页面交互函数 ---

// 重置表单
const resetForm = () => {
  formUsername.value = ''
  formPassword.value = ''
  editingAdminId.value = null;
};

// 需求 1 & 2: 打开新增弹窗
const openAddDialog = () => {
  resetForm();
  dialogMode.value = 'add';
  isDialogVisible.value = true;
};

// 需求 4: 打开修改弹窗
const openEditDialog = (admin) => {
  resetForm();
  dialogMode.value = 'edit';
  editingAdminId.value = admin.id;
  formUsername.value = admin.userName;
  // 密码不预填，需用户重新输入
  isDialogVisible.value = true;
};

// 处理弹窗提交
const handleSubmit = async () => {
  isDialogLoading.value = true;
  let success = false;
  if (dialogMode.value === 'add') {
    success = await addAdmin();
  } else if (dialogMode.value === 'edit') {
    success = await updateAdmin();
  }
  if (success) {
    isDialogVisible.value = false;
    fetchAdminsList(); // 成功后刷新列表
  }
};

// 处理删除按钮点击
const handleDelete = async (admin) => {
  const confirm_del = await awaitAlert(
    '确认删除', 
    `您确定要删除管理员 "${admin.userName}" 吗？此操作不可逆！`, 
    {
      accept: '确认删除',
      reject: '取消',
      icon: 'pi pi-exclamation-triangle'
    });
  if(!confirm_del){
    return; // 用户选择取消删除
  }
  const success = await deleteAdmin(admin.id);
  if (success) {
    fetchAdminsList(); // 成功后刷新列表
  }
};

// --- 6. 生命周期钩子 ---
onMounted(fetchAdminsList);

</script>

<template>
  <div class="p-4 surface-card shadow-2 border-round">

    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold m-0">管理员管理</h1>
      <Button label="新增管理员" icon="pi pi-plus" @click="openAddDialog" />
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

      <DataTable v-else :value="adminsList" responsiveLayout="scroll">
        <Column field="userName" header="姓名"></Column>
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
      :header="dialogMode === 'add' ? '新增管理员' : '修改管理员信息'" 
      :style="{ width: '90vw', maxWidth: '800px' }"
      :dismissableMask="true"
    >
      <div v-if="isDialogLoading" class="flex justify-content-center p-5">
        <ProgressSpinner />
      </div>

      <div v-else class="grid formgrid p-fluid">
        <div class="col-12 md:col-8">
          <div class="field">
            <label for="username">管理员用户名 </label>
            <InputText 
              id="username" 
              class="w-full" 
              v-model="formUsername" 
            />
          </div>
          <div class="field">
            <label for="password">管理员新密码 </label>
            <Password 
              id="password" 
              class="w-full" 
              v-model="formPassword" 
              :feedback="false"
              toggleMask
            />

            <div class="flex align-items-center gap-3 mt-3">
              <MeterGroup :value="[
                { label: '弱', color: '#ff5252', value: passwordStrength >= 1 ? 25 : 0 },
                { label: '中', color: '#ffc107', value: passwordStrength >= 2 ? 25 : 0 },
                { label: '强', color: '#4caf50', value: passwordStrength >= 3 ? 25 : 0 },
                { label: '极强', color: '#2196f3', value: passwordStrength >= 4 ? 25 : 0 }
              ]" class="flex-1">
              </MeterGroup>
              <span 
                :class="strengthLabel.colorClass" 
                class="font-bold w-5rem text-right"
              >
                {{ strengthLabel.text }}
              </span>
            </div>

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

/* 针对 Password 组件的样式微调，使其与 InputText 高度一致 */
:deep(.p-password-input) {
  width: 100%;
}

/* 针对 MeterGroup 组件的样式微调，删除示例文字 */
:deep(.p-metergroup-label) {
  display: none !important;
}

:deep(.p-metergroup-label-list) {
  display: none !important;
}
</style>