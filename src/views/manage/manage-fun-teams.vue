<script setup>
import { ref, onMounted } from "vue";
import { useToken } from "#/useToken";
import { useAlert } from "#/useAlert";
import { useCollegeEnum } from "@/utils/collegeMapping";

// --- 1. 初始化 ---
const { getToken } = useToken();
const { alerts, awaitAlert } = useAlert();
const { collegeMap, collegeEnum } = useCollegeEnum();

// --- 2. 状态定义 ---
const gameId = ref("");
const eventId = ref("");
const teamsList = ref([]);
const eventsOptions = ref([]); // 项目选项列表
const isLoading = ref(true);
const error = ref(null);

// 编辑/创建 弹窗状态
const isEditDialogVisible = ref(false);
const isSaving = ref(false);
const isNew = ref(true);
const editForm = ref({
  teamId: null,
  college: "",
  members: [], // [{ name, studentNumber, college }]
});

// 学院选项
const collegeOptions = collegeEnum.map((key) => ({
  label: collegeMap[key],
  value: key,
}));

// --- 3. API 调用与数据处理 ---

// 获取项目列表（用于下拉选择）
const fetchEventsOptions = () => {
  if (!gameId.value) return;

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
          fetchTeamsList();
        } else {
          error.value = "当前比赛没有可用的项目";
        }
      }
    })
    .catch((e) => {
      console.error("加载项目列表失败", e);
    });
};

// 获取队伍列表
const fetchTeamsList = () => {
  if (!eventId.value) return;
  isLoading.value = true;
  error.value = null;

  fetch("/admin/fun/getTeamList", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: getToken(),
      eventId: eventId.value,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.statusCode === 200) {
        teamsList.value = data.data || [];
      } else {
        error.value = data.message || "无法加载队伍列表";
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
    teamId: null,
    college: "",
    members: [{ name: "", studentNumber: "", college: "" }],
  };
  isEditDialogVisible.value = true;
};

// 打开编辑弹窗
const openEditDialog = (team) => {
  isNew.value = false;
  // 深拷贝，避免直接修改列表数据
  editForm.value = JSON.parse(JSON.stringify(team));
  // 确保 members 至少有一个空项（如果后端返回空的话）
  if (!editForm.value.members || editForm.value.members.length === 0) {
    editForm.value.members = [{ name: "", studentNumber: "", college: "" }];
  }
  isEditDialogVisible.value = true;
};

// 添加成员行
const addMemberRow = () => {
  const new_member = { name: "", studentNumber: "", college: "" };
  // 如果已选择学院，默认设置成员的学院为该值
  if (editForm.value.college) {
    new_member.college = editForm.value.college;
  }
  editForm.value.members.push(new_member);
};

// 移除成员行
const removeMemberRow = (index) => {
  editForm.value.members.splice(index, 1);
  if (editForm.value.members.length === 0) {
    addMemberRow();
  }
};

