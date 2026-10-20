<script setup>
import { ref, computed } from "vue";

/**
 * 一大组（场次 + 项目 + 组别）成绩展示板（可复用，只读）：
 * - 前三名领奖台（按总排名）
 * - 小组（第N组）多于一个时，提供“总排名 / 第N组”标签页分组展示
 * - 列表列：名次 | 组/道 | 运动员（姓名 + 学院） | 成绩
 * - 明暗主题自适应（仅使用 PrimeVue 主题 CSS 变量）
 *
 * items 元素结构：
 * {
 *   key,            // 唯一标识（可选）
 *   name,           // 姓名
 *   college,        // 学院枚举码
 *   score,          // 成绩，单位秒（犯规/弃权时为 0 或 null）
 *   foulOrNot,      // 是否犯规
 *   foulReason,     // 犯规类型枚举码（可选）
 *   road,           // 道次（可选，0 表示未编排）
 *   heat,           // 小组组次（可选，0/null 表示未分组）
 * }
 */
const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  title: { type: String, default: "" },
  collegeMap: { type: Object, default: () => ({}) },
  foulMap: { type: Object, default: () => ({}) },
});

// --- 排名计算：有效成绩按秒数升序，同成绩并列同名次；犯规/无成绩排在最后 ---
const rankList = (rows) => {
  const valid = rows
    .filter((i) => !i.foulOrNot && Number(i.score) > 0)
    .sort((a, b) => a.score - b.score);
  let rank = 0;
  let prevScore = null;
  const rankedValid = valid.map((item, index) => {
    if (prevScore === null || item.score !== prevScore) {
      rank = index + 1;
    }
    prevScore = item.score;
    return { ...item, rank };
  });
  const invalid = rows
    .filter((i) => i.foulOrNot || !(Number(i.score) > 0))
    .map((item) => ({ ...item, rank: null }));
  return [...rankedValid, ...invalid];
};

// 总排名
const overallRanked = computed(() => rankList(props.items));

// 数据中出现的组次（升序）；没有任何组次信息时不展示分组标签页
const heats = computed(() => {
  const set = new Set();
  props.items.forEach((i) => {
    const h = Number(i.heat);
    if (Number.isFinite(h) && h > 0) set.add(h);
  });
  return [...set].sort((a, b) => a - b);
});

// 当前标签页："overall" 或组次数字（Tabs 的 value 统一用字符串）
const activeTab = ref("overall");
const tabItems = computed(() => [
  { label: "总排名", value: "overall" },
  ...heats.value.map((h) => ({ label: `第${h}组`, value: String(h) })),
]);

// 当前标签页对应的排名列表
const currentRanked = computed(() => {
  if (activeTab.value === "overall") return overallRanked.value;
  const heat = Number(activeTab.value);
  return rankList(props.items.filter((i) => Number(i.heat) === heat));
});

// 领奖台站位：第 2 名在左、第 1 名居中、第 3 名在右，并列同名次多人并排
const podiumGroups = computed(() => {
  const groups = { 1: [], 2: [], 3: [] };
  overallRanked.value.forEach((item) => {
    if (item.rank && item.rank <= 3) {
      groups[item.rank].push(item);
    }
  });
  return [
    { rank: 2, members: groups[2] },
    { rank: 1, members: groups[1] },
    { rank: 3, members: groups[3] },
  ].filter((g) => g.members.length > 0);
});

// 秒数 -> "mm:ss.cc"（不足一分钟时为 "ss.cc"）
const formatScore = (score) => {
  const num = Number(score);
  if (!Number.isFinite(num) || num <= 0) return "--";
  const minutes = Math.floor(num / 60);
  const seconds = (num - minutes * 60).toFixed(2).padStart(5, "0");
  return minutes > 0 ? `${String(minutes).padStart(2, "0")}:${seconds}` : seconds;
};

