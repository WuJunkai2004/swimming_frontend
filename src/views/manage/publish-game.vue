<script setup>
import { ref, reactive, watch } from "vue";
import { useToken } from "@/composables/useToken";
import { useAlert } from "@/composables/useAlert";
import {
  Excetract,
  getNearestStr
} from "@/composables/excelUtils";
import { useCollegeEnum } from "@/composables/collegeMapping";
import { useEventEnum } from "@/composables/eventMapping";

// --- 1. 初始化 ---
const { getToken } = useToken();
const { alerts } = useAlert();
const { collegeEnumMap, collegeName, collegeMap } = useCollegeEnum();
const { eventEnum, eventMap } = useEventEnum();

// --- 2. 状态定义 ---
// 页面阶段控制: 'upload' 或 'edit'
const stage = ref("upload");
// 编辑状态下的活动标签页
const activeEditTab = ref("athleteList");
const isPublishing = ref(false);
const availableActivityTypes = ref(eventEnum);

// 存储从 Excel 提取并可编辑的比赛数据
const gameData = reactive({
  competitionName: "",
  startTime: null,
  endTime: null,
  leaderPhone: null,
  collegeActivityLimits: 2,
  athleteActivityLimits: 2,
  sameActivityMaxLimit: null,
  athleteList: [],
  activityTypes: [],
  colleges: [],
});

// 用于控制“项目不限人数”的复选框
const sameActivityNoLimit = ref(true);
watch(sameActivityNoLimit, (isUnlimited) => {
  if (isUnlimited) {
    gameData.sameActivityMaxLimit = null;
  }
});

// --- 3. 核心功能函数 ---
const analyseAthlete = (size, names, stuID, colleges) => {
  const athleteList = [];
  for (let i = 0; i < size; i++) {
    athleteList.push({
      name: names[i] || "",
      academicNumber: stuID[i] || "",
      college: collegeEnumMap[getNearestStr(colleges[i], collegeName)] || "",
    });
  }
  return athleteList;
};

const analyseSportEvent = (events) => {
  return events;
};

/**
 * 需求 3.1: 处理 Excel 文件上传
 * @param {object} event - FileUpload 组件传出的事件对象
 */
const getExcelFile = async (event) => {
  console.log(collegeEnumMap);
  const file = event.files[0];
  console.log("文件已选择:", file);
  // 开始解析
  const extract = await Excetract.create(file);
  // 解析校友信息
  const player_name = extract.getColByStr("姓名");
  if (player_name.length === 0) {
    alerts("错误", "未找到“姓名”列，请确保上传的表格格式正确。");
    return;
  }
  const table_len = player_name.length;
  const player_academicNumber = extract.getColByStr("学号");
  const player_college = extract.getColByStr("学院");
  gameData.athleteList = analyseAthlete(
    table_len,
    player_name,
    player_academicNumber,
    player_college,
  );
  // 解析比赛信息
  gameData.competitionName = extract.getTitle();

  gameData.activityTypes = [...eventEnum];

  // 提取去重后的学院列表
  const uniqueColleges = new Set(
    gameData.athleteList.map((a) => a.college).filter((c) => c),
  );
  gameData.colleges = Array.from(uniqueColleges);

  stage.value = "edit";
};

/**
 * 需求 4.1: 修改校友信息的函数存根
 */
const editAthlete = (athlete) => {
  console.log("准备修改校友信息:", athlete);
  // 【预留逻辑】: 在这里可以弹出一个新的 Dialog 来修改单个校友信息
  alerts("提示", `修改 ${athlete.name} 的功能待实现。`);
};

/**
 * 需求 3.2: 发布比赛
 */
const publishGame = async () => {
  if (!gameData.competitionName) {
    alerts("错误", "请输入比赛名称");
    return;
  }
  if (!gameData.startTime || !gameData.endTime) {
    alerts("错误", "请选择报名开始和结束时间");
    return;
  }

  isPublishing.value = true;
  console.log("准备发布比赛，提交的数据:", gameData);

  try {
    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const payload = {
      token: getToken(),
      ...gameData,
      leaderPhone: String(gameData.leaderPhone || ""),
      startTime: formatDate(gameData.startTime),
      endTime: formatDate(gameData.endTime),
    };

    const response = await fetch("/admin/postSignUpList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "发布请求失败");
    }

    const result = await response.json();
    if(result.statusCode === 200){
      throw new Error(result.message || "发布失败");
    }
    alerts("成功", "比赛已成功发布！");
    // 成功后可以重置页面状态
    stage.value = "upload";
    // 重置数据
    gameData.athleteList = [];
    gameData.activityTypes = [];
    gameData.colleges = [];
    gameData.competitionName = "";
    gameData.startTime = null;
    gameData.endTime = null;
    gameData.leaderPhone = null;
    gameData.collegeActivityLimits = 2;
    gameData.athleteActivityLimits = 2;
    gameData.sameActivityMaxLimit = null;
    sameActivityNoLimit.value = true;
  } catch (e) {
    console.error(e);
    alerts("失败", `发布失败: ${e.message}`);
  } finally {
    isPublishing.value = false;
  }
};
</script>

