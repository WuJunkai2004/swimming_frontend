<script setup>
import { ref, onMounted, computed } from "vue";
import { useToken } from "#/useToken";
import { useAlert } from "#/useAlert";

// --- 1. 初始化 ---
const { getToken } = useToken();
const { alerts, awaitAlert } = useAlert();

// --- 2. 状态定义 ---
// 列表状态
const gamesList = ref([]);
const isLoading = ref(true);
const error = ref(null);

// 编辑/创建 弹窗状态
const isEditDialogVisible = ref(false);
const isSaving = ref(false);
const editForm = ref({
  competitionId: "",
  gameName: "",
  startTime: null,
  endTime: null,
  status: "REGISTRATION_IN",
});
const isNew = ref(true);

const statusOptions = [
  { label: "报名中", value: "REGISTRATION_IN" },
  { label: "未开始", value: "COMPETITION_NOT_START" },
  { label: "进行中", value: "COMPETITION_IN_PROGRESS" },
  { label: "已结束", value: "COMPETITION_FINISHED" },
];

const statusMap = {
  REGISTRATION_IN: { label: "报名中", severity: "info" },
  COMPETITION_NOT_START: { label: "未开始", severity: "warn" },
  COMPETITION_IN_PROGRESS: { label: "进行中", severity: "success" },
  COMPETITION_FINISHED: { label: "已结束", severity: "secondary" },
};

// --- 3. API 调用与数据处理 ---

// 获取趣味赛列表
const fetchGamesList = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetch("/admin/fun/getGameList", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: getToken(),
        page: 1,
        size: 100, // 假设趣味赛数量不多，一次性加载
      }),
    });
    const result = await response.json();
    if (result.statusCode === 200) {
      // 这里的 result.data 通常包含 list 和 total
      gamesList.value = result.data?.list || result.data || [];
    } else {
      error.value = result.message || "无法加载趣味赛列表";
    }
  } catch (e) {
    error.value = "网络错误，请稍后重试";
  } finally {
    isLoading.value = false;
  }
};

// 打开创建弹窗
const openCreateDialog = () => {
  isNew.value = true;
  editForm.value = {
    competitionId: "",
    gameName: "",
    startTime: "",
    endTime: "",
    status: "REGISTRATION_IN",
  };
  isEditDialogVisible.value = true;
};

// 打开编辑弹窗
const openEditDialog = (game) => {
  isNew.value = false;
  editForm.value = { ...game };
  isEditDialogVisible.value = true;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date
    .toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-");
};

// 保存活动 (创建或更新)
const saveGame = async () => {
  if (
    !editForm.value.gameName ||
    !editForm.value.startTime ||
    !editForm.value.endTime
  ) {
    alerts("警告", "请填写完整信息");
    return;
  }

  if (!/\d\d\d\d-\d\d-\d\d/.test(editForm.value.startTime)) {
    editForm.value.startTime = formatDate(editForm.value.startTime);
  }
  if (!/\d\d\d\d-\d\d-\d\d/.test(editForm.value.endTime)) {
    editForm.value.endTime = formatDate(editForm.value.endTime);
  }

  isSaving.value = true;
  const apiPath = isNew.value
    ? "/admin/fun/createGame"
    : "/admin/fun/updateGame";

  fetch(apiPath, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: getToken(),
      ...editForm.value,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.statusCode === 200) {
        alerts("成功", isNew.value ? "创建成功" : "更新成功");
        isEditDialogVisible.value = false;
        fetchGamesList();
      } else {
        alerts("错误", data.message || "保存失败");
      }
    })
    .catch((e) => {
      alerts("错误", "网络异常，请稍后重试");
    })
    .finally(() => {
      isSaving.value = false;
    });
};

// 删除活动
const deleteGame = async (game) => {
  const confirm = await awaitAlert(
    "确认",
    `确定要删除趣味赛“${game.gameName}”吗？此操作不可逆。`,
    {
      accept: "确认删除",
      reject: "取消",
      icon: "pi pi-exclamation-triangle",
    },
  );

  if (!confirm) {return};

  fetch("/admin/fun/deleteGame", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: getToken(),
        competitionId: game.competitionId,
      }),
  }).then(res => res.json()).then(data => {
      if (data.statusCode === 200) {
        alerts("成功", "删除成功");
        fetchGamesList();
      } else {
        alerts("错误", data.message || "删除失败");
      }
    }).catch(e => {
      alerts("错误", "网络异常，请稍后重试");
    });
};

// --- 4. 导航跳转 ---
const jumpFunEventsManage = (game) => {
  window.location.href = `${window.location.href.split("#")[0]}#/manage-fun-events?game=${game.competitionId}`;
};

