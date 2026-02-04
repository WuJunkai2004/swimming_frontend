<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useAlert } from "@/composables/useAlert";
import { useToken } from "@/composables/useToken";
import { useEventEnum } from "@/composables/eventMapping";

const { alerts, awaitAlert } = useAlert();
const { getToken } = useToken();
const { eventMap } = useEventEnum();

const gameId = ref(null);
const gameInfo = ref({});
const schedule = ref([]);
const selectedGroup = ref({ name: "A组", code: "A" });
const groupOptions = [
  { name: "甲组", code: "A" },
  { name: "乙组", code: "B" },
];

const isLoading = ref(false);
const isArranging = ref(false);
const currentEvent = ref(null);
const availableAthletes = ref([]);
const selectedAthlete = ref(null);
const activeHeatIndex = ref(0);
const heatData = ref([]); // Array of arrays (lanes)
const accordionValue = ref(["0"]); // Default open first day

const isOverEnd = computed(() => {
  if (!gameInfo.value.endTime || gameInfo.value.endTime === "1970-01-01") {
    return false;
  }
  const now = new Date();
  const endTime = new Date(gameInfo.value.endTime);
  return now > endTime;
});

// 获取比赛信息
const loadGameInfo = () => {
  if (!gameId.value) {
    alerts("错误", "请从比赛管理页面进入该页。或咨询其他管理员。");
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

// 获取日程
const loadSchedule = () => {
  if (!gameId.value) return;
  fetch(`/api/competition/getGameSchedule?id=${gameId.value}`)
    .then((res) => res.json())
    .then((res) => {
      if (res.statusCode === 200) {
        schedule.value = res.data;
      } else {
        alerts("错误", res.message || "获取日程失败");
      }
    })
    .catch((err) => {
      console.error(err);
      alerts("错误", "网络错误，获取日程失败");
    });
};

// 获取运动员列表
const loadAthletes = async (eventProgram) => {
  if (!gameId.value || !selectedGroup.value) return;

  try {
    const token = getToken();
    const res = await fetch("/admin/getParticipatAthleteList", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        gameId: gameId.value,
        event: eventProgram,
        group: selectedGroup.value.code,
      }),
    });
    const result = await res.json();
    if (result.statusCode === 200) {
      availableAthletes.value = result.data;
    } else {
      alerts("提示", result.message || "获取运动员列表失败");
      availableAthletes.value = [];
    }
  } catch (err) {
    console.error(err);
    alerts("错误", "网络错误，获取运动员失败");
    availableAthletes.value = [];
  }
};

const openArrangeDialog = async (event) => {
  currentEvent.value = event;
  isArranging.value = true;
  selectedAthlete.value = null;
  activeHeatIndex.value = 0;

  // Initialize heats
  const totalHeats = event.totalGroup || 1;
  heatData.value = Array.from({ length: totalHeats }, () =>
    Array(8).fill(null),
  );

  await loadAthletes(event.program);
};

// Assign athlete to lane
const assignAthlete = (heatIdx, laneIdx) => {
  if (!selectedAthlete.value) return;

  // Check if athlete is already assigned in all heat
  const isAlreadyAssigned = heatData.value.flat().some(
    athlete => athlete && athlete.studentNumber === selectedAthlete.value.studentNumber
  );

  if (isAlreadyAssigned) {
    alerts("提示", "该运动员已在比赛分配了泳道，不能重复分配");
    return;
  }

  // Assign
  heatData.value[heatIdx][laneIdx] = { ...selectedAthlete.value };

  // Optionally remove from available list or just deselect
  // availableAthletes.value = availableAthletes.value.filter(a => a.studentNumber !== selectedAthlete.value.studentNumber);
  selectedAthlete.value = null;
};

const removeAthlete = (heatIdx, laneIdx) => {
  // const removed = heatData.value[heatIdx][laneIdx];
  // if (removed) availableAthletes.value.push(removed);
  heatData.value[heatIdx][laneIdx] = null;
};