// 组/道 展示，如 “1/4”；缺省部分用 “—” 占位
const formatHeatRoad = (item) => {
  const heat = Number(item.heat) > 0 ? String(Number(item.heat)) : "—";
  const road = Number(item.road) > 0 ? String(Number(item.road)) : "—";
  if (heat === "—" && road === "—") return "—";
  return `${heat}/${road}`;
};

const collegeLabel = (code) => props.collegeMap[code] || code || "";
const foulLabel = (code) => props.foulMap[code] || code || "";

// 对名称做 FNV-1a 哈希 + 黄金角散布色相，生成稳定的头像底色
const avatarColor = (key) => {
  const str = String(key || "");
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  const hue = Math.floor((hash * 137.508) % 360);
  const saturation = 58 + ((hash >>> 9) % 22);
  const lightness = 42 + ((hash >>> 17) % 14);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const firstChar = (name) => (name ? String(name).charAt(0) : "?");
</script>

<template>
  <div class="result-group-board">
    <!-- 标题栏 -->
    <div v-if="title" class="rgb-header">
      <h2 class="rgb-title m-0">{{ title }}</h2>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="text-center p-5">
      <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="6" />
      <p class="rgb-secondary">正在加载成绩...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="overallRanked.length === 0" class="text-center p-5">
      <i class="pi pi-inbox rgb-secondary" style="font-size: 2rem"></i>
      <p class="rgb-secondary">暂无成绩记录</p>
    </div>

    <template v-else>
      <!-- 前三名领奖台（按总排名） -->
      <div v-if="podiumGroups.length" class="rgb-podium">
        <div
          v-for="group in podiumGroups"
          :key="group.rank"
          class="rgb-podium-group"
          :class="[
            `rgb-rank-${group.rank}`,
            { 'rgb-tie': group.members.length > 1 },
          ]"
        >
          <div class="rgb-podium-members">
            <div
              v-for="member in group.members"
              :key="member.key || member.name"
              class="rgb-podium-member"
            >
              <i
                class="pi pi-crown rgb-crown"
                :class="`rgb-crown-${group.rank}`"
              ></i>
              <div
                class="rgb-avatar"
                :style="{ backgroundColor: avatarColor(member.name) }"
              >
                {{ firstChar(member.name) }}
              </div>
            </div>
          </div>
          <div class="rgb-block" :class="`rgb-block-${group.rank}`">
            <span class="rgb-no">NO.{{ group.rank }}</span>
          </div>
          <div class="rgb-podium-names">
            <div
              v-for="member in group.members"
              :key="member.key || member.name"
              class="rgb-podium-info"
            >
              <div class="rgb-podium-name">{{ member.name }}</div>
              <div class="rgb-podium-college">
                {{ collegeLabel(member.college) }}
              </div>
              <div class="rgb-podium-score">
                {{ formatScore(member.score) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分组标签页：数据带组次信息时才出现 -->
      <Tabs v-if="heats.length > 0" v-model:value="activeTab" class="rgb-tabs">
        <TabList>
          <Tab v-for="t in tabItems" :key="t.value" :value="t.value">
            {{ t.label }}
          </Tab>
        </TabList>
      </Tabs>

      <!-- 成绩列表 -->
      <div class="rgb-list">
        <div class="rgb-list-head">
          <span class="rgb-col-rank">名次</span>
          <span class="rgb-col-heatroad">组/道</span>
          <span class="rgb-col-athlete">运动员</span>
          <span class="rgb-col-score">成绩</span>
        </div>
        <div
          v-for="item in currentRanked"
          :key="item.key || `${item.name}-${item.heat}-${item.road}`"
          class="rgb-row"
        >
          <span
            class="rgb-col-rank rgb-medal"
            :class="{
              'rgb-medal-gold': item.rank === 1,
              'rgb-medal-silver': item.rank === 2,
              'rgb-medal-bronze': item.rank === 3,
            }"
          >
            {{ item.rank ?? "—" }}
          </span>
          <span class="rgb-col-heatroad">{{ formatHeatRoad(item) }}</span>
          <span class="rgb-col-athlete rgb-athlete">
            <span class="rgb-name">{{ item.name }}</span>
            <span v-if="collegeLabel(item.college)" class="rgb-college">
              {{ collegeLabel(item.college) }}
            </span>
          </span>
          <span class="rgb-col-score">
            <span v-if="item.foulOrNot" class="rgb-foul">
              犯规<template v-if="foulLabel(item.foulReason)">
                · {{ foulLabel(item.foulReason) }}</template
              >
            </span>
            <span v-else class="rgb-score">{{ formatScore(item.score) }}</span>
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.result-group-board {
  width: 100%;
}

.rgb-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.rgb-title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--p-text-color);
}