const jumpFunTeamsManage = (game) => {
  window.location.href = `${window.location.href.split("#")[0]}#/manage-fun-teams?game=${game.competitionId}`;
};

const jumpVolsManage = (game) => {
  window.location.href = `${window.location.href.split("#")[0]}#/manage-vols?game=${game.competitionId}&isFun=true`;
};

const jumpFunScheduleManage = (game) => {
  window.location.href = `${window.location.href.split("#")[0]}#/manage-fun-schedule?game=${game.competitionId}`;
};

onMounted(fetchGamesList);
</script>

<template>
  <div class="p-4 surface-card shadow-2 border-round">
    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold m-0">趣味赛管理</h1>
      <Button label="创建趣味赛" icon="pi pi-plus" @click="openCreateDialog" />
    </div>

    <Divider />

    <div v-if="isLoading">
      <DataTable :value="[{}, {}, {}]" class="p-datatable-striped">
        <Column header="活动名称"
          ><template #body><Skeleton /></template
        ></Column>
        <Column header="状态"
          ><template #body><Skeleton /></template
        ></Column>
        <Column header="操作"
          ><template #body><Skeleton height="2rem" width="10rem" /></template
        ></Column>
      </DataTable>
    </div>

    <div v-else-if="error">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <DataTable v-else :value="gamesList" responsiveLayout="scroll" stripedRows>
      <Column field="gameName" header="活动名称" sortable></Column>
      <Column field="startTime" header="开始时间" sortable>
        <template #body="slotProps">
          {{ slotProps.data.startTime }}
        </template>
      </Column>
      <Column field="endTime" header="结束时间" sortable>
        <template #body="slotProps">
          {{ slotProps.data.endTime }}
        </template>
      </Column>
      <Column field="status" header="状态">
        <template #body="slotProps">
          <Tag
            :value="statusMap[slotProps.data.status]?.label"
            :severity="statusMap[slotProps.data.status]?.severity"
          />
        </template>
      </Column>
      <Column header="操作" style="min-width: 25rem">
        <template #body="slotProps">
          <div class="flex gap-2 flex-wrap">
            <Button
              icon="pi pi-pencil"
              class="p-button-text p-button-sm"
              v-tooltip="'编辑活动'"
              @click="openEditDialog(slotProps.data)"
            />
            <Button
              label="项目"
              class="p-button-outlined p-button-sm"
              @click="jumpFunEventsManage(slotProps.data)"
            />
            <Button
              label="队伍"
              class="p-button-outlined p-button-sm p-button-success"
              @click="jumpFunTeamsManage(slotProps.data)"
            />
            <Button
              label="志愿者"
              class="p-button-outlined p-button-sm p-button-info"
              @click="jumpVolsManage(slotProps.data)"
            />
            <Button
              label="分道/成绩"
              class="p-button-outlined p-button-sm p-button-warning"
              @click="jumpFunScheduleManage(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-text p-button-danger p-button-sm"
              v-tooltip="'删除活动'"
              @click="deleteGame(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- 创建/编辑弹窗 -->
    <Dialog
      v-model:visible="isEditDialogVisible"
      modal
      :header="isNew ? '创建趣味赛' : '编辑趣味赛'"
      :style="{ width: '450px' }"
    >
      <div class="flex flex-column gap-3 mt-2">
        <div class="flex flex-column gap-1">
          <label for="gameName" class="font-bold">活动名称</label>
          <InputText
            id="gameName"
            v-model="editForm.gameName"
            placeholder="请输入活动名称"
          />
        </div>
        <div class="flex flex-column gap-1">
          <label for="startTime" class="font-bold">开始时间</label>
          <DatePicker
            id="startTime"
            v-model="editForm.startTime"
            dateFormat="yy-mm-dd"
            showIcon
            fluid
          />
        </div>
        <div class="flex flex-column gap-1">
          <label for="endTime" class="font-bold">结束时间</label>
          <DatePicker
            id="endTime"
            v-model="editForm.endTime"
            dateFormat="yy-mm-dd"
            showIcon
            fluid
          />
        </div>
        <div class="flex flex-column gap-1">
          <label for="status" class="font-bold">当前状态</label>
          <Select
            id="status"
            v-model="editForm.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            fluid
          />
        </div>
      </div>
      <template #footer>
        <Button
          label="取消"
          icon="pi pi-times"
          class="p-button-text"
          @click="isEditDialogVisible = false"
        />
        <Button
          label="保存"
          icon="pi pi-check"
          :loading="isSaving"
          @click="saveGame"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
:deep(.p-tag) {
  font-size: 0.8rem;
}
</style>