const saveHeat = async (heatIdx) => {
  if (!currentEvent.value) return;

  const heatItems = heatData.value[heatIdx];
  const assignedItems = heatItems
    .map((athlete, idx) =>
      athlete
        ? {
            name: athlete.name,
            studentNumber: athlete.studentNumber,
            road: idx + 1,
            group: heatIdx + 1,
          }
        : null,
    )
    .filter((item) => item !== null);

  if (assignedItems.length === 0) {
    alerts("提示", "该组暂无安排运动员");
    return;
  }

  const markedId = currentEvent.value.marked; // Assuming marked is sequential

  // Let's find the event in schedule to get date/time
  let eventDate = "";
  let eventTime = "";

  for (const day of schedule.value) {
    const found = day.total.find(
      (e) =>
        e.program === currentEvent.value.program &&
        e.marked === currentEvent.value.marked,
    );
    if (found) {
      eventDate = day.date;
      eventTime = day.time;
      break;
    }
  }

  try {
    const token = getToken();
    const payload = {
      token,
      gameId: gameId.value,
      event: currentEvent.value.program,
      date: eventDate,
      time: eventTime,
      marked: markedId,
      group: selectedGroup.value.code,
      data: assignedItems,
    };

    const res = await fetch("/admin/arrangeProgram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (result.statusCode === 200) {
      alerts("成功", `第 ${heatIdx + 1} 组 (Marked: ${markedId}) 安排已保存`);
    } else {
      alerts("错误", result.message || "保存失败");
    }
  } catch (err) {
    console.error(err);
    alerts("错误", "网络错误，保存失败");
  }
};

onMounted(() => {
  const params = window.location.href.split("?")[1];
  if (!params) {
    alerts("错误", "请从比赛管理页面进入该页。或咨询其他管理员。");
    return;
  }
  const urlParams = new URLSearchParams(params);
  gameId.value = urlParams.get("game");

  loadGameInfo();
  loadSchedule();
});
</script>

