<script setup>
import { ref, onMounted, computed } from "vue";
import { useToken } from "#/useToken";
import { useAlert } from "#/useAlert";
import { useCollegeEnum } from "#/collegeMapping";
import { useFoulEnum } from "#/foulMapping";

// --- 1. 初始化 ---
const { getToken } = useToken();
const { alerts, awaitAlert } = useAlert();
const { collegeMap } = useCollegeEnum();
const foulState = useFoulEnum();

// --- 2. 状态定义 ---
const gameId = ref("");
const eventId = ref("");
const eventsOptions = ref([]);

const resultsList = ref([]); // 用于成绩管理

const isLoading = ref(false);
const error = ref(null);

// 成绩编辑弹窗
const isEditResultVisible = ref(false);
const isSavingResult = ref(false);
const editResultForm = ref({
  resultId: null,
  teamName: "",
  rawScore: "",
  isValid: true,
  invalidType: null,
  invalidReason: "",
});

const foulOptions = computed(() => {
  return Object.entries(foulState.foulMap).map(([value, label]) => ({
    label,
    value,
  }));
});

// --- 3. API 调用 ---

// 获取项目列表
const fetchEventsOptions = () => {
  if (!gameId.value) return;
  isLoading.value = true;

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
        eventsOptions.value = data.data || [];
        if (eventsOptions.value.length > 0) {
          eventId.value = eventsOptions.value[0].eventId;
          fetchAllData();
        } else {
          error.value = "当前比赛没有可用的项目";
          isLoading.value = false;
        }
      } else {
        error.value = data.message || "无法加载项目列表";
        isLoading.value = false;
      }
    })
    .catch((e) => {
      error.value = "网络错误，请稍后重试";
      isLoading.value = false;
    });
};

// 获取成绩数据
const fetchAllData = () => {
  if (!eventId.value) return;
  isLoading.value = true;
  error.value = null;

  fetch("/admin/fun/getResults", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: getToken(), eventId: eventId.value }),
  })
    .then((res) => res.json())
    .then((resultsData) => {
      if (resultsData.statusCode === 200) {
        resultsList.value = resultsData.data || [];
      } else {
        alerts("错误", "获取成绩列表失败: " + resultsData.message);
      }
    })
    .catch((e) => {
      error.value = "加载数据失败，请检查网络";
    })
    .finally(() => {
      isLoading.value = false;
    });
};

// 打开编辑成绩弹窗
const openEditResultDialog = (result) => {
  editResultForm.value = {
    resultId: result.resultId,
    teamName: collegeMap[result.college] || result.college,
    rawScore: result.rawScore,
    isValid: result.isValid,
    invalidType: result.invalidType,
    invalidReason: result.invalidReason,
  };
  isEditResultVisible.value = true;
};

// 保存成绩
const saveResult = () => {
  isSavingResult.value = true;
  fetch("/admin/fun/updateResult", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: getToken(),
      ...editResultForm.value,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.statusCode === 200) {
        alerts("成功", "成绩更新成功");
        isEditResultVisible.value = false;
        fetchAllData();
      } else {
        alerts("错误", data.message || "更新失败");
      }
    })
    .catch((e) => {
      alerts("错误", "网络异常");
    })
    .finally(() => {
      isSavingResult.value = false;
    });
};

onMounted(() => {
  const hash = window.location.hash;
  const queryString = hash.includes("?") ? hash.split("?")[1] : "";
  const urlParams = new URLSearchParams(queryString);
  gameId.value = urlParams.get("game");

  if (!gameId.value) {
    alerts("错误", "缺少必要参数");
    return;
  }
  fetchEventsOptions();
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
        <h1 class="text-3xl font-bold m-0">趣味赛成绩管理</h1>
      </div>
      <div class="flex align-items-center gap-3">
        <Select
          v-model="eventId"
          :options="eventsOptions"
          optionLabel="eventName"
          optionValue="eventId"
          placeholder="选择项目"
          class="w-15rem"
          @change="fetchAllData"
        />
      </div>
    </div>

    <Divider />

    <div v-if="error">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <div class="flex flex-column gap-3">
      <DataTable
        :value="resultsList"
        :loading="isLoading"
        stripedRows
        responsiveLayout="scroll"
      >
        <Column field="college" header="学院/队伍">
          <template #body="slotProps">
            {{ collegeMap[slotProps.data.college] || slotProps.data.college }}
          </template>
        </Column>
        <Column field="round" header="轮次" style="width: 80px"></Column>
        <Column field="road" header="道次" style="width: 80px"></Column>
        <Column field="rawScore" header="成绩">
          <template #body="slotProps">
            <span :class="{ 'text-red-500': !slotProps.data.isValid }">
              {{ slotProps.data.rawScore || "--" }}
            </span>
          </template>
        </Column>
        <Column field="isValid" header="状态">
          <template #body="slotProps">
            <Tag
              v-if="slotProps.data.isValid"
              value="有效"
              severity="success"
            />
            <Tag v-else value="犯规" severity="danger" />
          </template>
        </Column>
        <Column header="操作" style="width: 100px">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              class="p-button-text"
              @click="openEditResultDialog(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- 编辑成绩弹窗 -->
    <Dialog
      v-model:visible="isEditResultVisible"
      modal
      :header="'修改成绩 - ' + editResultForm.teamName"
      :style="{ width: '450px' }"
    >
      <div class="flex flex-column gap-3 mt-2">
        <div class="flex flex-column gap-1">
          <label class="font-bold">原始成绩</label>
          <InputText
            v-model="editResultForm.rawScore"
            placeholder="输入成绩，如 01:23.45 或 10"
          />
        </div>

        <div class="flex align-items-center gap-2">
          <Checkbox
            v-model="editResultForm.isValid"
            :binary="true"
            inputId="isValid"
          />
          <label for="isValid" class="font-bold">成绩有效</label>
        </div>

        <div
          v-if="!editResultForm.isValid"
          class="flex flex-column gap-3 animate-fadein"
        >
          <div class="flex flex-column gap-1">
            <label class="font-bold text-red-500">犯规类型</label>
            <Select
              v-model="editResultForm.invalidType"
              :options="foulOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="选择犯规原因"
              fluid
            />
          </div>
          <div class="flex flex-column gap-1">
            <label class="font-bold">详细备注</label>
            <Textarea
              v-model="editResultForm.invalidReason"
              rows="2"
              placeholder="可选备注信息"
              autoResize
            />
          </div>
        </div>
      </div>
      <template #footer>
        <Button
          label="取消"
          icon="pi pi-times"
          class="p-button-text"
          @click="isEditResultVisible = false"
        />
        <Button
          label="确认更新"
          icon="pi pi-check"
          :loading="isSavingResult"
          @click="saveResult"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.animate-fadein {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
