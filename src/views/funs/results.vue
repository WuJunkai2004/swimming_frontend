<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

// --- 状态 ---
const gameDetail = ref(null);
const totalPoints = ref([]);
const events = ref([]);
const selectedEvent = ref(null);
const eventResults = ref(null);

const loading = ref(false);
const error = ref(null);

// --- API 调用 ---

// 1. 获取活动详情
const fetchGameDetail = async (gameId) => {
  loading.value = true;
  try {
    const res = await fetch(`/api/funGame/detail?competitionId=${gameId}`);
    const data = await res.json();
    if (data.statusCode === 200) {
      gameDetail.value = data.data;
      events.value = data.data.events.map((ev) => ({
        label: ev.eventName,
        value: ev,
      }));
      // 默认选择第一个项目
      if (events.value.length > 0) {
        selectedEvent.value = events.value[0].value;
      }
    } else {
      error.value = data.message;
    }
  } catch (e) {
    error.value = "获取详情失败";
  } finally {
    loading.value = false;
  }
};

// 2. 获取总积分
const fetchTotalPoints = async (gameId) => {
  try {
    const res = await fetch(
      `/api/funGame/getTotalPoints?competitionId=${gameId}`,
    );
    const data = await res.json();
    if (data.statusCode === 200) {
      totalPoints.value = data.data;
    }
  } catch (e) {
    console.error("Fetch total points error:", e);
  }
};

// 3. 获取单项成绩
const fetchEventResults = async (gameId, eventId) => {
  if (!gameId || !eventId) return;
  try {
    const res = await fetch(
      `/api/funGame/getEventResults?competitionId=${gameId}&eventId=${eventId}`,
    );
    const data = await res.json();
    if (data.statusCode === 200) {
      eventResults.value = data.data;
    }
  } catch (e) {
    console.error("Fetch event results error:", e);
  }
};

// --- 逻辑 ---

const init = () => {
  const gameId = route.query.game;
  if (gameId) {
    fetchGameDetail(gameId);
    fetchTotalPoints(gameId);
  } else {
    // 如果没有 game ID，跳转回列表页
    router.replace("/fun/list");
  }
};

watch(() => route.query.game, init);

watch(selectedEvent, (newVal) => {
  if (newVal && route.query.game) {
    fetchEventResults(route.query.game, newVal.eventId);
  }
});

onMounted(init);

const backToList = () => {
  router.push("/fun/list");
};
</script>

<template>
  <div class="results-page">
    <MobileMenuBar />
    <ComputerMenuBar />

    <div class="grid justify-content-center p-2">
      <div class="col-12 lg:col-10 xl:col-8">
        <!-- 加载中 -->
        <div v-if="loading && !gameDetail" class="text-center p-5">
          <ProgressSpinner />
          <p>正在加载成绩...</p>
        </div>

        <!-- 错误提示 -->
        <Message v-else-if="error" severity="error" class="mb-4">
          {{ error }}
        </Message>

        <div v-else-if="gameDetail">
          <div class="flex align-items-center mb-3">
            <Button
              icon="pi pi-arrow-left"
              class="p-button-text mr-2"
              @click="backToList"
              label="返回列表"
            />
            <h2 class="m-0">{{ gameDetail.gameName }}</h2>
          </div>

          <!-- 总积分排名 -->
          <Card class="mb-4 shadow-2">
            <template #title>总积分排名</template>
            <template #content>
              <DataTable
                :value="totalPoints"
                responsiveLayout="scroll"
                stripedRows
                class="p-datatable-sm"
              >
                <Column header="排名" style="width: 4rem">
                  <template #body="slotProps">
                    {{ slotProps.index + 1 }}
                  </template>
                </Column>
                <Column field="college" header="学院"></Column>
                <Column field="totalPoints" header="总积分" sortable>
                  <template #body="slotProps">
                    <span class="font-bold text-primary">{{
                      slotProps.data.totalPoints
                    }}</span>
                  </template>
                </Column>
              </DataTable>
            </template>
          </Card>

          <!-- 单项成绩查询 -->
          <Card class="shadow-2">
            <template #title>单项成绩查询</template>
            <template #content>
              <div class="field mb-4">
                <label class="block mb-2 font-bold">选择项目</label>
                <Select
                  v-model="selectedEvent"
                  :options="events"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="请选择项目"
                  class="w-full md:w-20rem"
                />
              </div>

              <div v-if="eventResults">
                <div class="mb-3 p-3 surface-100 border-round">
                  <div class="text-xl font-bold mb-2">
                    {{ eventResults.eventName }}
                  </div>
                  <div
                    class="text-600"
                    v-if="selectedEvent && selectedEvent.rules"
                  >
                    规则: {{ selectedEvent.rules }}
                  </div>
                </div>

                <DataTable
                  :value="eventResults.results"
                  responsiveLayout="scroll"
                  stripedRows
                >
                  <Column
                    field="road"
                    header="道次/组次"
                    style="width: 6rem"
                  ></Column>
                  <Column field="college" header="学院"></Column>
                  <Column header="成绩">
                    <template #body="slotProps">
                      <span
                        v-if="slotProps.data.display"
                        class="text-red-500 font-bold"
                      >
                        {{ slotProps.data.display }}
                      </span>
                      <span v-else>
                        {{ slotProps.data.rawScore }} {{ eventResults.unit }}
                      </span>
                    </template>
                  </Column>
                  <Column field="ranking" header="排名">
                    <template #body="slotProps">
                      <Tag
                        v-if="slotProps.data.ranking === 1"
                        value="1"
                        severity="warn"
                      />
                      <Tag
                        v-else-if="slotProps.data.ranking === 2"
                        value="2"
                        severity="info"
                      />
                      <Tag
                        v-else-if="slotProps.data.ranking === 3"
                        value="3"
                        severity="success"
                      />
                      <span v-else>{{ slotProps.data.ranking }}</span>
                    </template>
                  </Column>
                  <Column field="points" header="积分">
                    <template #body="slotProps">
                      <span class="font-bold">{{ slotProps.data.points }}</span>
                    </template>
                  </Column>
                </DataTable>
              </div>
              <div v-else class="text-center p-5">
                <p class="text-600">请选择项目以查看成绩</p>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.results-page {
  min-height: 100vh;
  background-color: var(--p-content-background);
}
</style>