.rgb-secondary {
  color: var(--p-text-secondary-color);
}

/* ---------- 领奖台 ---------- */
.rgb-podium {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: center;
  gap: 1.5rem;
  padding: 0.5rem 0 1rem;
}

.rgb-podium-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 8.5rem;
}

.rgb-podium-members {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.75rem;
}

.rgb-podium-member {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rgb-crown {
  margin-bottom: 0.4rem;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25));
}

.rgb-crown-1 {
  color: #ffd700;
  font-size: 2.4rem;
}

.rgb-crown-2 {
  color: #c0c0c0;
  font-size: 1.9rem;
}

.rgb-crown-3 {
  color: #cd7f32;
  font-size: 1.7rem;
}

.rgb-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.5rem;
  height: 4.5rem;
  margin-bottom: 0.75rem;
  border-radius: 50%;
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.18),
    inset 0 2px 4px rgba(255, 255, 255, 0.35);
}

.rgb-rank-1 .rgb-avatar {
  width: 5.5rem;
  height: 5.5rem;
  font-size: 2.2rem;
  border: 3px solid rgba(255, 215, 0, 0.75);
}

.rgb-tie .rgb-avatar {
  width: 3.75rem;
  height: 3.75rem;
  font-size: 1.5rem;
}

.rgb-tie.rgb-rank-1 .rgb-avatar {
  width: 4.5rem;
  height: 4.5rem;
  font-size: 1.8rem;
}

.rgb-tie .rgb-crown {
  font-size: 1.6rem;
}

.rgb-block {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  align-self: stretch;
  padding-top: 0.75rem;
  border-radius: 0.75rem 0.75rem 0 0;
}

.rgb-block-1 {
  height: 7.5rem;
  background: linear-gradient(180deg, #ffe27a 0%, var(--gold-primary, #d4af37) 60%, var(--gold-dark, #b8962e) 100%);
  box-shadow: 0 0 24px rgba(212, 175, 55, 0.35);
}

.rgb-block-2 {
  height: 5.5rem;
  background: linear-gradient(180deg, #e8e8e8 0%, #b8b8b8 60%, #8f8f8f 100%);
  box-shadow: 0 0 18px rgba(168, 168, 168, 0.3);
}

.rgb-block-3 {
  height: 4.25rem;
  background: linear-gradient(180deg, #e8a86a 0%, var(--bronze, #cd7f32) 60%, #9c5f24 100%);
  box-shadow: 0 0 18px rgba(205, 127, 50, 0.3);
}

.rgb-no {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
}

.rgb-block-1 .rgb-no {
  font-size: 1.2rem;
}

.rgb-podium-names {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.rgb-podium-info {
  max-width: 9rem;
  text-align: center;
}

.rgb-podium-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--p-text-color);
  word-break: break-all;
}

.rgb-podium-college {
  margin-top: 0.15rem;
  font-size: 0.8rem;
  color: var(--p-text-secondary-color);
  word-break: break-all;
}

.rgb-podium-score {
  margin-top: 0.25rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gold-dark, #b8962e);
}

/* ---------- 分组标签页 ---------- */
.rgb-tabs {
  max-width: 38rem;
  margin: 0 auto;
}

/* ---------- 成绩列表 ---------- */
.rgb-list {
  max-width: 38rem;
  margin: 0 auto;
  border-top: 1px solid var(--p-content-border-color);
}

.rgb-list-head,
.rgb-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0.5rem;
}

.rgb-list-head {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--p-text-secondary-color);
  border-bottom: 1px solid var(--p-content-border-color);
}

