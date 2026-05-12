<script setup>
import { ref, onMounted, computed } from "vue";
import { useAlert } from "#/useAlert";
import { Excetract } from "#/excelUtils";
import { useToken } from "#/useToken";
import { SHA256 } from "#/useHash";

const { alerts, awaitAlert } = useAlert();
const { getToken } = useToken();

const gameId = ref(null);
const isFun = ref(false);
const gameInfo = ref({});
const stage = ref("upload"); // 'upload' or 'manage'
const volunteerList = ref([]);

const isLoading = ref(false);

const isPasswordDialogVisible = ref(false);
const processedPasswords = ref([]);

const isOverEnd = computed(() => {
  if (
    isFun.value ||
    !gameInfo.value.endTime ||
    gameInfo.value.endTime === "1970-01-01"
  ) {
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
    lane,
  });
};

const downloadVolunteerList = () => {
  // 表格是 /public/志愿者填写表.xlsx
  // 或 /public/志愿者填写表-趣味赛.xlse
  // 使用浏览器下载该文件
  let fileName = "志愿者填写表.xlsx";
  if (isFun.value) {
    fileName = "志愿者填写表-趣味赛.xlsx";
  }
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

// 获取比赛信息
const loadGameInfo = () => {
  if (!gameId.value) {
    alerts("错误", "请从比赛管理页面进入该页。或咨询其他管理员。");
    return;
  }

  if (isFun.value) {
    // 趣味赛无需拉取额外信息
    return;
  }

  isLoading.value = true;
  fetch(`/sport/getGameInfo?game=${gameId.value}`)
    .then((response) => response.json())
    .then((result) => {
      if (result.statusCode === 200) {
        gameInfo.value = result.data;
      } else {
        alerts("错误", result.message || "无法加载赛事信息，请稍后重试");
      }
    })
    .catch(() => {
      alerts("错误", "网络异常，无法加载赛事信息，请稍后重试");
    })
    .finally(() => {
      isLoading.value = false;
    });
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

const positionMap = {
  执行总裁: "EXECUTIVE_PRESIDENT",
  发令员: "STARTER",
  计时员: "TIMER",
  游进技术检查: "TECHNICAL_INSPECTION_OF_SWIMMING_IN",
  转身检查: "REINTAKE_INSPECTION",
  转身检查长: "REBORN_INSPECTOR",
  其他: "OTHER",
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

  const getCommonFields = async (vol) => {
    const code = positionMap[vol.position];
    if (!code) {
      alerts("错误", `未知职务: ${vol.position} (姓名: ${vol.name})`);
      return;
    }
    let road = "";
    if (code === "TIMER" || code === "REINTAKE_INSPECTION") {
      if (!vol.lane) {
        alerts("错误", `${vol.name} (${vol.position}) 需要填写泳道`);
        return;
      }
      road = String(vol.lane);
      if (!["1", "2", "3", "4", "5", "6", "7", "8"].includes(road)) {
        alerts("错误", `泳道必须是 1-8: ${vol.lane} (姓名: ${vol.name})`);
        return;
      }
    }

    return {
      name: vol.name,
      studentNumber: String(vol.studentId),
      position: code,
      road: road,
    };
  };

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
  let getFieldFunc = getCommonFields;
  if (isFun.value) {
    getFieldFunc = getFunsFields;
  }
  for (const vol of volunteerList.value) {
    data.push(await getFieldFunc(vol));
  }

  isLoading.value = true;

  const apiPath = isFun.value
    ? "/admin/fun/importVolunteers"
    : "/admin/uploadVolunteer";
  const body = isFun.value
    ? {
        token: getToken(),
        competitionId: gameId.value,
        volunteers: data,
      }
    : {
        token: getToken(),
        gameId: gameId.value,
        data: data,
      };

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
        if (isFun.value && processedPasswords.value.length > 0) {
          isPasswordDialogVisible.value = true;
        } else {
          alerts("成功", "上传成功");
        }
        volunteerList.value = [];
        stage.value = "upload";
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
  const params = window.location.href.split("?")[1];
  if (!params) {
    alerts("错误", "请从比赛管理页面进入该页。或咨询其他管理员。");
    return;
  }
  const urlParams = new URLSearchParams(params);
  gameId.value = urlParams.get("game");
  isFun.value = urlParams.get("isFun") === "true";

  if (isFun.value) {
    if (urlParams.has("gameName")) {
      gameInfo.value = { name: urlParams.get("gameName") };
    } else {
      gameInfo.value = { name: "趣味赛" };
    }
  }

  loadGameInfo();
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
          <span v-if="isFun" class="text-primary text-2xl">(趣味赛)</span>
        </h1>
      </div>
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

    <Card
      class="mb-4"
      :class="{ 'border-1 border-red-500': isOverEnd }"
      v-if="gameInfo.name"
    >
      <template #title>
        <div :class="{ 'text-red-500': isOverEnd }">{{ gameInfo.name }}</div>
      </template>
      <template #content v-if="!isFun && gameInfo.endTime">
        <div class="flex align-items-center gap-2">
          <i
            class="pi pi-calendar text-xl"
            :class="isOverEnd ? 'text-red-500' : 'text-primary'"
          ></i>
          <span
            class="text-xl"
            :class="{ 'text-red-500 font-bold': isOverEnd }"
          >
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
