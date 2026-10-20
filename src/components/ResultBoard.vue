<script setup>
import { ref, computed } from "vue";

/**
 * 通用成绩展示板（可复用）：
 * - 前三名领奖台（皇冠 + 哈希色头像 + 姓名/学院/成绩）
 * - 全部成绩排名列表（支持响应式布局）
 * - editable 时提供“新增/修改成绩”弹窗（成绩、是否犯规、犯规类型、犯规描述、学院）
 *
 * items 元素结构：
 * {
 *   key,            // 唯一标识（可选）
 *   name,           // 姓名
 *   studentNumber,  // 学号（可选）
 *   college,        // 学院枚举码
 *   score,          // 成绩，单位秒（犯规/弃权时为 0 或 null）
 *   foulOrNot,      // 是否犯规
 *   foulReason,     // 犯规类型枚举码（可选）
 *   foulDescription,// 犯规描述（可选）
 *   road,           // 道次（可选，0 表示未编排，不展示）
 * }
 *
 * save 事件负载：
 * {
 *   original, // 被修改的原始行（新增时为 null）
 *   data: { name, studentNumber, college, achievement, foulOrNot, foulReason, foulDescription }
 * }
 */
const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  editable: { type: Boolean, default: false },
  title: { type: String, default: "" },
  collegeOptions: { type: Array, default: () => [] },
  foulOptions: { type: Array, default: () => [] },
  collegeMap: { type: Object, default: () => ({}) },
  foulMap: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["save"]);

// --- 排名计算：有效成绩按秒数升序，同成绩并列同名次；犯规/无成绩排在最后 ---
const rankedItems = computed(() => {
  const valid = props.items
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
  const invalid = props.items
    .filter((i) => i.foulOrNot || !(Number(i.score) > 0))
    .map((item) => ({ ...item, rank: null }));
  return [...rankedValid, ...invalid];
});

