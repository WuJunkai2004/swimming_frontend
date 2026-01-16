<script setup>
import { onMounted, shallowRef, ref, watch, computed } from 'vue';
import { useToken } from '@/composables/useToken';
import { getData, saveData } from '@/composables/useStorage';
import { useAlert } from "@/composables/useAlert";
import { useEventEnum } from '@/composables/eventMapping';
import loading from '@/views/loading.vue';

const { getToken } = useToken();
const { alerts } = useAlert();
const { eventMap } = useEventEnum();

// --- 状态 ---
const schedule = ref([]);
const filteredSchedule = ref([]);
const selectedProgram = ref(null);
const selectedGroup = ref(null);

// --- 辅助函数 ---
const getCurrentTimePeriod = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "MORNING";
  if (hour >= 12 && hour < 17) return "AFTERNOON";
  return "EVENING"; // 17:00 - 06:00 (次日)
};

const getTodayDateStr = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// --- 鉴权 ---
onMounted(() => {
  getToken();
});

// --- 路由系统 ---
const routes = {
  'insert_score_one_road': () => import('./insert-score-one-road.vue'),
  'insert_fouls_one_road': () => import('./insert-fouls-one-road.vue'),
  'insert_fouls_all_road': () => import('./insert-fouls-all-road.vue'),
  'update_infos_all_road': () => import('./update-infos-all-road.vue'),
};

const permissionRoutes = {
  'INSERT_ACHIVEMENTS_ONLY_1_ROAD': 'insert_score_one_road',
  'UPDATE_ALL_ROAD_ACHIVEMENTS': 'update_info_all_road',
  'INSERT_DEPARTURE_FOUL_ONLY_1_ROAD': 'insert_fouls_one_road',
  'UPDATE_ALL_DEPARTURE_FOUL': 'update_infos_all_road',
  'INSERT_ARRIVAL_FOUL_ONLY_1_ROAD': 'insert_fouls_one_road',
  'UPDATE_ALL_ARRIVAL_FOUL': 'update_infos_all_road',
  'INSERT_TURN_FOUL_ONLY_1_ROAD': 'insert_fouls_one_road',
  'INSERT_TURN_FOUL_ALL_ROADS': 'insert_fouls_all_road',
  'UPDATE_ALL_TURN_FOUL': 'update_infos_all_road',
  'INSERT_ALL_SWIM_IN_FOUL': 'insert_fouls_all_road',
  'UPDATE_ALL_SWIM_IN_FOUL': 'update_infos_all_road'
}

const permissionList = getData('permission') || [];
const loadedComponents = shallowRef(null);

const filterSchedule = () => {
  const today = getTodayDateStr();
  const period = getCurrentTimePeriod();

  // 查找今日和当前时间段的赛程项
  const currentSession = schedule.value.find(
    (item) => item.date === today && item.time === period,
  );

  if (currentSession && currentSession.total) {
    filteredSchedule.value = currentSession.total.map((item, index) => ({
      label: eventMap[item.program] || item.program,
      value: item,
      id: item.program, // 使用 program 作为唯一标识
    }));
  } else {
    filteredSchedule.value = [];
    // 仅在首次加载且非静默模式下提示，或者在UI显示状态
    console.log(`未找到今日 ${period} 的比赛安排`);
  }
};

const loadSchedule = async () => {
  console.log('load schedule');
  const gameId = getData('gameId');
  if (!gameId) {
    console.error('No gameId found in storage.');
    return;
  }

  // 尝试先从本地读取，以便快速显示
  const storedSchedule = getData('schedule');
  if (storedSchedule && storedSchedule.length > 0) {
    schedule.value = storedSchedule;
    filterSchedule();
  }

  try {
    const response = await fetch(`/api/competition/getGameSchedule?id=${gameId}`);
    const data = await response.json();
    if (data.statusCode === 200) {
      const newSchedule = data.data;
      saveData('schedule', newSchedule);
      schedule.value = newSchedule;
      filterSchedule();
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching game schedule:', error);
    if (!schedule.value.length) {
       alerts('提示', '暂无赛程信息或赛程加载失败');
    }
  }
};

// --- Hash 同步 ---
const syncHash = () => {
  const hash = window.location.hash.slice(1); // 去掉 #
  if (hash) {
    // 尝试在 filteredSchedule 中找到对应的项目
    // 解码 hash，防止中文乱码等
    const decodedHash = decodeURIComponent(hash);
    const found = filteredSchedule.value.find(item => item.id === decodedHash);
    if (found) {
      selectedProgram.value = found.value;
    }
  }
};

const groupOptions = computed(() => {
  if (!selectedProgram.value || !selectedProgram.value.totalGroup) {
    return [];
  }
  const count = selectedProgram.value.totalGroup;
  return Array.from({ length: count }, (_, i) => ({
    label: `第 ${i + 1} 组`,
    value: i + 1,
  }));
});

watch(selectedProgram, (newValue) => {
  selectedGroup.value = null;
  if (newValue) {
    window.location.hash = newValue.program;
  }
});

watch(filteredSchedule, () => {
  // 当赛程更新时，重新同步 Hash，以防 Hash 已经存在但赛程还没加载完
  syncHash();
});

onMounted(async () => {
  await loadSchedule();

  // 监听 hash 变化
  window.addEventListener('hashchange', syncHash);
  // 初始同步
  syncHash();

  const componentsToLoad = [];
  const alreadyAdded = new Set();

  for (const permission of permissionList) {
    const routeName = permissionRoutes[permission];
    if (routeName && routes[routeName] && !alreadyAdded.has(routeName)) {
      const componentModule = await routes[routeName]();
      componentsToLoad.push(componentModule.default);
      alreadyAdded.add(routeName);
    }
  }

  if (componentsToLoad.length === 0) {
    componentsToLoad.push(loading);
  }

  loadedComponents.value = componentsToLoad;
});
</script>

<template>
  <MobileMenuBar />
  <ComputerMenuBar />

  <div class="main-container flex flex-column align-items-center">
    <!-- 全局比赛选择器 -->
    <div class="w-full header-window" style="max-width: 600px;">
      <Card>
        <template #content>
          <div class="field mb-0">
            <label class="block mb-2 font-bold">当前进行项目</label>
            <Select
              v-model="selectedProgram"
              :options="filteredSchedule"
              option-label="label"
              option-value="value"
              placeholder="请选择比赛项目"
              class="w-full"
            />
          </div>

          <div class="field mb-0 mt-3" v-if="selectedProgram">
            <label class="block mb-2 font-bold">当前进行组别</label>
            <Select
              v-model="selectedGroup"
              :options="groupOptions"
              option-label="label"
              option-value="value"
              placeholder="请选择组别"
              class="w-full"
            />
          </div>
        </template>
      </Card>
    </div>

    <div v-for="(currentView, index) in loadedComponents" :key="index" class="content-window">
      <component :is="currentView" :current-program="selectedProgram" :current-group="selectedGroup" />
    </div>
  </div>
</template>

<style scoped>
.main-container {
  width: 100%;
}

.header-window {
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.content-window {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 1.5rem 1.5rem 1.5rem;
  max-width: 1200px;
  width: 100%;
}
</style>