<template>
  <div class="p-4 surface-card shadow-2 border-round">
    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold m-0">发布比赛</h1>
      <Button
        v-if="stage === 'edit'"
        label="确认发布"
        icon="pi pi-send"
        @click="publishGame"
        :loading="isPublishing"
      />
    </div>
    <Divider />

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
                  将比赛报名总表 (Excel) 拖拽到此处
                </p>
                <p class="mt-2 text-color-secondary">或点击选择文件</p>
              </div>
            </template>
          </FileUpload>
        </template>
      </Card>
    </div>

    <div v-else-if="stage === 'edit'">
      <SelectButton
        v-model="activeEditTab"
        :options="[
          { label: '学生信息', value: 'athleteList', icon: 'pi pi-users' },
          { label: '项目设置', value: 'activityTypes', icon: 'pi pi-flag' },
          { label: '比赛详情', value: 'details', icon: 'pi pi-cog' },
        ]"
        optionLabel="label"
        optionValue="value"
        class="mb-4"
      >
        <template #option="slotProps">
          <i :class="slotProps.option.icon" class="mr-2"></i>
          <span>{{ slotProps.option.label }}</span>
        </template>
      </SelectButton>

      <div v-if="activeEditTab === 'athleteList'">
        <DataTable :value="gameData.athleteList" responsiveLayout="scroll">
          <Column field="name" header="姓名"></Column>
          <Column field="academicNumber" header="学号"></Column>
          <Column header="学院">
            <template #body="slotProps">
              {{ collegeMap[slotProps.data.college] || slotProps.data.college }}
            </template>
          </Column>
          <Column header="操作" style="width: 8rem; text-align: right;">
            <template #body="slotProps">
              <Button
                icon="pi pi-pencil"
                class="p-button-text"
                @click="editAthlete(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>
      </div>

      <div v-if="activeEditTab === 'activityTypes'">
        <div class="p-fluid">
          <div class="field">
            <label>请勾选本次比赛允许报名的项目</label>
            <div class="grid mt-2">
              <div
                v-for="act in availableActivityTypes"
                :key="act"
                class="col-12 md:col-6 lg:col-4"
              >
                <div class="flex align-items-center">
                  <Checkbox
                    :inputId="act"
                    :name="act"
                    :value="act"
                    v-model="gameData.activityTypes"
                  />
                  <label :for="act" class="ml-2">{{ eventMap[act] || act }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeEditTab === 'details'">
        <div class="p-fluid formgrid grid">
          <div class="field col-12">
            <label for="competitionName">比赛名称</label>
            <InputText
              id="competitionName"
              v-model="gameData.competitionName"
              class="text-xl"
            />
          </div>

          <div class="field col-12 md:col-6">
            <label for="startTime">报名开始时间</label>
            <DatePicker
              id="startTime"
              v-model="gameData.startTime"
              showIcon
              dateFormat="yy-mm-dd"
            />
          </div>
          <div class="field col-12 md:col-6">
            <label for="endTime">报名截止时间</label>
            <DatePicker
              id="endTime"
              v-model="gameData.endTime"
              showIcon
              dateFormat="yy-mm-dd"
            />
          </div>

          <div class="field col-12 md:col-6">
            <label for="leaderPhone">负责人联系电话</label>
            <InputNumber
              id="leaderPhone"
              v-model="gameData.leaderPhone"
              :useGrouping="false"
            />
          </div>
          <div class="field col-12 md:col-6">
            <label for="athleteActivityLimits">每位校友最多报名项目数</label>
            <InputNumber
              id="athleteActivityLimits"
              v-model="gameData.athleteActivityLimits"
            />
          </div>

          <div class="field col-12 md:col-6">
            <label for="collegeActivityLimits">同学院同项目最多报名人数</label>
            <InputNumber
              id="collegeActivityLimits"
              v-model="gameData.collegeActivityLimits"
            />
          </div>
          <div class="field col-12 md:col-6">
            <label for="sameActivityMaxLimit">单项总人数限制</label>
            <div class="p-inputgroup">
              <InputNumber
                id="sameActivityMaxLimit"
                v-model="gameData.sameActivityMaxLimit"
                :disabled="sameActivityNoLimit"
              />
              <div class="p-inputgroup-addon">
                <Checkbox
                  v-model="sameActivityNoLimit"
                  :binary="true"
                  inputId="noLimitCheckbox"
                />
                <label for="noLimitCheckbox" class="ml-2">不限制</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-panel :deep(.p-card-content) {
  padding: 0;
}
</style>
