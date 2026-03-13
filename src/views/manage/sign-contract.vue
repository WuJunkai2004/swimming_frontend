<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useAlert } from "@/composables/useAlert";

const route = useRoute();
const { alerts } = useAlert();

const type = ref("");
const loading = ref(true);
const error = ref("");
const contractHtml = ref("");
const contractStyle = ref("");
const contractContainer = ref(null);

// 签名相关状态
const signatureDialogVisible = ref(false);
const savedCharacterSVGs = ref([]);
const currentStrokes = ref([]);
const isDrawing = ref(false);
const signatureCanvas = ref(null);
let ctx = null;

const isValidateType = (t) => {
  return ["contract", "letter"].includes(t);
};

const getDateString = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const beijingDate = new Date(utc + 3600000 * 8);
  const year = beijingDate.getFullYear();
  const month = beijingDate.getMonth() + 1;
  const day = beijingDate.getDate();
  return `${year}年${month}月${day}日`;
};

const fetchTemplate = async () => {
  type.value = route.params.type;
  if (!isValidateType(type.value)) {
    error.value = "非法的合同类型，仅支持 contract 或 letter";
    loading.value = false;
    return;
  }

  fetch(`/auth_${type.value}.html`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`无法获取模板: ${response.statusText}`);
      }
      return response.text();
    })
    .then((htmlText) => {
      parseTemplate(htmlText);
    })
    .catch((err) => {
      error.value = "获取模板失败: " + err.message;
      alerts("错误", error.value);
    })
    .finally(() => {
      loading.value = false;
    });
};

const parseTemplate = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const styles = doc.querySelectorAll("style");
  let combinedStyle = "";
  styles.forEach((s) => (combinedStyle += s.textContent));
  contractStyle.value = combinedStyle.replace(/body/g, ".contract-body-view");

  let innerHtml = "";
  const wrapper = doc.querySelector(".contract-wrapper");
  if (wrapper) {
    innerHtml = wrapper.innerHTML;
  } else {
    error.value = "模板格式错误：缺少 .contract-wrapper 元素";
    alerts("错误", error.value);
    return;
  }

  contractHtml.value = innerHtml.replace(/_+年_+月_+日/g, getDateString());
  loading.value = false;

  nextTick(initInteractivity);
};

const initInteractivity = () => {
  if (!contractContainer.value) {
    console.warn("[SignatureView] 容器尚未就绪，无法初始化交互");
    return;
  }

  // 1. 设置可填写区域
  const values = contractContainer.value.querySelectorAll(".value");
  console.log(`[SignatureView] 找到 ${values.length} 个可填写区域`);

  values.forEach((element, index) => {
    element.setAttribute("contenteditable", "true");
    element.classList.add("editable-field");
    element.style.backgroundColor = "rgba(255, 255, 0, 0.05)";
    element.style.cursor = "text";
    element.style.minWidth = "40px";
    element.style.display = "inline-block";
    element.style.position = "relative";
    element.style.zIndex = "20"; // 确保在签名层之上

    // 添加点击触发器
    element.addEventListener("click", () => {
      element.focus();
    });
  });

  // 2. 设置用户签名区交互 (只针对 .user-signature)
  const userSigLine = contractContainer.value.querySelector(".user-signature .sig-line");
  if (userSigLine) {
    userSigLine.style.cursor = "pointer";
    userSigLine.style.position = "relative";
    userSigLine.style.minHeight = "80px";
    userSigLine.style.display = "flex";
    userSigLine.style.alignItems = "center";
    userSigLine.style.justifyContent = "center";
    userSigLine.style.backgroundColor = "rgba(0, 100, 255, 0.03)";
    userSigLine.innerHTML = '<span class="placeholder-text" style="color: #999; font-size: 14px;">点击此处手写签名</span>';
    
    userSigLine.addEventListener("click", openSignatureDialog);
  }

  // 3. 设置乙方公章占位 (放空)
  const sealSigLine = contractContainer.value.querySelector(".seal-signature .sig-line");
  if (sealSigLine) {
    sealSigLine.style.position = "relative";
    sealSigLine.style.minHeight = "100px";
    // 添加一个虚线圆圈代表公章位置
    const sealPlaceholder = document.createElement("div");
    sealPlaceholder.style.width = "90px";
    sealPlaceholder.style.height = "90px";
    sealPlaceholder.style.border = "2px dashed #ccc";
    sealPlaceholder.style.borderRadius = "50%";
    sealPlaceholder.style.margin = "5px auto";
    sealPlaceholder.style.display = "flex";
    sealPlaceholder.style.alignItems = "center";
    sealPlaceholder.style.justifyContent = "center";
    sealPlaceholder.style.color = "#ccc";
    sealPlaceholder.style.fontSize = "12px";
    sealPlaceholder.innerText = "乙方公章";
    sealSigLine.appendChild(sealPlaceholder);
  }
};

