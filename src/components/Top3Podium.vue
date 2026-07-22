<script setup>
import { computed } from "vue";

// items: [{ rank, key, name, points }]，支持同名次并列多条
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

// 领奖台站位：第 2 名在左、第 1 名居中、第 3 名在右
// 每个站位是一个名次组，并列时组内多人并排展示
const podiumGroups = computed(() => {
  const groups = { 1: [], 2: [], 3: [] };
  props.items.forEach((item) => {
    if (groups[item.rank]) {
      groups[item.rank].push(item);
    }
  });
  return [
    { rank: 2, members: groups[2] },
    { rank: 1, members: groups[1] },
    { rank: 3, members: groups[3] },
  ].filter((g) => g.members.length > 0);
});

// 对学院/队伍枚举值做 FNV-1a 哈希（对相似字符串也有良好的雪崩效应），
// 再用黄金角 137.508° 散布色相，保证相邻名称的小球颜色尽量拉开
const avatarColor = (key) => {
  const str = String(key || "");
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  const hue = Math.floor((hash * 137.508) % 360);
  const saturation = 58 + ((hash >>> 9) % 22); // 58% ~ 79%
  const lightness = 42 + ((hash >>> 17) % 14); // 42% ~ 55%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const firstChar = (name) => (name ? String(name).charAt(0) : "?");
</script>

<template>
  <div v-if="podiumGroups.length" class="podium-wrap">
    <div
      v-for="group in podiumGroups"
      :key="group.rank"
      class="podium-group"
      :class="[
        `podium-rank-${group.rank}`,
        { 'podium-tie': group.members.length > 1 },
      ]"
    >
      <!-- 皇冠 + 哈希色小球（并列时并排多个） -->
      <div class="podium-members">
        <div
          v-for="member in group.members"
          :key="member.key"
          class="podium-member"
        >
          <i
            class="pi pi-crown podium-crown"
            :class="`crown-rank-${group.rank}`"
          ></i>
          <div
            class="podium-avatar"
            :style="{ backgroundColor: avatarColor(member.key) }"
          >
            {{ firstChar(member.name) }}
          </div>
        </div>
      </div>

      <!-- 领奖台柱体 -->
      <div class="podium-block" :class="`block-rank-${group.rank}`">
        <span class="podium-no">NO.{{ group.rank }}</span>
      </div>

      <!-- 底部：完整名称 + 成绩 -->
      <div class="podium-names">
        <div
          v-for="member in group.members"
          :key="member.key"
          class="podium-member-info"
        >
          <div class="podium-name">{{ member.name }}</div>
          <div class="podium-points">{{ member.points }} 分</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.podium-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: center;
  gap: 1.5rem;
  /* 抵消页面大标题的 mb-5 + padding，拉近与标题的间距 */
  margin-top: -2.5rem;
  padding: 0 0 0.5rem;
}

.podium-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 8.5rem;
}

/* 皇冠 + 小球成员行 */
.podium-members {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.75rem;
}

.podium-member {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 皇冠：金银铜配色 + 自定义大小 */
.podium-crown {
  margin-bottom: 0.4rem;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25));
}

.crown-rank-1 {
  color: #ffd700;
  font-size: 2.4rem;
}

.crown-rank-2 {
  color: #c0c0c0;
  font-size: 1.9rem;
}

.crown-rank-3 {
  color: #cd7f32;
  font-size: 1.7rem;
}

/* 哈希色小球 */
.podium-avatar {
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

.podium-rank-1 .podium-avatar {
  width: 5.5rem;
  height: 5.5rem;
  font-size: 2.2rem;
  border: 3px solid rgba(255, 215, 0, 0.75);
}

/* 并列时小球与皇冠适当缩小 */
.podium-tie .podium-avatar {
  width: 3.75rem;
  height: 3.75rem;
  font-size: 1.5rem;
}

.podium-tie.podium-rank-1 .podium-avatar {
  width: 4.5rem;
  height: 4.5rem;
  font-size: 1.8rem;
}

.podium-tie .podium-crown {
  font-size: 1.6rem;
}

/* 领奖台柱体：高度仿领奖台，宽度随并列人数自适应 */
.podium-block {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  align-self: stretch;
  padding-top: 0.75rem;
  border-radius: 0.75rem 0.75rem 0 0;
}

.block-rank-1 {
  height: 7.5rem;
  background: linear-gradient(180deg, #ffe27a 0%, var(--gold-primary, #d4af37) 60%, var(--gold-dark, #b8962e) 100%);
  box-shadow: 0 0 24px rgba(212, 175, 55, 0.35);
}

.block-rank-2 {
  height: 5.5rem;
  background: linear-gradient(180deg, #e8e8e8 0%, #b8b8b8 60%, #8f8f8f 100%);
  box-shadow: 0 0 18px rgba(168, 168, 168, 0.3);
}

.block-rank-3 {
  height: 4.25rem;
  background: linear-gradient(180deg, #e8a86a 0%, #cd7f32 60%, #9c5f24 100%);
  box-shadow: 0 0 18px rgba(205, 127, 50, 0.3);
}

.podium-no {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
}

.block-rank-1 .podium-no {
  font-size: 1.2rem;
}

/* 底部名称与成绩 */
.podium-names {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.podium-member-info {
  max-width: 9rem;
  text-align: center;
}

.podium-name {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--p-text-color);
  word-break: break-all;
}

.podium-points {
  margin-top: 0.25rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gold-dark, #b8962e);
}

:where(.p-dark) .podium-name {
  color: #ffffff;
}

:where(.p-dark) .podium-points {
  color: var(--gold-light, #e6c870);
}

@media (max-width: 768px) {
  .podium-wrap {
    gap: 0.75rem;
  }

  .podium-group {
    min-width: 6.5rem;
  }

  .podium-members {
    gap: 0.4rem;
  }

  .podium-avatar {
    width: 3.5rem;
    height: 3.5rem;
    font-size: 1.4rem;
  }

  .podium-rank-1 .podium-avatar {
    width: 4.25rem;
    height: 4.25rem;
    font-size: 1.7rem;
  }

  .podium-tie .podium-avatar,
  .podium-tie.podium-rank-1 .podium-avatar {
    width: 3rem;
    height: 3rem;
    font-size: 1.2rem;
  }

  .crown-rank-1 {
    font-size: 1.9rem;
  }

  .crown-rank-2 {
    font-size: 1.6rem;
  }

  .crown-rank-3 {
    font-size: 1.4rem;
  }

  .podium-tie .podium-crown {
    font-size: 1.3rem;
  }

  .block-rank-1 {
    height: 6rem;
  }

  .block-rank-2 {
    height: 4.5rem;
  }

  .block-rank-3 {
    height: 3.5rem;
  }

  .podium-names {
    gap: 0.4rem;
  }

  .podium-member-info {
    max-width: 6rem;
  }

  .podium-name {
    font-size: 0.85rem;
  }
}
</style>