// 保存队伍 (创建或更新)
const saveTeam = () => {
  if (!editForm.value.college) {
    alerts("警告", "请选择学院");
    return;
  }

  // 过滤掉完全空的成员行
  const validMembers = editForm.value.members.filter(
    (m) => m.name || m.studentNumber || m.college,
  );

  // 校验成员信息是否完整
  for (const m of validMembers) {
    if (!m.name || !m.studentNumber || !m.college) {
      alerts("警告", "请填完整的成员信息（姓名、学号、学院）");
      return;
    }
  }

  isSaving.value = true;
  const apiPath = isNew.value
    ? "/admin/fun/createTeam"
    : "/admin/fun/updateTeam";

  const requestBody = {
    token: getToken(),
    competitionId: gameId.value,
    eventId: eventId.value,
    college: editForm.value.college,
    members: validMembers,
  };

  if (!isNew.value) {
    requestBody.teamId = editForm.value.teamId;
  }

  fetch(apiPath, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.statusCode === 200) {
        alerts("成功", isNew.value ? "创建成功" : "更新成功");
        isEditDialogVisible.value = false;
        fetchTeamsList();
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

// 删除队伍
const deleteTeam = (team) => {
  awaitAlert(
    "确认",
    `确定要删除“${collegeMap[team.college] || team.college}”的参赛队伍吗？`,
    {
      accept: "确认删除",
      reject: "取消",
      icon: "pi pi-exclamation-triangle",
    },
  ).then((confirm) => {
    if (!confirm) return;

    fetch("/admin/fun/deleteTeam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: getToken(),
        teamId: team.teamId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.statusCode === 200) {
          alerts("成功", "删除成功");
          fetchTeamsList();
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
        <h1 class="text-3xl font-bold m-0">队伍管理</h1>
      </div>
      <div class="flex align-items-center gap-3">
        <Select
          v-model="eventId"
          :options="eventsOptions"
          optionLabel="eventName"
          optionValue="eventId"
          placeholder="切换项目"
          class="w-15rem"
          @change="fetchTeamsList"
        />
        <Button label="添加队伍" icon="pi pi-plus" @click="openCreateDialog" />
      </div>
    </div>

    <Divider />

    <div v-if="isLoading">
      <DataTable :value="[{}, {}, {}]" class="p-datatable-striped">
        <Column header="所属学院"
          ><template #body><Skeleton /></template
        ></Column>
        <Column header="队员人数"
          ><template #body><Skeleton /></template
        ></Column>
        <Column header="操作"
          ><template #body><Skeleton height="2rem" width="6rem" /></template
        ></Column>
      </DataTable>
    </div>

    <div v-else-if="error">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>

    <DataTable v-else :value="teamsList" responsiveLayout="scroll" stripedRows>
      <Column field="college" header="所属学院" sortable>
        <template #body="slotProps">
          {{ collegeMap[slotProps.data.college] || slotProps.data.college }}
        </template>
      </Column>
      <Column header="队员列表">
        <template #body="slotProps">
          <div class="flex flex-wrap gap-2">
            <Tag
              v-for="member in slotProps.data.members"
              :key="member.studentNumber"
              :value="member.name"
              severity="secondary"
            />
            <span
              v-if="
                !slotProps.data.members || slotProps.data.members.length === 0
              "
              class="text-400 italic"
              >暂无队员</span
            >
          </div>
        </template>
      </Column>
      <Column header="操作" style="width: 150px">
        <template #body="slotProps">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              class="p-button-text p-button-sm"
              v-tooltip="'编辑队伍'"
              @click="openEditDialog(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-text p-button-danger p-button-sm"
              v-tooltip="'删除队伍'"
              @click="deleteTeam(slotProps.data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- 创建/编辑弹窗 -->
    <Dialog
      v-model:visible="isEditDialogVisible"
      modal
      :header="isNew ? '添加参赛队伍' : '编辑队伍信息'"
      :style="{ width: '700px' }"
      :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
    >
      <div class="flex flex-column gap-4 mt-2">
        <!-- 学院选择 -->
        <div class="flex flex-column gap-2">
          <label
            for="college"
            class="font-bold text-lg flex align-items-center"
          >
            <i class="pi pi-map-marker mr-2 text-primary"></i>
            所属学院
          </label>
          <Select
            id="college"
            v-model="editForm.college"
            :options="collegeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="请选择参赛学院"
            filter
            fluid
            class="w-full shadow-1"
          />
        </div>

        <div class="flex flex-column gap-3">
          <div class="flex justify-content-between align-items-center">
            <label class="font-bold text-lg flex align-items-center">
              <i class="pi pi-users mr-2 text-primary"></i>
              队员信息
            </label>
            <Tag
              :value="`共 ${editForm.members.length} 位成员`"
              severity="info"
              rounded
            />
          </div>

          <!-- 队员列表容器 -->

          <div class="flex flex-column gap-3">
            <div
              v-for="(member, index) in editForm.members"
              :key="index"
              class="member-card p-3 border-round surface-card shadow-1 border-1 border-transparent transition-all transition-duration-200"
            >
              <div
                class="flex flex-column md:flex-row gap-2 p-fluid md:align-items-end"
              >
                <div class="flex-1">
                  <label class="text-xs font-bold text-500 mb-1 block"
                    >姓名</label
                  >
                  <InputText
                    v-model="member.name"
                    placeholder="姓名"
                    size="small"
                    class="w-full"
                  />
                </div>
                <div class="flex-1">
                  <label class="text-xs font-bold text-500 mb-1 block"
                    >学号</label
                  >
                  <InputText
                    v-model="member.studentNumber"
                    placeholder="学号"
                    size="small"
                    class="w-full"
                  />
                </div>
                <div class="flex-1">
                  <label class="text-xs font-bold text-500 mb-1 block"
                    >学院</label
                  >
                  <Select
                    v-model="member.college"
                    :options="collegeOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="学院"
                    fluid
                    size="small"
                  />
                </div>
                <div class="flex-none w-auto flex justify-content-end">
                  <Button
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-danger p-button-text p-button-sm"
                    v-tooltip.top="'移除队员'"
                    @click="removeMemberRow(index)"
                  />
                </div>
              </div>
            </div>

            <!-- 无成员时的占位 -->
            <div
              v-if="editForm.members.length === 0"
              class="text-center p-5 text-400"
            >
              <i class="pi pi-user-plus text-4xl mb-3"></i>
              <p>暂无队员，请点击下方按钮添加</p>
            </div>
          </div>

          <Button
            label="添加新队员"
            icon="pi pi-plus"
            class="p-button-outlined p-button-secondary p-button-sm border-dashed w-full"
            @click="addMemberRow"
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
          label="保存队伍"
          icon="pi pi-check"
          :loading="isSaving"
          class="px-4"
          @click="saveTeam"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
:deep(.p-tag) {
  font-size: 0.8rem;
}
.member-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  border-color: var(--p-primary-color) !important;
}
.member-list-container::-webkit-scrollbar {
  width: 8px;
}
.member-list-container::-webkit-scrollbar-track {
  background: transparent;
}
.member-list-container::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.member-list-container::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
.border-dashed {
  border-style: dashed !important;
}
</style>
