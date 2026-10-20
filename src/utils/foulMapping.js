import { reactive } from 'vue';
import { getData, saveData } from "./useStorage";

const state = reactive({
  foulMap: {},
  foulEnum: [],
  foulName: [],
  foulEnumMap: {}
});

let loading = false;

function updateState(map) {
  // Update foulMap
  for (const key in state.foulMap) delete state.foulMap[key];
  Object.assign(state.foulMap, map);

  // Update foulEnum
  const keys = Object.keys(map);
  state.foulEnum.splice(0, state.foulEnum.length, ...keys);

  // Update foulName
  const values = Object.values(map);
  state.foulName.splice(0, state.foulName.length, ...values);

  // Update foulEnumMap
  const enumMap = Object.fromEntries(
    Object.entries(map).map(([key, value]) => [value, key])
  );
  for (const key in state.foulEnumMap) delete state.foulEnumMap[key];
  Object.assign(state.foulEnumMap, enumMap);
}

function loadFoulMap() {
  if (loading) return;
  loading = true;

  const applyResult = (res) => {
    if (res.statusCode === 200 && res.data) {
      // Cache for 10 days (240 hours)
      saveData('foulMap', res.data, 240);
      updateState(res.data);
      return true;
    }
    return false;
  };

  // 部分后端未提供 /api/volunteer/foulReason，失败时回退到公众犯规枚举接口
  fetch('/api/volunteer/foulReason')
    .then(res => (res.ok ? res.json() : Promise.reject(res.status)))
    .then(res => {
      if (!applyResult(res)) throw new Error('bad result');
    })
    .catch(() =>
      fetch('/api/funGame/foulReason')
        .then(res => res.json())
        .then(applyResult)
    )
    .catch(err => {
      console.error('Failed to load foul map:', err);
    })
    .finally(() => {
      loading = false;
    });
}

// Initial load from storage if available
const cached = getData('foulMap');
if (cached) {
  updateState(cached);
}

export function useFoulEnum() {
  // If state is empty, try to load
  if (state.foulEnum.length === 0 && !loading) {
    const currentStored = getData('foulMap');
    if (currentStored) {
      updateState(currentStored);
    } else {
      loadFoulMap();
    }
  }

  return state;
}
