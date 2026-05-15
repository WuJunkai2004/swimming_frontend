<script setup>
import { ref, onMounted, computed } from "vue";
import { useAlert } from "#/useAlert";
import { Excetract } from "#/excelUtils";
import { useToken } from "#/useToken";
import { SHA256 } from "#/useHash";

const { alerts, awaitAlert } = useAlert();
const { getToken } = useToken();

const gameId = ref(null);
const gameInfo = ref({});
const stage = ref("upload"); // 'upload' or 'manage' or 'modify'
const volunteerList = ref([]);
const dbVolunteerList = ref([]);

const isLoading = ref(false);

const isPasswordDialogVisible = ref(false);
const processedPasswords = ref([]);

const isEditDialogVisible = ref(false);
const editForm = ref({
  volunteerId: null,
  name: "",
  studentNumber: "",
  position: "",
  road: [],
  password: "",
});
const isAdding = ref(false);

const loadFunVolunteers = () => {
  isLoading.value = true;
  fetch("/admin/fun/getVolunteerList", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: getToken(),
      competitionId: gameId.value,
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      if (result.statusCode === 200) {
        dbVolunteerList.value = result.data || [];
        if (dbVolunteerList.value.length > 0) {
          stage.value = "modify";
        } else {
          stage.value = "upload";
        }
      } else {
        alerts("错误", result.message || "无法加载志愿者列表");
      }
    })
    .catch(() => {
      alerts("错误", "网络异常，无法加载志愿者列表");
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const addPreviewLine = (name, studentId, position, lane) => {
  volunteerList.value.push({
    name,
    studentId,
    position,
    lane,
  });
};

const downloadVolunteerList = () => {
  const fileName = "志愿者填写表-趣味赛.xlsx";
  const link = document.createElement("a");
  link.href = `/${fileName}`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const resetAll = async () => {
  const confirm_reset = await awaitAlert(
    "确认",
    "确定要返回上传页面吗？所有数据将会丢失。",
    {
      accept: "确认",
      reject: "取消",
    },
  );
  if (!confirm_reset) {
    return;
  }
  volunteerList.value = [];
  stage.value = "upload";
};

const openAddDialog = () => {
  isAdding.value = true;
  editForm.value = {
    volunteerId: null,
    name: "",
    studentNumber: "",
    position: "TIMER",
    road: [],
    password: "",
  };
  isEditDialogVisible.value = true;
};

const openEditDialog = (vol) => {
  isAdding.value = false;
  editForm.value = {
    volunteerId: vol.volunteerId,
    name: vol.name,
    studentNumber: vol.studentNumber,
    position: vol.position,
    road: Array.isArray(vol.road) ? [...vol.road] : [],
    password: "", // 密码通常不回显
  };
  isEditDialogVisible.value = true;
};

const deleteVolunteer = async (volId) => {
  const confirm = await awaitAlert("确认", "确定要删除该志愿者吗？", {
    accept: "确认",
    reject: "取消",
  });
  if (!confirm) return;

  isLoading.value = true;
  fetch("/admin/fun/deleteVolunteer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: getToken(),
      volunteerId: volId,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.statusCode === 200) {
        alerts("成功", "删除成功");
        loadFunVolunteers();
      } else {
        alerts("错误", data.message || "删除失败");
      }
    })
    .catch(() => alerts("错误", "网络异常"))
    .finally(() => (isLoading.value = false));
};

const saveVolunteer = async () => {
  if (!editForm.value.name || !editForm.value.studentNumber) {
    alerts("错误", "请填写完整信息");
    return;
  }

  // 校验泳道
  if (editForm.value.position === "TIMER") {
    if (editForm.value.road.length === 0) {
      alerts("错误", "计时员必须选择泳道");
      return;
    }
  } else if (editForm.value.position === "EXECUTIVE_PRESIDENT") {
    editForm.value.road = [1, 2, 3, 4, 5, 6, 7, 8];
  }

  const apiPath = isAdding.value
    ? "/admin/fun/createVolunteer"
    : "/admin/fun/updateVolunteer";

  const body = {
    token: getToken(),
    ...editForm.value,
  };

  if (isAdding.value) {
    body.competitionId = gameId.value;
    delete body.volunteerId; // 新增不需要传 volunteerId
    if (!body.password) {
      body.password = generateRandomPassword();
      const rawPassword = body.password;
      body.password = await SHA256(body.password);
      // 如果是新增，记录下随机生成的密码以便显示
      processedPasswords.value = [
        {
          name: body.name,
          studentNumber: body.studentNumber,
          rawPassword,
        },
      ];
    } else {
      body.password = await SHA256(body.password);
    }
  } else {    if (body.password) {
      body.password = await SHA256(body.password);
    } else {
      delete body.password; // 不更新密码
    }
  }

  isLoading.value = true;
  fetch(apiPath, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.statusCode === 200) {
        isEditDialogVisible.value = false;
        if (isAdding.value && processedPasswords.value.length > 0) {
          isPasswordDialogVisible.value = true;
        } else {
          alerts("成功", "保存成功");
        }
        loadFunVolunteers();
      } else {
        alerts("错误", data.message || "保存失败");
      }
    })
    .catch(() => alerts("错误", "网络异常"))
    .finally(() => (isLoading.value = false));
};

