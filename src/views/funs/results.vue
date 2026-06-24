<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { funGameApi } from "@/api/serve.js";
import { useCollegeEnum } from "#/collegeMapping";

const { collegeMap } = useCollegeEnum();
const route = useRoute();
const router = useRouter();

// --- 状态 ---
const selectedGameId = ref(null);
const gameDetail = ref(null);
const totalPoints = ref([]);
const events = ref([]);
const selectedEvent = ref(null);
const selectedRound = ref(null);
const eventResults = ref(null);

const loading = ref(false);
const error = ref(null);

const roundOptions = ref([
  { label: "决赛", value: null },
  ...Array.from({ length: 10 }, (_, i) => ({
    label: `第 ${i + 1} 组`,
    value: i + 1,
  })),
]);

// --- API 调用 ---

// 1. 获取活动详情
const fetchGameDetail = async (gameId) => {
  loading.value = true;
  try {
    const res = await funGameApi.getGameDetail({ competitionId: gameId });
    const data = await res.json();
    if (data.statusCode === 200) {
      gameDetail.value = data.data;
      events.value = (data.data.events || []).map((ev) => ({
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
    const res = await funGameApi.getTotalPoints({ competitionId: gameId });
    const data = await res.json();
    if (data.statusCode === 200) {
      totalPoints.value = data.data;
    }
  } catch (e) {
    console.error("Fetch total points error:", e);
  }
};

// 3. 获取单项成绩
const fetchEventResults = async (gameId, eventId, round) => {
  if (!gameId || !eventId) return;
  try {
    const params = { competitionId: gameId, eventId };
    if (round) {
      params.round = round;
    }
    const res = await funGameApi.getEventResults(params);
    const data = await res.json();
    if (data.statusCode === 200) {
      eventResults.value = data.data;
    } else {
      eventResults.value = null;
    }
  } catch (e) {
    console.error("Fetch event results error:", e);
    eventResults.value = null;
  }
};

// --- 逻辑 ---

const init = () => {
  const gameId = route.query.game;
  if (gameId) {
    selectedGameId.value = gameId;
    fetchGameDetail(gameId);
    fetchTotalPoints(gameId);
  } else {
    // 如果没有 game ID，跳转回列表页
    router.replace("/fun/games");
  }
};

const onSelectGame = (gameId) => {
  selectedGameId.value = gameId;
  gameDetail.value = null;
  totalPoints.value = [];
  events.value = [];
  selectedEvent.value = null;
  eventResults.value = null;
  error.value = null;
  router.replace({ path: "/fun/results", query: { game: gameId } });
  fetchGameDetail(gameId);
  fetchTotalPoints(gameId);
};

watch(() => route.query.game, init);

watch([selectedEvent, selectedRound], ([newEvent, newRound]) => {
  if (newEvent && route.query.game) {
    fetchEventResults(route.query.game, newEvent.eventId, newRound);
  }
});

onMounted(init);

const rankedTotalPoints = computed(() => {
  const sorted = [...totalPoints.value].sort(
    (a, b) => b.totalPoints - a.totalPoints,
  );
  let rank = 1;
  return sorted.map((item, i) => {
    if (i > 0 && item.totalPoints < sorted[i - 1].totalPoints) {
      rank = i + 1;
    }
    return { ...item, rank };
  });
});

const backToList = () => {
  router.push("/fun/list");
};

// 显示队伍/学院名称：优先使用 teamName，否则使用 college
const displayName = (item) => {
  if (item.teamName) {
    return item.teamName;
  }
  return collegeMap[item.college] || item.college;
};
</script>

<template>
  <div class="results-page luxury-page">
    <MobileMenuBar />
    <ComputerMenuBar />

    <div class="grid justify-content-center py-5 px-2">
      <div class="col-12 lg:col-10 xl:col-8">
        <!-- 加载中 -->
        <div v-if="loading && !gameDetail" class="text-center p-5">
          <ProgressSpinner />
          <p class="luxury-text-secondary">正在加载成绩...</p>
        </div>

        <!-- 错误提示 -->
        <Message v-else-if="error" severity="error" class="mb-4 luxury-message">
          {{ error }}
        </Message>

        <div v-else-if="gameDetail">
          <!-- 页面大标题 -->
          <header class="luxury-header text-center mb-5">
            <div class="gold-divider"></div>
            <h1 class="luxury-title m-0">{{ gameDetail.gameName }}</h1>
            <p class="luxury-subtitle m-0 mt-2">
              <i class="pi pi-trophy mr-2"></i>成绩公告
            </p>
            <div class="gold-divider"></div>
          </header>

          <!-- 总积分排名 -->
          <Card class="mb-5 luxury-card">
            <template #title>
              <div class="luxury-card-title">
                <i class="pi pi-star-fill mr-2"></i>总积分排名
              </div>
            </template>
            <template #content>
              <DataTable
                :value="rankedTotalPoints"
                responsiveLayout="scroll"
                stripedRows
                class="luxury-table"
              >
                <Column header="排名" style="width: 5rem">
                  <template #body="slotProps">
                    <span
                      class="rank-medal"
                      :class="{
                        'rank-gold': slotProps.data.rank === 1,
                        'rank-silver': slotProps.data.rank === 2,
                        'rank-bronze': slotProps.data.rank === 3,
                      }"
                    >
                      {{ slotProps.data.rank }}
                    </span>
                  </template>
                </Column>
                <Column field="college" header="学院/队伍">
                  <template #body="slotProps">
                    <span class="team-name">{{ displayName(slotProps.data) }}</span>
                  </template>
                </Column>
                <Column field="totalPoints" header="总积分" sortable>
                  <template #body="slotProps">
                    <span class="points-badge">{{ slotProps.data.totalPoints }}</span>
                  </template>
                </Column>
              </DataTable>
            </template>
          </Card>

          <!-- 单项成绩查询 -->
          <Card class="luxury-card">
            <template #title>
              <div class="luxury-card-title">
                <i class="pi pi-search mr-2"></i>单项成绩查询
              </div>
            </template>
            <template #content>
              <div class="flex flex-column md:flex-row gap-4 mb-4">
                <div class="field mb-0 flex-1">
                  <label class="block mb-2 font-bold luxury-label">选择项目</label>
                  <Select
                    v-model="selectedEvent"
                    :options="events"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="请选择项目"
                    class="w-full luxury-select"
                  />
                </div>
                <div class="field mb-0" style="min-width: 10rem">
                  <label class="block mb-2 font-bold luxury-label">选择组别</label>
                  <Select
                    v-model="selectedRound"
                    :options="roundOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="决赛"
                    class="w-full luxury-select"
                  />
                </div>
              </div>

              <div v-if="eventResults">
                <div class="event-title-wrap mb-4">
                  <span class="event-name">{{ eventResults.eventName }}</span>
                  <span
                    v-if="selectedRound"
                    class="event-round-tag"
                  >第 {{ selectedRound }} 组</span>
                </div>

                <DataTable
                  :value="eventResults.results"
                  responsiveLayout="scroll"
                  stripedRows
                  class="luxury-table"
                >
                  <Column field="ranking" header="排名" style="width: 5rem">
                    <template #body="slotProps">
                      <span
                        class="rank-medal"
                        :class="{
                          'rank-gold': slotProps.data.ranking === 1,
                          'rank-silver': slotProps.data.ranking === 2,
                          'rank-bronze': slotProps.data.ranking === 3,
                        }"
                      >
                        {{ slotProps.data.ranking }}
                      </span>
                    </template>
                  </Column>
                  <Column field="points" header="积分" style="width: 6rem">
                    <template #body="slotProps">
                      <span class="points-badge">{{ slotProps.data.points }}</span>
                    </template>
                  </Column>
                  <Column header="成绩">
                    <template #body="slotProps">
                      <span
                        v-if="slotProps.data.display"
                        class="invalid-result"
                      >
                        {{ slotProps.data.display }}
                      </span>
                      <span v-else class="valid-result">
                        {{ slotProps.data.rawScore }} {{ eventResults.unit }}
                      </span>
                    </template>
                  </Column>
                  <Column
                    field="road"
                    header="道次"
                    style="width: 5rem"
                  ></Column>
                  <Column field="college" header="学院/队伍">
                    <template #body="slotProps">
                      <span class="team-name">{{ displayName(slotProps.data) }}</span>
                    </template>
                  </Column>
                </DataTable>

                <div
                  class="event-rules mt-4"
                  v-if="selectedEvent && selectedEvent.rules"
                >
                  规则：{{ selectedEvent.rules }}
                </div>
              </div>
              <div v-else class="text-center p-5">
                <p class="luxury-text-secondary">请选择项目以查看成绩</p>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* =====================================================
   趣味赛成绩页 · 轻奢赛事风格
   黑白基底 + 鎏金点缀，明暗主题自动适配
   ===================================================== */

.luxury-page {
  --gold-primary: #d4af37;
  --gold-light: #e6c870;
  --gold-dark: #b8962e;
  --gold-pale: rgba(212, 175, 55, 0.08);
  --gold-glow: rgba(212, 175, 55, 0.25);
  --silver: #a8a8a8;
  --silver-glow: rgba(168, 168, 168, 0.35);
  --bronze: #cd7f32;
  --bronze-glow: rgba(205, 127, 50, 0.35);

  min-height: 100vh;
  background-color: var(--p-surface-0);
  color: var(--p-text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

:where(.p-dark) .luxury-page {
  background-color: #0a0a0c;
  color: #ffffff;
}

/* 顶部大标题区域 */
.luxury-header {
  padding: 2rem 0;
}

.luxury-title {
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  background: linear-gradient(90deg, var(--gold-dark) 0%, var(--gold-primary) 50%, var(--gold-light) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 2px 16px var(--gold-glow);
}

:where(.p-dark) .luxury-title {
  background: linear-gradient(90deg, var(--gold-primary) 0%, var(--gold-light) 50%, #fff5d1 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.luxury-subtitle {
  font-size: 1rem;
  letter-spacing: 0.2em;
  color: var(--p-text-secondary-color);
  text-transform: uppercase;
}

:where(.p-dark) .luxury-subtitle {
  color: rgba(255, 255, 255, 0.65);
}

.luxury-subtitle i {
  color: var(--gold-primary);
}

/* 金色渐变分割装饰线 */
.gold-divider {
  height: 1px;
  width: 60%;
  max-width: 420px;
  margin: 1.25rem auto;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--gold-primary) 30%,
    var(--gold-light) 50%,
    var(--gold-primary) 70%,
    transparent 100%
  );
  opacity: 0.7;
}

/* 奢华卡片 */
.luxury-card {
  background-color: var(--p-surface-0);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 1rem;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(212, 175, 55, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  overflow: hidden;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

:where(.p-dark) .luxury-card {
  background-color: #1a1a1e;
  border-color: rgba(230, 200, 112, 0.22);
  box-shadow:
    0 8px 40px rgba(0, 0, 0, 0.45),
    0 0 24px rgba(212, 175, 55, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.luxury-card :deep(.p-card-body) {
  padding: 1.75rem;
}

.luxury-card :deep(.p-card-title) {
  padding-bottom: 1rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
}

:where(.p-dark) .luxury-card :deep(.p-card-title) {
  border-bottom-color: rgba(230, 200, 112, 0.18);
}

.luxury-card-title {
  display: flex;
  align-items: center;
  font-size: 1.35rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--p-text-color);
}

:where(.p-dark) .luxury-card-title {
  color: #ffffff;
}

.luxury-card-title i {
  color: var(--gold-primary);
  font-size: 1.15rem;
}

/* 表单标签 */
.luxury-label {
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  color: var(--p-text-secondary-color);
}

:where(.p-dark) .luxury-label {
  color: rgba(255, 255, 255, 0.7);
}

/* 磨砂下拉选择框 */
.luxury-select :deep(.p-select) {
  background: rgba(212, 175, 55, 0.04);
  border: 1px solid rgba(212, 175, 55, 0.22);
  border-radius: 0.75rem;
  backdrop-filter: blur(8px);
  transition: all 0.25s ease;
}

:where(.p-dark) .luxury-select :deep(.p-select) {
  background: rgba(230, 200, 112, 0.06);
  border-color: rgba(230, 200, 112, 0.28);
  color: #ffffff;
}

.luxury-select :deep(.p-select:hover),
.luxury-select :deep(.p-select.p-focus) {
  border-color: var(--gold-primary);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.12);
}

:where(.p-dark) .luxury-select :deep(.p-select:hover),
:where(.p-dark) .luxury-select :deep(.p-select.p-focus) {
  box-shadow: 0 0 0 3px rgba(230, 200, 112, 0.15);
}

.luxury-select :deep(.p-select-label) {
  color: var(--p-text-color);
  font-size: 0.95rem;
}

:where(.p-dark) .luxury-select :deep(.p-select-label) {
  color: #ffffff;
}

.event-title-wrap {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.event-name {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: linear-gradient(90deg, var(--gold-dark), var(--gold-primary));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

:where(.p-dark) .event-name {
  background: linear-gradient(90deg, var(--gold-primary), var(--gold-light));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.event-round-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--gold-dark);
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 999px;
}

:where(.p-dark) .event-round-tag {
  color: var(--gold-light);
  background: rgba(230, 200, 112, 0.12);
  border-color: rgba(230, 200, 112, 0.3);
}

.event-round-tag.final {
  color: #8b4513;
  background: rgba(212, 175, 55, 0.18);
}

:where(.p-dark) .event-round-tag.final {
  color: var(--gold-light);
  background: rgba(230, 200, 112, 0.15);
}

.event-rules {
  font-size: 0.9rem;
  color: var(--p-text-secondary-color);
  letter-spacing: 0.02em;
}

:where(.p-dark) .event-rules {
  color: rgba(255, 255, 255, 0.6);
}

/* 表格整体奢华样式 */
.luxury-table :deep(.p-datatable-table) {
  font-size: 0.95rem;
  border-collapse: separate;
  border-spacing: 0;
}

.luxury-table :deep(.p-datatable-thead > tr > th) {
  background: transparent;
  color: var(--p-text-secondary-color);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.8rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  padding: 1rem 1rem;
}

:where(.p-dark) .luxury-table :deep(.p-datatable-thead > tr > th) {
  color: rgba(255, 255, 255, 0.65);
  border-bottom-color: rgba(230, 200, 112, 0.22);
}

.luxury-table :deep(.p-datatable-tbody > tr) {
  background: transparent;
  transition: background-color 0.2s ease;
}

.luxury-table :deep(.p-datatable-tbody > tr:nth-child(even)) {
  background: var(--gold-pale);
}

:where(.p-dark) .luxury-table :deep(.p-datatable-tbody > tr:nth-child(even)) {
  background: rgba(230, 200, 112, 0.05);
}

.luxury-table :deep(.p-datatable-tbody > tr:hover) {
  background: rgba(212, 175, 55, 0.12) !important;
}

:where(.p-dark) .luxury-table :deep(.p-datatable-tbody > tr:hover) {
  background: rgba(230, 200, 112, 0.1) !important;
}

.luxury-table :deep(.p-datatable-tbody > tr > td) {
  padding: 1rem 1rem;
  border: none;
  color: var(--p-text-color);
}

:where(.p-dark) .luxury-table :deep(.p-datatable-tbody > tr > td) {
  color: #ffffff;
}

/* 队伍名称 */
.team-name {
  font-weight: 500;
  letter-spacing: 0.02em;
}

/* 金银铜圆形名次徽章 */
.rank-medal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  font-size: 0.9rem;
  font-weight: 700;
  border-radius: 50%;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.45);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.15);
}

.rank-gold {
  background: linear-gradient(135deg, var(--gold-light) 0%, var(--gold-primary) 50%, var(--gold-dark) 100%);
  box-shadow: 0 0 14px var(--gold-glow), inset 0 1px 2px rgba(255, 255, 255, 0.35);
}

.rank-silver {
  background: linear-gradient(135deg, #d8d8d8 0%, var(--silver) 50%, #7a7a7a 100%);
  box-shadow: 0 0 14px var(--silver-glow), inset 0 1px 2px rgba(255, 255, 255, 0.35);
}

.rank-bronze {
  background: linear-gradient(135deg, #e09b5e 0%, var(--bronze) 50%, #8f5426 100%);
  box-shadow: 0 0 14px var(--bronze-glow), inset 0 1px 2px rgba(255, 255, 255, 0.25);
}

/* 积分徽章 */
.points-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  padding: 0.25rem 0.6rem;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--gold-dark);
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 0.5rem;
}

:where(.p-dark) .points-badge {
  color: var(--gold-light);
  background: rgba(230, 200, 112, 0.12);
  border-color: rgba(230, 200, 112, 0.3);
}

/* 成绩显示 */
.valid-result {
  font-weight: 600;
  color: var(--p-text-color);
}

:where(.p-dark) .valid-result {
  color: #ffffff;
}

.invalid-result {
  font-weight: 700;
  color: #c0392b;
}

:where(.p-dark) .invalid-result {
  color: #ff6b6b;
}

/* 文字辅助色 */
.luxury-text-secondary {
  color: var(--p-text-secondary-color);
  letter-spacing: 0.05em;
}

:where(.p-dark) .luxury-text-secondary {
  color: rgba(255, 255, 255, 0.6);
}

/* 错误提示 */
.luxury-message :deep(.p-message-text) {
  font-weight: 500;
  letter-spacing: 0.02em;
}

/* 系统深色模式自动适配（未配置 .p-dark 类时生效） */
@media (prefers-color-scheme: dark) {
  .luxury-page {
    background-color: #0a0a0c;
    color: #ffffff;
  }

  .luxury-title {
    background: linear-gradient(90deg, var(--gold-primary) 0%, var(--gold-light) 50%, #fff5d1 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .luxury-subtitle {
    color: rgba(255, 255, 255, 0.65);
  }

  .luxury-card {
    background-color: #1a1a1e;
    border-color: rgba(230, 200, 112, 0.22);
    box-shadow:
      0 8px 40px rgba(0, 0, 0, 0.45),
      0 0 24px rgba(212, 175, 55, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .luxury-card :deep(.p-card-title) {
    border-bottom-color: rgba(230, 200, 112, 0.18);
  }

  .luxury-card-title {
    color: #ffffff;
  }

  .luxury-label {
    color: rgba(255, 255, 255, 0.7);
  }

  .luxury-select :deep(.p-select) {
    background: rgba(230, 200, 112, 0.06);
    border-color: rgba(230, 200, 112, 0.28);
    color: #ffffff;
  }

  .luxury-select :deep(.p-select:hover),
  .luxury-select :deep(.p-select.p-focus) {
    box-shadow: 0 0 0 3px rgba(230, 200, 112, 0.15);
  }

  .luxury-select :deep(.p-select-label) {
    color: #ffffff;
  }

  .event-name {
    background: linear-gradient(90deg, var(--gold-primary), var(--gold-light));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .event-round-tag {
    color: var(--gold-light);
    background: rgba(230, 200, 112, 0.12);
    border-color: rgba(230, 200, 112, 0.3);
  }

  .event-round-tag.final {
    color: var(--gold-light);
    background: rgba(230, 200, 112, 0.15);
  }

  .event-rules {
    color: rgba(255, 255, 255, 0.6);
  }

  .luxury-table :deep(.p-datatable-thead > tr > th) {
    color: rgba(255, 255, 255, 0.65);
    border-bottom-color: rgba(230, 200, 112, 0.22);
  }

  .luxury-table :deep(.p-datatable-tbody > tr:nth-child(even)) {
    background: rgba(230, 200, 112, 0.05);
  }

  .luxury-table :deep(.p-datatable-tbody > tr:hover) {
    background: rgba(230, 200, 112, 0.1) !important;
  }

  .luxury-table :deep(.p-datatable-tbody > tr > td) {
    color: #ffffff;
  }

  .points-badge {
    color: var(--gold-light);
    background: rgba(230, 200, 112, 0.12);
    border-color: rgba(230, 200, 112, 0.3);
  }

  .valid-result {
    color: #ffffff;
  }

  .invalid-result {
    color: #ff6b6b;
  }

  .luxury-text-secondary {
    color: rgba(255, 255, 255, 0.6);
  }
}

/* 响应式微调 */
@media (max-width: 768px) {
  .luxury-title {
    font-size: 1.6rem;
    letter-spacing: 0.08em;
  }

  .luxury-card :deep(.p-card-body) {
    padding: 1.25rem;
  }

  .luxury-card-title {
    font-size: 1.15rem;
  }

  .luxury-table :deep(.p-datatable-thead > tr > th),
  .luxury-table :deep(.p-datatable-tbody > tr > td) {
    padding: 0.85rem 0.6rem;
  }
}
</style>
