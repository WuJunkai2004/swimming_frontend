<script setup>
import { ref, watch, onMounted } from "vue";
import { useAlert } from "@/composables/useAlert";

const props = defineProps({
  placeholder: {
    type: String,
    default: "签字区域",
  },
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "手写签名（请逐字书写）",
  },
});

const emit = defineEmits(["update:visible", "complete"]);

const { alerts } = useAlert();

// 签名相关状态
const savedCharacterSVGs = ref([]);
const currentStrokes = ref([]);
const isDrawing = ref(false);
const signatureCanvas = ref(null);
let ctx = null;

// 初始化画布的逻辑
const initCanvas = () => {
  const canvas = signatureCanvas.value;
  if (!canvas) {
    return;
  }

  // 获取显示尺寸
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return;
  }

  const ratio = window.devicePixelRatio || 1;
  // 设置画布内部分辨率，使其与显示尺寸匹配并支持高清屏
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;

  ctx = canvas.getContext("2d");
  // 必须重置变换矩阵再缩放，防止重复调用 initCanvas 导致叠加缩放
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(ratio, ratio);

  // 画布状态在重置宽/高后会被清空，需重新设置样式
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "black";
};

// 监听 visible 变化，打开时初始化画布
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      setTimeout(initCanvas, 300);
    } else {
      // 关闭时，发送complete事件
      emit("complete", [...savedCharacterSVGs.value]);
    }
  },
);

onMounted(() => {
  if (props.visible) {
    setTimeout(initCanvas, 300);
  }
});

const getPos = (e) => {
  const canvas = signatureCanvas.value;
  if (!canvas) {
    return { x: 0, y: 0 };
  }

  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  // 计算鼠标/手指相对于画布左上角的坐标（CSS 像素）
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
};

const startDraw = (e) => {
  if (!ctx || signatureCanvas.value.width === 0) {
    initCanvas();
  }

  isDrawing.value = true;
  const pos = getPos(e);
  currentStrokes.value.push([pos]);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);

  // 阻止触摸时的默认行为（如滚动）
  if (e.cancelable) {
    e.preventDefault();
  }
};

const draw = (e) => {
  if (!isDrawing.value) {
    return;
  }
  const pos = getPos(e);
  const lastStroke = currentStrokes.value[currentStrokes.value.length - 1];
  if (lastStroke) {
    lastStroke.push(pos);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }
  if (e.cancelable) {
    e.preventDefault();
  }
};

const endDraw = () => {
  isDrawing.value = false;
};

const generateSVGString = (strokes) => {
  if (strokes.length === 0) return "";
  const width = signatureCanvas.value.width / (window.devicePixelRatio || 1);
  const height = signatureCanvas.value.height / (window.devicePixelRatio || 1);

  const paths = strokes
    .map((stroke) => {
      if (stroke.length < 2) return "";
      const d =
        `M ${stroke[0].x} ${stroke[0].y} ` +
        stroke
          .slice(1)
          .map((p) => `L ${p.x} ${p.y}`)
          .join(" ");
      return `<path d="${d}" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`;
    })
    .join("");

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
};

const nextCharacter = () => {
  if (currentStrokes.value.length === 0) {
    alerts("提示", "请先书写当前汉字");
    return;
  }
  const svg = generateSVGString(currentStrokes.value);
  savedCharacterSVGs.value.push(svg);

  // 重置画布
  currentStrokes.value = [];
  ctx.clearRect(
    0,
    0,
    signatureCanvas.value.width,
    signatureCanvas.value.height,
  );
};

const removeCharacter = (index) => {
  savedCharacterSVGs.value.splice(index, 1);
};

const completeSignature = () => {
  // 如果当前还有笔迹未保存
  if (currentStrokes.value.length > 0) {
    const svg = generateSVGString(currentStrokes.value);
    savedCharacterSVGs.value.push(svg);
  }

  if (savedCharacterSVGs.value.length === 0) {
    alerts("提示", "请至少书写一个字");
    return;
  }

  const result = [...savedCharacterSVGs.value];
  emit("update:visible", false);
  currentStrokes.value = [];
  emit("complete", result);
};

const clearSignatures = () => {
  savedCharacterSVGs.value = [];
  currentStrokes.value = [];
  if (ctx && signatureCanvas.value) {
    ctx.clearRect(
      0,
      0,
      signatureCanvas.value.width,
      signatureCanvas.value.height,
    );
  }
};

const getSignatures = () => {
  return [...savedCharacterSVGs.value];
};

defineExpose({ clearSignatures, getSignatures });
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="(val) => $emit('update:visible', val)"
    :header="title"
    :modal="true"
    :draggable="false"
    class="signature-dialog"
    :breakpoints="{ '960px': '95vw', '640px': '100vw' }"
    :style="{ width: '450px' }"
  >
    <div class="flex flex-column align-items-center">
      <div
        class="signature-board-container bg-gray-100 border-1 border-300 border-round overflow-hidden"
        style="
          width: 100%;
          aspect-ratio: 1/1;
          position: relative;
          touch-action: none;
        "
      >
        <canvas
          ref="signatureCanvas"
          @mousedown="startDraw"
          @mousemove="draw"
          @mouseup="endDraw"
          @mouseleave="endDraw"
          @touchstart="startDraw"
          @touchmove="draw"
          @touchend="endDraw"
          style="width: 100%; height: 100%; cursor: crosshair"
        ></canvas>
        <div class="absolute top-0 right-0 p-2 text-400 pointer-events-none">
          {{ placeholder }}
        </div>
      </div>

      <div class="flex w-full mt-4 gap-3">
        <Button
          label="下一字"
          icon="pi pi-plus"
          class="flex-1"
          severity="secondary"
          @click="nextCharacter"
        />
        <Button
          label="完成签名"
          icon="pi pi-check"
          class="flex-1"
          @click="completeSignature"
        />
      </div>

      <div
        v-if="savedCharacterSVGs.length > 0"
        class="w-full mt-3 p-2 border-top-1 border-200"
      >
        <p class="text-sm text-600 m-0 mb-2">
          预览 (已写 {{ savedCharacterSVGs.length }} 字):
        </p>
        <div class="flex flex-wrap gap-3 bg-white p-2 border-round">
          <div
            v-for="(svg, idx) in savedCharacterSVGs"
            :key="idx"
            class="relative bg-gray-50 border-1 border-200 border-round p-1"
            style="width: 45px; height: 45px;"
          >
            <div v-html="svg" class="w-full h-full"></div>
            <Button
              icon="pi pi-times"
              rounded
              class="absolute p-0 flex align-items-center justify-content-center close-button"
              @click.stop="removeCharacter(idx)"
            />
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
:deep(.signature-dialog .p-dialog-content) {
  padding-bottom: 2rem;
}

.close-button {
  top: -6px !important;
  right: -6px !important;
  width: 16px !important;
  height: 16px !important;
  min-width: auto !important;
  font-size: 8px !important;
  background: #94a3b8 !important;
  color: #fff !important;
  border: none !important;
  cursor: pointer !important;
  opacity: 0.8 !important;
}

.close-button:hover {
  background: #64748b;
  opacity: 1;
}

@media screen and (max-width: 640px) {
  :deep(.signature-dialog) {
    height: 100%;
    max-height: 100%;
    border-radius: 0;
  }
}
</style>