.rgb-row {
  border-bottom: 1px solid var(--p-content-border-color);
}

.rgb-col-rank {
  width: 2.75rem;
  flex-shrink: 0;
  text-align: center;
}

.rgb-col-heatroad {
  width: 3rem;
  flex-shrink: 0;
  text-align: center;
  font-size: 0.85rem;
  color: var(--p-text-secondary-color);
  font-variant-numeric: tabular-nums;
}

.rgb-col-athlete {
  flex: 1 1 auto;
  min-width: 0;
}

.rgb-col-score {
  flex-shrink: 0;
  min-width: 4.5rem;
  text-align: right;
}

.rgb-medal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  margin: 0 auto;
  font-size: 0.9rem;
  font-weight: 700;
  border-radius: 50%;
  color: var(--p-text-color);
  background: var(--p-surface-100);
}

.rgb-medal-gold {
  color: #ffffff;
  background: linear-gradient(135deg, var(--gold-light, #e6c870) 0%, var(--gold-primary, #d4af37) 50%, var(--gold-dark, #b8962e) 100%);
  box-shadow: 0 0 14px var(--gold-glow, rgba(212, 175, 55, 0.25));
}

.rgb-medal-silver {
  color: #ffffff;
  background: linear-gradient(135deg, #d8d8d8 0%, var(--silver, #a8a8a8) 50%, #7a7a7a 100%);
  box-shadow: 0 0 14px var(--silver-glow, rgba(168, 168, 168, 0.35));
}

.rgb-medal-bronze {
  color: #ffffff;
  background: linear-gradient(135deg, #e09b5e 0%, var(--bronze, #cd7f32) 50%, #8f5426 100%);
  box-shadow: 0 0 14px var(--bronze-glow, rgba(205, 127, 50, 0.35));
}

.rgb-athlete {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.rgb-name {
  font-weight: 600;
  color: var(--p-text-color);
}

.rgb-college {
  font-size: 0.8rem;
  color: var(--p-text-secondary-color);
}

.rgb-score {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--p-text-color);
}

.rgb-foul {
  font-weight: 700;
  color: #c0392b;
}

/* ---------- 响应式 ---------- */
@media (max-width: 768px) {
  .rgb-podium {
    gap: 0.75rem;
  }

  .rgb-podium-group {
    min-width: 6.5rem;
  }

  .rgb-podium-members {
    gap: 0.4rem;
  }

  .rgb-avatar {
    width: 3.5rem;
    height: 3.5rem;
    font-size: 1.4rem;
  }

  .rgb-rank-1 .rgb-avatar {
    width: 4.25rem;
    height: 4.25rem;
    font-size: 1.7rem;
  }

  .rgb-tie .rgb-avatar,
  .rgb-tie.rgb-rank-1 .rgb-avatar {
    width: 3rem;
    height: 3rem;
    font-size: 1.2rem;
  }

  .rgb-crown-1 {
    font-size: 1.9rem;
  }

  .rgb-crown-2 {
    font-size: 1.6rem;
  }

  .rgb-crown-3 {
    font-size: 1.4rem;
  }

  .rgb-tie .rgb-crown {
    font-size: 1.3rem;
  }

  .rgb-block-1 {
    height: 6rem;
  }

  .rgb-block-2 {
    height: 4.5rem;
  }

  .rgb-block-3 {
    height: 3.5rem;
  }

  .rgb-podium-names {
    gap: 0.4rem;
  }

  .rgb-podium-info {
    max-width: 6rem;
  }

  .rgb-podium-name {
    font-size: 0.85rem;
  }

  .rgb-list-head,
  .rgb-row {
    gap: 0.6rem;
    padding: 0.65rem 0.25rem;
  }

  .rgb-col-rank {
    width: 2.25rem;
  }

  .rgb-col-heatroad {
    width: 2.5rem;
    font-size: 0.8rem;
  }

  .rgb-medal {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.8rem;
  }
}
</style>