// 领奖台站位：第 2 名在左、第 1 名居中、第 3 名在右，并列同名次多人并排
const podiumGroups = computed(() => {
  const groups = { 1: [], 2: [], 3: [] };
  rankedItems.value.forEach((item) => {
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
  return minutes > 0
    ? `${String(minutes).padStart(2, "0")}:${seconds}`
    : seconds;
};

const collegeLabel = (code) => props.collegeMap[code] || code || "未知学院";
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

// --- 新增/编辑弹窗 ---
const isEditVisible = ref(false);
const isNew = ref(false);
const editingOriginal = ref(null);
const formError = ref("");
const blankForm = () => ({
  name: "",
  studentNumber: "",
  college: "",
  achievement: null,
  foulOrNot: false,
  foulReason: null,
  foulDescription: "",
});
const form = ref(blankForm());

const openAdd = () => {
  isNew.value = true;
  editingOriginal.value = null;
  form.value = blankForm();
  formError.value = "";
  isEditVisible.value = true;
};

const openEdit = (item) => {
  isNew.value = false;
  editingOriginal.value = item;
  form.value = {
    name: item.name || "",
    studentNumber: item.studentNumber || "",
    college: item.college || "",
    achievement: Number(item.score) > 0 ? Number(item.score) : null,
    foulOrNot: !!item.foulOrNot,
    foulReason: item.foulOrNot ? item.foulReason || null : null,
    foulDescription: item.foulDescription || "",
  };
  formError.value = "";
  isEditVisible.value = true;
};

const submit = () => {
  const data = {
    name: String(form.value.name || "").trim(),
    studentNumber: String(form.value.studentNumber || "").trim(),
    college: form.value.college,
    achievement: form.value.foulOrNot
      ? 0
      : Number(form.value.achievement ?? 0),
    foulOrNot: !!form.value.foulOrNot,
    foulReason: form.value.foulOrNot ? form.value.foulReason : "NO_FOUL",
    foulDescription: String(form.value.foulDescription || "").trim(),
  };
  if (!data.name || data.name.length > 10) {
    formError.value = "姓名必填且不超过 10 个字符";
    return;
  }
  if (!data.college) {
    formError.value = "请选择学院";
    return;
  }
  if (data.foulOrNot) {
    if (!data.foulReason || data.foulReason === "NO_FOUL") {
      formError.value = "犯规时必须选择犯规类型";
      return;
    }
  } else if (!(data.achievement > 0)) {
    formError.value = "请填写有效成绩（秒，大于 0）";
    return;
  }
  emit("save", { original: editingOriginal.value, data });
  isEditVisible.value = false;
};
</script>

<template>
  <div class="result-board">
    <!-- 标题栏 -->
    <div class="rb-header">
      <h2 v-if="title" class="rb-title m-0">{{ title }}</h2>
      <span v-else />
      <Button
        v-if="editable"
        label="新增成绩"
        icon="pi pi-plus"
        class="p-button-sm"
        @click="openAdd"
      />
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="text-center p-5">
      <ProgressSpinner style="width: 40px; height: 40px" strokeWidth="6" />
      <p class="rb-secondary">正在加载成绩...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="rankedItems.length === 0" class="text-center p-5">
      <i class="pi pi-inbox rb-secondary" style="font-size: 2rem"></i>
      <p class="rb-secondary">暂无成绩记录</p>
    </div>

    <template v-else>
      <!-- 前三名领奖台 -->
      <div v-if="podiumGroups.length" class="rb-podium">
        <div
          v-for="group in podiumGroups"
          :key="group.rank"
          class="rb-podium-group"
          :class="[
            `rb-rank-${group.rank}`,
            { 'rb-tie': group.members.length > 1 },
          ]"
        >
          <div class="rb-podium-members">
            <div
              v-for="member in group.members"
              :key="member.key || member.name"
              class="rb-podium-member"
            >
              <i
                class="pi pi-crown rb-crown"
                :class="`rb-crown-${group.rank}`"
              ></i>
              <div
                class="rb-avatar"
                :style="{ backgroundColor: avatarColor(member.name) }"
              >
                {{ firstChar(member.name) }}
              </div>
            </div>
          </div>
          <div class="rb-block" :class="`rb-block-${group.rank}`">
            <span class="rb-no">NO.{{ group.rank }}</span>
          </div>
          <div class="rb-podium-names">
            <div
              v-for="member in group.members"
              :key="member.key || member.name"
              class="rb-podium-info"
            >
              <div class="rb-podium-name">{{ member.name }}</div>
              <div class="rb-podium-college">
                {{ collegeLabel(member.college) }}
              </div>
              <div class="rb-podium-score">{{ formatScore(member.score) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 全部成绩列表 -->
      <div class="rb-list">
        <div class="rb-list-head">
          <span class="rb-col-rank">名次</span>
          <span class="rb-col-athlete">运动员</span>
          <span class="rb-col-score">成绩</span>
          <span v-if="editable" class="rb-col-actions">操作</span>
        </div>
        <div
          v-for="item in rankedItems"
          :key="item.key || `${item.name}-${item.studentNumber}`"
          class="rb-row"
        >
          <span
            class="rb-col-rank rb-medal"
            :class="{
              'rb-medal-gold': item.rank === 1,
              'rb-medal-silver': item.rank === 2,
              'rb-medal-bronze': item.rank === 3,
            }"
          >
            {{ item.rank ?? "—" }}
          </span>
          <span class="rb-col-athlete rb-athlete">
            <span class="rb-name">{{ item.name }}</span>
            <span class="rb-college">{{ collegeLabel(item.college) }}</span>
            <span v-if="item.road" class="rb-road">{{ item.road }} 道</span>
          </span>
          <span class="rb-col-score">
            <span v-if="item.foulOrNot" class="rb-foul">
              犯规<template v-if="foulLabel(item.foulReason)">
                · {{ foulLabel(item.foulReason) }}</template
              >
            </span>
            <span v-else class="rb-score">{{ formatScore(item.score) }}</span>
          </span>
          <span v-if="editable" class="rb-col-actions">
            <Button
              icon="pi pi-pencil"
              class="p-button-text p-button-sm"
              aria-label="修改成绩"
              @click="openEdit(item)"
            />
          </span>
        </div>
      </div>
    </template>

    <!-- 新增/修改成绩弹窗 -->
    <Dialog
      v-model:visible="isEditVisible"
      modal
      :header="isNew ? '新增成绩' : `修改成绩 - ${form.name}`"
      :style="{ width: '92vw', maxWidth: '480px' }"
    >
      <div class="flex flex-column gap-3 mt-2">
        <Message v-if="formError" severity="error" :closable="false">
          {{ formError }}
        </Message>
        <div class="flex flex-column gap-1">
          <label class="font-bold">姓名</label>
          <InputText v-model="form.name" placeholder="请输入姓名" />
        </div>
        <div class="flex flex-column gap-1">
          <label class="font-bold">学号（选填）</label>
          <InputText
            v-model="form.studentNumber"
            placeholder="为空时按姓名判重"
          />
        </div>
        <div class="flex flex-column gap-1">
          <label class="font-bold">学院</label>
          <Select
            v-model="form.college"
            :options="collegeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="请选择学院"
            filter
            fluid
          />
        </div>
        <div class="flex align-items-center justify-content-between gap-2">
          <label class="font-bold">是否犯规</label>
          <ToggleSwitch v-model="form.foulOrNot" />
        </div>
        <div v-if="!form.foulOrNot" class="flex flex-column gap-1">
          <label class="font-bold">成绩（秒）</label>
          <InputNumber
            v-model="form.achievement"
            :min="0"
            :maxFractionDigits="2"
            placeholder="如 23.19"
            fluid
          />
        </div>
        <template v-else>
          <div class="flex flex-column gap-1">
            <label class="font-bold">犯规类型</label>
            <Select
              v-model="form.foulReason"
              :options="foulOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="请选择犯规类型"
              filter
              fluid
            />
          </div>
          <div class="flex flex-column gap-1">
            <label class="font-bold">犯规描述（选填）</label>
            <Textarea
              v-model="form.foulDescription"
              rows="2"
              autoResize
              maxlength="200"
              placeholder="补充说明犯规情况"
              fluid
            />
          </div>
        </template>
      </div>
      <template #footer>
        <Button
          label="取消"
          icon="pi pi-times"
          class="p-button-text"
          @click="isEditVisible = false"
        />
        <Button label="保存" icon="pi pi-check" @click="submit" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.result-board {
  width: 100%;
}

.rb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.rb-title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.rb-secondary {
  color: var(--p-text-secondary-color);
}

/* ---------- 领奖台 ---------- */
.rb-podium {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: center;
  gap: 1.5rem;
  padding: 0.5rem 0 1rem;
}

.rb-podium-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 8.5rem;
}

.rb-podium-members {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 0.75rem;
}

.rb-podium-member {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rb-crown {
  margin-bottom: 0.4rem;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25));
}

.rb-crown-1 {
  color: #ffd700;
  font-size: 2.4rem;
}

.rb-crown-2 {
  color: #c0c0c0;
  font-size: 1.9rem;
}

.rb-crown-3 {
  color: #cd7f32;
  font-size: 1.7rem;
}

.rb-avatar {
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

.rb-rank-1 .rb-avatar {
  width: 5.5rem;
  height: 5.5rem;
  font-size: 2.2rem;
  border: 3px solid rgba(255, 215, 0, 0.75);
}

.rb-tie .rb-avatar {
  width: 3.75rem;
  height: 3.75rem;
  font-size: 1.5rem;
}

.rb-tie.rb-rank-1 .rb-avatar {
  width: 4.5rem;
  height: 4.5rem;
  font-size: 1.8rem;
}

.rb-tie .rb-crown {
  font-size: 1.6rem;
}

.rb-block {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  align-self: stretch;
  padding-top: 0.75rem;
  border-radius: 0.75rem 0.75rem 0 0;
}

.rb-block-1 {
  height: 7.5rem;
  background: linear-gradient(180deg, #ffe27a 0%, var(--gold-primary, #d4af37) 60%, var(--gold-dark, #b8962e) 100%);
  box-shadow: 0 0 24px rgba(212, 175, 55, 0.35);
}

.rb-block-2 {
  height: 5.5rem;
  background: linear-gradient(180deg, #e8e8e8 0%, #b8b8b8 60%, #8f8f8f 100%);
  box-shadow: 0 0 18px rgba(168, 168, 168, 0.3);
}

.rb-block-3 {
  height: 4.25rem;
  background: linear-gradient(180deg, #e8a86a 0%, var(--bronze, #cd7f32) 60%, #9c5f24 100%);
  box-shadow: 0 0 18px rgba(205, 127, 50, 0.3);
}

.rb-no {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
}

.rb-block-1 .rb-no {
  font-size: 1.2rem;
}

.rb-podium-names {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.rb-podium-info {
  max-width: 9rem;
  text-align: center;
}

.rb-podium-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--p-text-color);
  word-break: break-all;
}

.rb-podium-college {
  margin-top: 0.15rem;
  font-size: 0.8rem;
  color: var(--p-text-secondary-color);
  word-break: break-all;
}

.rb-podium-score {
  margin-top: 0.25rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gold-dark, #b8962e);
}

/* ---------- 成绩列表 ---------- */
.rb-list {
  max-width: 38rem;
  margin: 0 auto;
  border-top: 1px solid var(--p-content-border-color);
}

.rb-list-head,
.rb-row {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.75rem 0.5rem;
}

.rb-list-head {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--p-text-secondary-color);
  border-bottom: 1px solid var(--p-content-border-color);
}

.rb-row {
  border-bottom: 1px solid var(--p-content-border-color);
}

.rb-col-rank {
  width: 3rem;
  flex-shrink: 0;
  text-align: center;
}

.rb-col-athlete {
  flex: 1 1 auto;
  min-width: 0;
}

.rb-col-score {
  flex-shrink: 0;
  min-width: 4.5rem;
  text-align: right;
}

.rb-col-actions {
  width: 3rem;
  flex-shrink: 0;
  text-align: right;
}

.rb-medal {
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

.rb-medal-gold {
  color: #ffffff;
  background: linear-gradient(135deg, var(--gold-light, #e6c870) 0%, var(--gold-primary, #d4af37) 50%, var(--gold-dark, #b8962e) 100%);
  box-shadow: 0 0 14px var(--gold-glow, rgba(212, 175, 55, 0.25));
}

.rb-medal-silver {
  color: #ffffff;
  background: linear-gradient(135deg, #d8d8d8 0%, var(--silver, #a8a8a8) 50%, #7a7a7a 100%);
  box-shadow: 0 0 14px var(--silver-glow, rgba(168, 168, 168, 0.35));
}

.rb-medal-bronze {
  color: #ffffff;
  background: linear-gradient(135deg, #e09b5e 0%, var(--bronze, #cd7f32) 50%, #8f5426 100%);
  box-shadow: 0 0 14px var(--bronze-glow, rgba(205, 127, 50, 0.35));
}

.rb-athlete {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.rb-name {
  font-weight: 600;
  color: var(--p-text-color);
}

.rb-college,
.rb-road {
  font-size: 0.8rem;
  color: var(--p-text-secondary-color);
}

.rb-score {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--p-text-color);
}

.rb-foul {
  font-weight: 700;
  color: #c0392b;
}

/* ---------- 响应式 ---------- */
@media (max-width: 768px) {
  .rb-podium {
    gap: 0.75rem;
  }

  .rb-podium-group {
    min-width: 6.5rem;
  }

  .rb-podium-members {
    gap: 0.4rem;
  }

  .rb-avatar {
    width: 3.5rem;
    height: 3.5rem;
    font-size: 1.4rem;
  }

  .rb-rank-1 .rb-avatar {
    width: 4.25rem;
    height: 4.25rem;
    font-size: 1.7rem;
  }

  .rb-tie .rb-avatar,
  .rb-tie.rb-rank-1 .rb-avatar {
    width: 3rem;
    height: 3rem;
    font-size: 1.2rem;
  }

  .rb-crown-1 {
    font-size: 1.9rem;
  }

  .rb-crown-2 {
    font-size: 1.6rem;
  }

  .rb-crown-3 {
    font-size: 1.4rem;
  }

  .rb-tie .rb-crown {
    font-size: 1.3rem;
  }

  .rb-block-1 {
    height: 6rem;
  }

  .rb-block-2 {
    height: 4.5rem;
  }

  .rb-block-3 {
    height: 3.5rem;
  }

  .rb-podium-names {
    gap: 0.4rem;
  }

  .rb-podium-info {
    max-width: 6rem;
  }

  .rb-podium-name {
    font-size: 0.85rem;
  }

  .rb-list-head,
  .rb-row {
    gap: 0.75rem;
    padding: 0.65rem 0.25rem;
  }

  .rb-col-rank {
    width: 2.25rem;
  }

  .rb-medal {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.8rem;
  }
}
</style>
