<script setup>
import { onMounted, shallowRef, ref, watch, computed } from "vue";
import { useToken } from "#/useToken";
import { getData } from "#/useStorage";
import loading from "@/views/loading.vue";

const { getToken } = useToken();

// --- 状态 ---
const eventList = ref([]);
const selectedEvent = ref(null);

// --- 鉴权 ---
onMounted(() => {
  getToken();
});

// --- API 调用 ---
const fetchEventList = async () => {
  const gameId = getData("gameId");
  if (!gameId) return;

  try {
    const res = await fetch("/api/funVolunteer/getEventList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: getToken(),
        competitionId: gameId,
      }),
    });
    const data = await res.json();
    if (data.statusCode === 200) {
      eventList.value = (data.data || []).map((item) => ({
        label: `${item.eventName} - 第${item.round || 1}组`,
        value: item,
        id: `${item.eventId}_${item.round || 1}`,
      }));
    }
  } catch (e) {
    console.error("Fetch event list error:", e);
  }
};

// --- 路由系统 (根据趣味赛需求调整) ---
// 趣味志愿者 position -> 组件映射
const position = getData("funPosition") || "";
const positionRoutes = {
  TIMER: ["insert_score"],
  EXECUTIVE_PRESIDENT: ["review_results", "confirm_results"],
};

const routes = {
  insert_score: () => import("./insert-score.vue"),
  review_results: () => import("./review-results.vue"),
  confirm_results: () => import("./confirm-results.vue"),
};

const loadedComponents = shallowRef([]);

const syncHash = () => {
  const hash = window.location.hash.slice(1);
  if (hash) {
    const found = eventList.value.find((item) => item.id === hash);
    if (found) {
      selectedEvent.value = found.value;
    }
  }
};

const submitAll = () => {
  for (let component of loadedComponents.value) {
    if (component && component.submit) {
      component.submit();
    }
  }
};

watch(selectedEvent, (newValue) => {
  if (newValue) {
    window.location.hash = `${newValue.eventId}_${newValue.round || 1}`;
  }
});

onMounted(async () => {
  await fetchEventList();
  syncHash();
  window.addEventListener("hashchange", syncHash);

  const componentsToLoad = [];
  const alreadyAdded = new Set();

  const allowedRoutes = positionRoutes[position] || [];
  for (const routeName of allowedRoutes) {
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
    <div class="w-full header-window" style="max-width: 600px">
      <Card>
        <template #content>
          <div class="field mb-0">
            <label class="block mb-2 font-bold">选择趣味赛项目</label>
            <Select
              v-model="selectedEvent"
              :options="eventList"
              option-label="label"
              option-value="value"
              placeholder="请选择项目"
              class="w-full"
            />
          </div>
        </template>
      </Card>
    </div>

    <div
      v-for="(currentView, index) in loadedComponents"
      :key="index"
      class="content-window"
    >
      <component :is="currentView" :current-event="selectedEvent" />
    </div>

    <Button
      v-if="loadedComponents.length > 0 && loadedComponents[0] !== loading"
      id="submit-all-btn"
      label="提交"
      icon="pi pi-check"
      class="w-full"
      @click="submitAll"
    />
  </div>
</template>

<style scoped>
.main-container {
  width: 100%;
}

.header-window {
  padding: 1.5rem 1.5rem 0 1.5rem;
}

#submit-all-btn {
  max-width: 400px;
  margin: 0 auto;
}

.content-window {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 1.5rem 1.5rem 1.5rem;
  max-width: 1200px;
  width: 100%;
}
</style>