// 签名弹窗逻辑
const openSignatureDialog = () => {
  signatureDialogVisible.value = true;
  // 给弹窗动画留一点时间，确保能获取到正确的 DOM 尺寸
  setTimeout(() => {
    initCanvas();
  }, 300);
};

const initCanvas = () => {
  const canvas = signatureCanvas.value;
  if (!canvas) return;

  // 获取显示尺寸
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

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

const getPos = (e) => {
  const canvas = signatureCanvas.value;
  if (!canvas) return { x: 0, y: 0 };
  
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
  // 绘制前确保画布已初始化
  if (!ctx || signatureCanvas.value.width === 0) {
    initCanvas();
  }
  
  isDrawing.value = true;
  const pos = getPos(e);
  currentStrokes.value.push([pos]);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  
  // 阻止触摸时的默认行为（如滚动）
  if (e.cancelable) e.preventDefault();
};

const draw = (e) => {
  if (!isDrawing.value) return;
  const pos = getPos(e);
  const lastStroke = currentStrokes.value[currentStrokes.value.length - 1];
  if (lastStroke) {
    lastStroke.push(pos);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }
  if (e.cancelable) e.preventDefault();
};

const endDraw = () => {
  isDrawing.value = false;
};

const generateSVGString = (strokes) => {
  if (strokes.length === 0) return "";
  const width = signatureCanvas.value.width / (window.devicePixelRatio || 1);
  const height = signatureCanvas.value.height / (window.devicePixelRatio || 1);
  
  const paths = strokes.map(stroke => {
    if (stroke.length < 2) return "";
    const d = `M ${stroke[0].x} ${stroke[0].y} ` + stroke.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
    return `<path d="${d}" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`;
  }).join("");

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
  ctx.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height);
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

  updateSignaturePreview();
  signatureDialogVisible.value = false;
  currentStrokes.value = [];
};

