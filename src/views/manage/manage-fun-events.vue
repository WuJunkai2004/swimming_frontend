<script setup>
import { ref, onMounted } from "vue";
import { useToken } from "#/useToken";
import { useAlert } from "#/useAlert";

// --- 1. 初始化 ---
const { getToken } = useToken();
const { alerts, awaitAlert } = useAlert();

// --- 2. 状态定义 ---
const gameId = ref("");
const eventsList = ref([]);
const isLoading = ref(true);
const error = ref(null);

// 编辑/创建 弹窗状态
const isEditDialogVisible = ref(false);
const isSaving = ref(false);
const isNew = ref(true);
const editForm = ref({
  eventId: null,
  eventName: "",
  rules: "",
  unit: "",
  sortOrder: 0,
  sortDirection: 0, // 0: 升序 (小值优先), 1: 降序 (大值优先)
});

const directionOptions = [
  { label: "数值越小排名越靠前 (如时间 - 升序)", value: 0 },
  { label: "数值越大排名越靠前 (如分数 - 降序)", value: 1 },
];


// --- 3. API 调用与数据处理 ---

// 获取项目列表
const fetchEventsList = () => {
  if (!gameId.value) return;
  isLoading.value = true;
  error.value = null;

  fetch("/admin/fun/getEventList", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: getToken(),
      competitionId: gameId.value,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.statusCode === 200) {
        eventsList.value = data.data || [];
      } else {
        error.value = data.message || "无法加载项目列表";
      }
    })
    .catch((e) => {
      error.value = "网络错误，请稍后重试";
    })
    .finally(() => {
      isLoading.value = false;
    });
};

// 打开创建弹窗
const openCreateDialog = () => {
  isNew.value = true;
  editForm.value = {
    eventId: null,
    eventName: "",
    rules: "",
    unit: "",
    sortDirection: 0,
  };
  isEditDialogVisible.value = true;
};

// 打开编辑弹窗
const openEditDialog = (event) => {
  isNew.value = false;
  editForm.value = { ...event };
  isEditDialogVisible.value = true;
};

// 保存项目 (创建或更新)
const saveEvent = () => {
  if (
    !editForm.value.eventName ||
    !editForm.value.unit
  ) {
    alerts("警告", "请填写完整信息");
    return;
  }

  isSaving.value = true;
  const apiPath = isNew.value
    ? "/admin/fun/createEvent"
    : "/admin/fun/updateEvent";

  fetch(apiPath, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: getToken(),
      competitionId: gameId.value,
      ...editForm.value,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.statusCode === 200) {
        alerts("成功", isNew.value ? "创建成功" : "更新成功");
        isEditDialogVisible.value = false;
        fetchEventsList();
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

// 删除项目
const deleteEvent = (event) => {
  awaitAlert("确认", `确定要删除项目“${event.eventName}”吗？此操作不可逆。`, {
    accept: "确认删除",
    reject: "取消",
    icon: "pi pi-exclamation-triangle",
  }).then((confirm) => {
    if (!confirm) return;

    fetch("/admin/fun/deleteEvent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: getToken(),
        eventId: event.eventId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.statusCode === 200) {
          alerts("成功", "删除成功");
          fetchEventsList();
        } else {
          alerts("错误", data.message || "删除失败");
        }
      })
      .catch((e) => {
        alerts("错误", "网络异常，请稍后重试");
      });
  });
};

onMounted(() => {
  const hash = window.location.hash;
  const queryString = hash.includes("?") ? hash.split("?")[1] : "";
  const urlParams = new URLSearchParams(queryString);
  gameId.value = urlParams.get("game");

  if (!gameId.value) {
    alerts("错误", "缺少比赛ID参数");
    return;
  }
  fetchEventsList();
});
</script>

<template>
  <div class="p-4 surface-card shadow-2 border-round">
    <div class="flex justify-content-between align-items-center mb-4">
      <div class="flex align-items-center gap-3">
        <Button
          icon="pi pi-arrow-left"
          class="p-button-text p-button-rounded"
          @click="$router.back()"
        />
        <h1 class="text-3xl font-bold m-0">项目管理</h1>
      </div>
      <Button label="添加项目" icon="pi pi-plus" @click="openCreateDialog" />
    </div>

    <Divider />

    <div v-if="isLoading">
      <DataTable :value="[{}, {}, {}]" class="p-datatable-striped">
        <Column header="项目名称"><template #body><Skeleton /></template></Column>
        <Column header="单位"><template #body><Skeleton /></template></Column>
        <Column header="排序"><template #body><Skeleton /></template></Column>
        <Column header="操作"><template #body><Skeleton height="2rem" width="6rem" /></template></Column>
      </DataTable>
    </div>

    <div v-else-if="error">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <DataTable v-else :value="eventsList" responsiveLayout="scroll" stripedRows>
      <Column field="eventName" header="项目名称" sortable></Column>
      <Column field="unit" header="单位" style="width: 100px"></Column>
      <Column field="sortDirection" header="排名规则">
        <template #body="slotProps">
          <Tag
            :value="slotProps.data.sortDirection === 0 ? '数值小优先' : '数值大优先'"
            :severity="slotProps.data.sortDirection === 0 ? 'info' : 'success'"
          />
        </template>
      </Column>
      <Column header="操作" style="width: 150px">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              class="p-button-text p-button-sm"
              v-tooltip="'编辑项目'"
              @click="openEditDialog(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-text p-button-danger p-button-sm"
              v-tooltip="'删除项目'"
              @click="deleteEvent(slotProps.data)"
            />
          </div>
        </template>
      </Column>
      <template #expansion="slotProps">
        <div class="p-3">
          <h5>规则说明</h5>
          <p>{{ slotProps.data.rules || '暂无规则说明' }}</p>
        </div>
      </template>
    </DataTable>

    <!-- 创建/编辑弹窗 -->
    <Dialog
      v-model:visible="isEditDialogVisible"
      modal
      :header="isNew ? '添加项目' : '编辑项目'"
      :style="{ width: '500px' }"
    >
      <div class="flex flex-column gap-3 mt-2">
        <div class="flex flex-column gap-1">
          <label for="eventName" class="font-bold">项目名称</label>
          <InputText
            id="eventName"
            v-model="editForm.eventName"
            placeholder="例如：100米游泳、团体接力"
          />
        </div>
        <div class="flex flex-column gap-1">
          <label for="unit" class="font-bold">计量单位</label>
          <InputText id="unit" v-model="editForm.unit" placeholder="例如：秒、分、个" />
        </div>
        <div class="flex flex-column gap-1">
          <label for="sortDirection" class="font-bold">排名规则</label>
          <Select
            id="sortDirection"
            v-model="editForm.sortDirection"
            :options="directionOptions"
            optionLabel="label"
            optionValue="value"
            fluid
          />
        </div>
        <div class="flex flex-column gap-1">
          <label for="rules" class="font-bold">规则/描述</label>
          <Textarea id="rules" v-model="editForm.rules" rows="3" autoResize />
        </div>
      </div>
      <template #footer>
        <Button
          label="取消"
          icon="pi pi-times"
          class="p-button-text"
          @click="isEditDialogVisible = false"
        />
        <Button label="保存" icon="pi pi-check" :loading="isSaving" @click="saveEvent" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
:deep(.p-tag) {
  font-size: 0.8rem;
}
</style>