// 处理上传的Excel文件
const getExcelFile = async (event) => {
  const file = event.files[0];
  if (!file) {
    alerts("错误", "未选择文件，请重新选择");
    return;
  }
  const content = await Excetract.create(file);
  const vol_name = content.getColOf("姓名");
  const vol_id = content.getColOf("学号");
  const vol_position = content.getColOf("职务");
  const take_road = content.getColOf("泳道");
  if (!vol_name.length || !vol_id.length || !vol_position.length) {
    alerts("错误", "上传的表格格式不正确，请使用指定的志愿者填写表");
    return;
  }
  volunteerList.value = [];
  for (let i = 0; i < vol_name.length; i++) {
    const name = vol_name[i];
    const studentId = vol_id[i];
    const position = vol_position[i];
    const road = take_road[i] || "";
    addPreviewLine(name, studentId, position, road);
  }
  stage.value = "manage";
};

const positionMapFun = {
  审核员: "EXECUTIVE_PRESIDENT",
  执行总裁: "EXECUTIVE_PRESIDENT",
  录入员: "TIMER",
  计时员: "TIMER",
};

const generateRandomPassword = () => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const exportPasswordsToCsv = (passwords, gameName) => {
  const csvContent =
    "\ufeff姓名,学号,初始密码\n" +
    passwords
      .map((p) => `${p.name},${p.studentNumber},${p.rawPassword}`)
      .join("\n");
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `${gameName || "趣味赛"}-志愿者密码.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const confirmUpload = async () => {
  if (volunteerList.value.length === 0) {
    return;
  }

  processedPasswords.value = [];

  const getFunsFields = async (vol) => {
    const code = positionMapFun[vol.position];
    if (!code) {
      alerts(
        "错误",
        `未知职务: ${vol.position} (姓名: ${vol.name})。趣味赛仅支持：审核员(执行总裁)、录入员(计时员)`,
      );
      return;
    }

    const rawPassword = generateRandomPassword();
    const hashedPassword = await SHA256(rawPassword);

    let road = [];
    if (code === "EXECUTIVE_PRESIDENT") {
      road = [1, 2, 3, 4, 5, 6, 7, 8];
    } else if (code === "TIMER") {
      if (!vol.lane) {
        alerts("错误", `${vol.name} (${vol.position}) 需要填写泳道`);
        return;
      }
      const r = parseInt(vol.lane);
      if (isNaN(r) || r < 1 || r > 8) {
        alerts("错误", `泳道必须是 1-8: ${vol.lane} (姓名: ${vol.name})`);
        return;
      }
      road = [r];
    }

    processedPasswords.value.push({
      name: vol.name,
      studentNumber: String(vol.studentId),
      rawPassword,
    });

    return {
      name: vol.name,
      studentNumber: String(vol.studentId),
      position: code,
      password: hashedPassword,
      road: road,
    };
  };

  const data = [];
  for (const vol of volunteerList.value) {
    const fields = await getFunsFields(vol);
    if (!fields) return;
    data.push(fields);
  }

  isLoading.value = true;

  const body = {
    token: getToken(),
    competitionId: gameId.value,
    volunteers: data,
  };

  fetch("/admin/fun/importVolunteers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.statusCode === 200) {
        if (processedPasswords.value.length > 0) {
          isPasswordDialogVisible.value = true;
        } else {
          alerts("成功", "上传成功");
        }
        volunteerList.value = [];
        loadFunVolunteers();
      } else {
        alerts("错误", data.message || "上传失败");
      }
    })
    .catch((e) => {
      console.error(e);
      alerts("错误", "网络异常，请稍后重试");
    })
    .finally(() => {
      isLoading.value = false;
    });
};

onMounted(() => {
  const params = window.location.hash.split("?")[1];
  if (!params) {
    alerts("错误", "请从比赛管理页面进入该页。或咨询其他管理员。");
    return;
  }
  const urlParams = new URLSearchParams(params);
  gameId.value = urlParams.get("game");

  if (urlParams.has("gameName")) {
    gameInfo.value = { name: urlParams.get("gameName") };
  } else {
    gameInfo.value = { name: "趣味赛" };
  }
  loadFunVolunteers();
});
</script>

<template>
  <div class="p-4 surface-card shadow-3 border-round">
    <div class="flex justify-content-between align-items-center mb-4">
      <div class="flex align-items-center gap-3">
        <Button
          icon="pi pi-arrow-left"
          class="p-button-text p-button-rounded"
          @click="$router.back()"
        />
        <h1 class="text-3xl font-bold m-0">
          志愿者管理
          <span class="text-primary text-2xl">(趣味赛)</span>
        </h1>
      </div>
      <Button
        v-if="stage === 'upload'"
        label="下载志愿者填写表"
        icon="pi pi-download"
        @click="downloadVolunteerList"
      />
      <div v-if="stage === 'modify'" class="flex gap-2">
        <Button label="添加志愿者" icon="pi pi-plus" @click="openAddDialog" />
      </div>
      <div v-if="stage === 'manage'" class="flex gap-2">
        <Button
          label="返回上传"
          icon="pi pi-eye"
          @click="resetAll"
          class="p-button-secondary"
        />
        <Button
          label="确认提交"
          icon="pi pi-check"
          @click="confirmUpload"
          :loading="isLoading"
        />
      </div>
    </div>
    <Divider />

    <Card class="mb-4" v-if="gameInfo.name">
      <template #title>
        <div>{{ gameInfo.name }}</div>
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
              <div
                class="flex align-items-center justify-content-center flex-column p-5"
              >
                <i
                  class="pi pi-cloud-upload border-2 border-circle p-5 text-8xl text-400 border-400"
                />
                <p class="mt-4 mb-0 text-xl">
                  将志愿者信息表 (Excel) 拖拽到此处
                </p>
                <p class="mt-2 text-color-secondary">或点击选择文件</p>
              </div>
            </template>
          </FileUpload>
        </template>
      </Card>
    </div>

    <div v-if="stage === 'modify'">
      <DataTable
        :value="dbVolunteerList"
        showGridlines
        stripedRows
        responsiveLayout="scroll"
        :loading="isLoading"
      >
        <template #header>
          <div class="flex justify-content-between align-items-center">
            <span class="text-xl font-bold">已存在志愿者列表</span>
          </div>
        </template>
        <Column field="name" header="姓名"></Column>
        <Column field="studentNumber" header="学号"></Column>
        <Column field="position" header="职务">
          <template #body="slotProps">
            {{
              Object.keys(positionMapFun).find(
                (k) => positionMapFun[k] === slotProps.data.position,
              ) || slotProps.data.position
            }}
          </template>
        </Column>
        <Column field="road" header="泳道">
          <template #body="slotProps">
            {{
              Array.isArray(slotProps.data.road)
                ? slotProps.data.road.join(", ")
                : slotProps.data.road
            }}
          </template>
        </Column>
        <Column header="操作" :exportable="false" style="min-width: 8rem">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button
                icon="pi pi-pencil"
                class="p-button-rounded p-button-text"
                @click="openEditDialog(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-rounded p-button-text p-button-danger"
                @click="deleteVolunteer(slotProps.data.volunteerId)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <div v-if="stage === 'manage'">
      <DataTable
        :value="volunteerList"
        showGridlines
        stripedRows
        responsiveLayout="scroll"
      >
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

    <!-- 编辑/添加志愿者弹窗 -->
    <Dialog
      v-model:visible="isEditDialogVisible"
      modal
      :header="isAdding ? '添加志愿者' : '编辑志愿者'"
      :style="{ width: '450px' }"
    >
      <div class="flex flex-column gap-4 mt-2">
        <div class="flex flex-column gap-2">
          <label for="name" class="font-bold">姓名</label>
          <InputText id="name" v-model="editForm.name" autocomplete="off" />
        </div>
        <div class="flex flex-column gap-2">
          <label for="studentNumber" class="font-bold">学号</label>
          <InputText
            id="studentNumber"
            v-model="editForm.studentNumber"
            autocomplete="off"
          />
        </div>
        <div class="flex flex-column gap-2">
          <label class="font-bold">职务</label>
          <Select
            v-model="editForm.position"
            :options="[
              { label: '审核员(执行总裁)', value: 'EXECUTIVE_PRESIDENT' },
              { label: '录入员(计时员)', value: 'TIMER' },
            ]"
            optionLabel="label"
            optionValue="value"
            placeholder="选择职务"
          />
        </div>
        <div
          class="flex flex-column gap-2"
          v-if="editForm.position === 'TIMER'"
        >
          <label class="font-bold">负责泳道 (可多选)</label>
          <MultiSelect
            v-model="editForm.road"
            :options="[1, 2, 3, 4, 5, 6, 7, 8]"
            placeholder="选择泳道"
            display="chip"
          />
        </div>
        <div class="flex flex-column gap-2">
          <label for="password" class="font-bold">
            密码 {{ isAdding ? "(留空则随机生成)" : "(留空则不修改)" }}
          </label>
          <Password
            id="password"
            v-model="editForm.password"
            :feedback="false"
            toggleMask
            autocomplete="new-password"
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
          label="确认"
          icon="pi pi-check"
          @click="saveVolunteer"
          :loading="isLoading"
        />
      </template>
    </Dialog>

    <!-- 密码预览与下载弹窗 -->
    <Dialog
      v-model:visible="isPasswordDialogVisible"
      modal
      header="上传成功 - 志愿者初始密码对照表"
      :style="{ width: '600px' }"
      :closable="false"
    >
      <div class="flex flex-column gap-3 mt-2">
        <Message
          severity="warn"
          icon="pi pi-exclamation-triangle"
          :closable="false"
        >
          请立即下载或记录下方密码。关闭此窗口后，明文密码数据将无法找回。
        </Message>
        <DataTable
          :value="processedPasswords"
          scrollable
          scrollHeight="300px"
          stripedRows
          size="small"
        >
          <Column field="name" header="姓名"></Column>
          <Column field="studentNumber" header="学号"></Column>
          <Column field="rawPassword" header="初始密码">
            <template #body="slotProps">
              <code class="font-bold text-primary">{{
                slotProps.data.rawPassword
              }}</code>
            </template>
          </Column>
        </DataTable>
      </div>
      <template #footer>
        <Button
          label="关闭"
          icon="pi pi-times"
          class="p-button-text"
          @click="isPasswordDialogVisible = false"
        />
        <Button
          label="下载 CSV 对照表"
          icon="pi pi-download"
          @click="exportPasswordsToCsv(processedPasswords, gameInfo.name)"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped></style>