<template>
  <div class="p-4 surface-card shadow-3 border-round">
    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold m-0">比赛日程安排</h1>
      <Card class="mb-4" :class="{ 'border-1 border-red-500': isOverEnd }">
        <template #title>
          <div :class="{ 'text-red-500': isOverEnd }">{{ gameInfo.name }}</div>
        </template>
        <template #content>
          <div class="flex align-items-center gap-2">
            <span
              class="text-xl"
              :class="{ 'text-red-500 font-bold': isOverEnd }"
            >
              <span v-if="isOverEnd">已截止</span>
            </span>
          </div>
        </template>
      </Card>
    </div>

    <div class="flex gap-4 mb-4 align-items-center">
      <label class="font-bold">选择组别：</label>
      <Select
        v-model="selectedGroup"
        :options="groupOptions"
        optionLabel="name"
        placeholder="选择组别"
      />
      <Button
        icon="pi pi-refresh"
        label="刷新日程"
        @click="loadSchedule"
        text
      />
    </div>

    <Divider />

    <Accordion v-model:value="accordionValue" multiple>
      <AccordionPanel
        v-for="(day, index) in schedule"
        :key="index"
        :value="String(index)"
      >
        <AccordionHeader
          >{{ day.date }} -
          {{
            day.time === "MORNING"
              ? "上午"
              : day.time === "AFTERNOON"
                ? "下午"
                : "晚上"
          }}</AccordionHeader
        >
        <AccordionContent>
          <DataTable :value="day.total" stripedRows class="p-datatable-sm">
            <Column field="marked" header="序号" style="width: 10%"></Column>
            <Column header="项目名称">
              <template #body="slotProps">
                {{ eventMap[slotProps.data.program] || slotProps.data.program }}
              </template>
            </Column>
            <Column
              field="totalGroup"
              header="组数"
              style="width: 15%"
            ></Column>
            <Column header="操作" style="width: 15%">
              <template #body="slotProps">
                <Button
                  label="安排"
                  icon="pi pi-list"
                  size="small"
                  @click="openArrangeDialog(slotProps.data)"
                />
              </template>
            </Column>
          </DataTable>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <!-- Arrange Dialog -->
    <Dialog
      v-model:visible="isArranging"
      modal
      header="安排比赛"
      :style="{ width: '80vw' }"
      :breakpoints="{ '960px': '95vw' }"
    >
      <div v-if="currentEvent" class="flex flex-column h-full">
        <div class="mb-3">
          <span class="font-bold text-xl mr-3">{{
            eventMap[currentEvent.program]
          }}</span>
          <span class="text-500">当前操作组别: {{ selectedGroup.name }}</span>
        </div>

        <div class="grid h-full" style="min-height: 500px">
          <!-- Athletes List -->
          <div
            class="col-12 md:col-3 border-right-1 surface-border flex flex-column"
          >
            <h3 class="mt-0">可用运动员</h3>
            <div
              class="overflow-y-auto flex-1 custom-scrollbar"
              style="max-height: 500px"
            >
              <div
                v-if="availableAthletes.length === 0"
                class="text-center p-3 text-500"
              >
                暂无数据或加载中...
              </div>
              <div
                v-for="athlete in availableAthletes"
                :key="athlete.studentNumber"
                class="p-2 border-bottom-1 surface-border cursor-pointer hover:surface-hover transition-colors"
                :class="{
                  'surface-highlight':
                    selectedAthlete?.studentNumber === athlete.studentNumber,
                }"
                @click="selectedAthlete = athlete"
              >
                <div class="font-bold">{{ athlete.name }}</div>
                <div class="text-sm text-500">{{ athlete.studentNumber }}</div>
              </div>
            </div>
          </div>

          <!-- Lanes -->
          <div class="col-12 md:col-9 flex flex-column">
            <Tabs v-model:value="activeHeatIndex">
              <TabList>
                <Tab v-for="(heat, idx) in heatData" :key="idx" :value="idx"
                  >第 {{ idx + 1 }} 组</Tab
                >
              </TabList>
              <TabPanels>
                <TabPanel
                  v-for="(heat, idx) in heatData"
                  :key="idx"
                  :value="idx"
                >
                  <div
                    class="flex justify-content-between align-items-center mb-3"
                  >
                    <h3 class="m-0">
                      第 {{ idx + 1 }} 组 (Marked:{{ currentEvent.marked }})
                    </h3>
                    <Button
                      label="保存该组"
                      icon="pi pi-check"
                      @click="saveHeat(idx)"
                    />
                  </div>

                  <div class="grid">
                    <div
                      v-for="(laneAthlete, laneIdx) in heat"
                      :key="laneIdx"
                      class="col-12 md:col-6 lg:col-3 mb-3"
                    >
                      <div
                        class="surface-card border-1 border-round p-3 flex flex-column align-items-center justify-content-center h-full relative"
                        :class="
                          laneAthlete
                            ? 'border-primary'
                            : 'border-300 surface-ground cursor-pointer hover:surface-200'
                        "
                        style="min-height: 120px"
                        @click="!laneAthlete && assignAthlete(idx, laneIdx)"
                      >
                        <div class="font-bold text-xl mb-2 text-700">
                          泳道 {{ laneIdx + 1 }}
                        </div>

                        <div v-if="laneAthlete" class="text-center w-full">
                          <div class="text-primary font-bold text-lg mb-1">
                            {{ laneAthlete.name }}
                          </div>
                          <div class="text-500 text-sm mb-3">
                            {{ laneAthlete.studentNumber }}
                          </div>
                          <Button
                            icon="pi pi-times"
                            class="p-button-rounded p-button-danger p-button-text p-button-sm absolute top-0 right-0 m-1"
                            @click.stop="removeAthlete(idx, laneIdx)"
                          />
                        </div>
                        <div v-else class="text-500 text-sm">
                          <span v-if="selectedAthlete"
                            >点击分配: {{ selectedAthlete.name }}</span
                          >
                          <span v-else>空闲 (点击分配)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--p-surface-100);
  border-radius: 3px;
}
</style>