const updateSignaturePreview = () => {
  const userSigLine = contractContainer.value.querySelector(".user-signature .sig-line");
  if (!userSigLine) return;

  // 将所有字的SVG组合在一起展示
  const combinedHtml = savedCharacterSVGs.value.map(svg => `
    <div style="height: 60px; width: 60px; margin-right: -10px;">
      ${svg}
    </div>
  `).join("");

  userSigLine.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; width: 100%;">
      ${combinedHtml}
    </div>
  `;
};

const clearAll = () => {
  savedCharacterSVGs.value = [];
  currentStrokes.value = [];
  if (ctx) ctx.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height);
  
  // 恢复预览区提示
  const userSigLine = contractContainer.value.querySelector(".user-signature .sig-line");
  if (userSigLine) {
    userSigLine.innerHTML = '<span class="placeholder-text" style="color: #999; font-size: 14px;">点击此处手写签名</span>';
  }
};

const submit = () => {
  const data = {
    type: type.value,
    fields: {},
    signatures: savedCharacterSVGs.value, // 每个字的SVG字符串数组
  };

  // Collect fields
  const values = contractContainer.value.querySelectorAll(".value");
  values.forEach((el, i) => {
    data.fields[`field_${i}`] = el.innerText.trim();
  });

  console.log("Submitted Data:", data);
  if (data.signatures.length === 0) {
    alerts("提示", "请先签署您的名字");
    return;
  }

  alerts("成功", "合同内容及签名SVG已生成，详见控制台");
};

onMounted(fetchTemplate);
</script>

<template>
  <div class="signature-view-container min-h-screen bg-gray-100 p-2 md:p-4">
    <div v-if="error" class="max-w-3xl mx-auto">
      <Message severity="error">{{ error }}</Message>
    </div>

    <div v-else-if="loading" class="flex flex-column align-items-center justify-content-center p-8">
      <i class="pi pi-spin pi-spinner" style="font-size: 3rem"></i>
      <p class="mt-4 text-xl">正在加载合同模板...</p>
    </div>

    <div v-else class="max-w-4xl mx-auto">
      <!-- Toolbar -->
        style="
          z-index: 1000;
          background-color: var(--p-content-background, white);
        "
        <div class="flex align-items-center gap-2">
          <Button icon="pi pi-arrow-left" severity="secondary" rounded @click="$router.back()" />
          <h1 class="text-xl font-bold m-0">{{ type === 'contract' ? '委托授权合同' : '个人信息授权同意书' }}</h1>
        </div>
        <div class="flex gap-2">
            label="清除签名"
          <Button label="确认提交" icon="pi pi-check" @click="submit" />
        </div>
      </div>

        <!-- 注入类型 -->
        <component :is="'style'">
          {{ contractStyle }}
          .contract-body-view .editable-field { 
            background-color: rgba(255, 255, 0, 0.05); 
            min-width: 60px; 
            display: inline-block; 
            border-bottom: 1px dashed #ccc;
          }
          .contract-body-view .editable-field:hover { background-color: rgba(255, 255, 0, 0.15) !important; }
          .contract-body-view .editable-field:focus { background-color: white !important; outline: 1px solid #007bff; }
          .contract-body-view .contract-wrapper { border: none !important; padding: 40px !important; }
          @media (max-width: 600px) { .contract-body-view .contract-wrapper { padding: 20px !important; } }
        </component>

        <div class="contract-body-view" ref="contractContainer">
          <div class="contract-wrapper" v-html="contractHtml"></div>
        </div>
      </div>
    </div>

    <!-- 签字弹窗 -->
    <Dialog v-model:visible="signatureDialogVisible" header="手写签名（请逐字书写）" :modal="true" :draggable="false" 
            class="signature-dialog" :breakpoints="{'960px': '95vw', '640px': '100vw'}" :style="{width: '450px'}">
      <div class="flex flex-column align-items-center">
        <div class="signature-board-container bg-gray-100 border-1 border-300 border-round overflow-hidden" 
             style="width: 100%; aspect-ratio: 1/1; position: relative; touch-action: none;">
          <canvas ref="signatureCanvas" 
                  @mousedown="startDraw" @mousemove="draw" @mouseup="endDraw" @mouseleave="endDraw"
                  @touchstart="startDraw" @touchmove="draw" @touchend="endDraw"
                  style="width: 100%; height: 100%; cursor: crosshair;"></canvas>
          <div class="absolute top-0 right-0 p-2 text-400 pointer-events-none">
            签字区域
          </div>
        </div>
        
        <div class="flex w-full mt-4 gap-3">
          <Button label="下一字" icon="pi pi-plus" class="flex-1" severity="secondary" @click="nextCharacter" />
          <Button label="完成签名" icon="pi pi-check" class="flex-1" @click="completeSignature" />
        </div>
        
        <div v-if="savedCharacterSVGs.length > 0" class="w-full mt-3 p-2 border-top-1 border-200">
          <p class="text-sm text-600 m-0 mb-2">预览 (已写 {{savedCharacterSVGs.length}} 字):</p>
          <div class="flex flex-wrap gap-3 bg-white p-2 border-round">
            <div v-for="(svg, idx) in savedCharacterSVGs" :key="idx" 
                 class="relative bg-gray-50 border-1 border-200 border-round p-1" 
                 style="width: 45px; height: 45px;">
              <div v-html="svg" class="w-full h-full"></div>
              <!-- 柔和灰色删除按钮 -->
              <Button icon="pi pi-times" rounded 
                      class="absolute p-0 flex align-items-center justify-content-center" 
                      style="top: -6px; right: -6px; width: 16px; height: 16px; min-width: auto; font-size: 8px; background: #94a3b8; color: #fff; border: none; cursor: pointer; opacity: 0.8;"
                      @click="removeCharacter(idx)" />
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.contract-body-view {
  font-family: "SimSun", "Songti SC", "STSong", serif;
  color: #000;
  line-height: 1.6;
}

:deep(.signature-dialog .p-dialog-content) {
  padding-bottom: 2rem;
}

/* 移动端全屏 */
@media screen and (max-width: 640px) {
  :deep(.signature-dialog) {
    height: 100%;
    max-height: 100%;
    border-radius: 0;
  }
}
</style>