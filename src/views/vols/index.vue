<script setup>
import { onMounted, shallowRef } from 'vue';
import { useToken } from '@/composables/useToken';
import { getData, saveData } from '@/composables/useStorage';
import loading from '@/views/loading.vue';

const { getToken } = useToken();

// --- 鉴权 ---
onMounted(() => {
  getToken();
});

// --- 路由系统 ---
const routes = {
  'insert_score_one_road': () => import('./insert-score-one-road.vue'),  // 只能提交一道泳道的成绩
  'updata_score_all_road': () => import('./updata-score-all-road.vue'),  // 可以修改全部泳道的成绩
  'insert_fouls_one_road': () => import('./insert-fouls-one-road.vue'),  // 只能提交一道泳道的犯规
  'insert_fouls_all_road': () => import('./insert-fouls-all-road.vue'),  // 可以提交全部泳道的犯规
  'updata_fouls_all_road': () => import('./updata-fouls-all-road.vue'),  // 可以修改全部泳道的犯规
};

const permissionRoutes = {
  'INSERT_ACHIVEMENTS_ONLY_1_ROAD': 'insert_score_one_road',
  'UPDATE_ALL_ROAD_ACHIVEMENTS': 'updata_score_all_road',
  'INSERT_DEPARTURE_FOUL_ONLY_1_ROAD': 'insert_fouls_one_road',
  'UPDATE_ALL_DEPARTURE_FOUL': 'updata_fouls_all_road',
  'INSERT_ARRIVAL_FOUL_ONLY_1_ROAD': 'insert_fouls_one_road',
  'UPDATE_ALL_ARRIVAL_FOUL': 'updata_fouls_all_road',
  'INSERT_TURN_FOUL_ONLY_1_ROAD': 'insert_fouls_one_road',
  'INSERT_TURN_FOUL_ALL_ROADS': 'insert_fouls_all_road',
  'UPDATE_ALL_TURN_FOUL': 'updata_fouls_all_road',
  'INSERT_ALL_SWIM_IN_FOUL': 'insert_fouls_all_road',
  'UPDATE_ALL_SWIM_IN_FOUL': 'updata_fouls_all_road'
}

const permissionList = getData('permission') || [];
const loadedComponents = shallowRef(null);

const loadSchedule = async () => {
  const gameId = getData('gameId');
  if (!gameId) {
    console.error('No gameId found in storage.');
    return;
  }
  fetch(`/api/competition/getGameSchedule?id=${gameId}`)
  .then(response => response.json())
  .then (data => {
    if (data.code === 200) {
      const schedule = data.data;
      saveData('schedule', schedule);
    } else {
      throw new Error(data.message);
    }
  })
  .catch(error => {
    console.error('Error fetching game schedule:', error);
    saveData('schedule', []);
  });
};

onMounted(async () => {
  await loadSchedule();

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
  <div v-for="currentView in loadedComponents" class="content-window">
    <component :is="currentView" />
  </div>
</template>

<style scoped>
.content-window {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1.5rem;
  max-width: 1200px; /* 限制最大宽度，避免在大屏上太宽 */
  width: 100%;
}
</style>
