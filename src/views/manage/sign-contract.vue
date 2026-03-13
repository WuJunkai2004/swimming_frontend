<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
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

// 签名数据
const signaturePads = ref([]); // { canvas, ctx, strokes, rect }

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

  // Extract style
  const styles = doc.querySelectorAll("style");
  let combinedStyle = "";
  styles.forEach((s) => (combinedStyle += s.textContent));
  // Scope style to our container
  contractStyle.value = combinedStyle.replace(/body/g, ".contract-body-view");

  // Extract wrapper
  let innerHtml = "";
  const wrapper = doc.querySelector(".contract-wrapper");
  if (wrapper) {
    innerHtml = wrapper.innerHTML;
  } else {
    error.value = "模板格式错误：缺少 .contract-wrapper 元素";
    alerts("错误", error.value);
    return;
  }

  // 功能：将模板中的 "____年__月__日" 替换为北京时间的今天日期
  contractHtml.value = innerHtml.replace(/_+年_+月_+日/g, getDateString());
  loading.value = false;

  nextTick(initInteractivity);
};

const initInteractivity = () => {
  if (!contractContainer.value) {
    console.warn("[SignatureView] 容器尚未就绪，无法初始化交互");
    return;
  }

  // Make .value fields editable
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

  // Init signature pads on .sig-line
  const sigLines = contractContainer.value.querySelectorAll(".sig-line");
  sigLines.forEach((line, index) => {
    initSignaturePad(line, index);
  });
};

const initSignaturePad = (line, index) => {
  line.style.position = "relative";
  line.style.minHeight = "60px"; // Give some room for signature
  line.style.cursor = "crosshair";
  line.style.display = "block";

  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.top = "-40px"; // Allow signing above the line
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100px";
  canvas.style.zIndex = "10"; // 签名层低于输入层

  const ratio = window.devicePixelRatio || 1;
  canvas.width = line.offsetWidth * ratio;
  canvas.height = 100 * ratio;

  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";

  line.appendChild(canvas);

  const pad = {
    canvas,
    ctx,
    strokes: [],
    isDrawing: false,
    currentStroke: [],
  };

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDraw = (e) => {
    pad.isDrawing = true;
    const pos = getPos(e);
    pad.currentStroke = [pos];
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    if (e.touches) e.preventDefault();
  };

  const draw = (e) => {
    if (!pad.isDrawing) return;
    const pos = getPos(e);
    pad.currentStroke.push(pos);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    if (e.touches) e.preventDefault();
  };

  const endDraw = () => {
    if (!pad.isDrawing) return;
    pad.isDrawing = false;
    if (pad.currentStroke.length > 0) {
      pad.strokes.push([...pad.currentStroke]);
    }
  };

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", draw);
  window.addEventListener("mouseup", endDraw);

  canvas.addEventListener("touchstart", startDraw, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });
  canvas.addEventListener("touchend", endDraw);

  const cleanup = () => {
    window.removeEventListener("mouseup", endDraw);
  };

  signaturePads.value.push({ ...pad, cleanup });
};

onUnmounted(() => {
  signaturePads.value.forEach((pad) => {
    if (pad.cleanup) pad.cleanup();
  });
});

const clearSignature = () => {
  signaturePads.value.forEach((pad) => {
    pad.ctx.clearRect(0, 0, pad.canvas.width, pad.canvas.height);
    pad.strokes = [];
  });
};

const generateSVG = (pad) => {
  if (pad.strokes.length === 0) return "";
  const ratio = window.devicePixelRatio || 1;
  const paths = pad.strokes.map((stroke) => {
    if (stroke.length < 2) return "";
    const d = `M ${stroke[0].x} ${stroke[0].y} ${stroke
      .slice(1)
      .map((p) => `L ${p.x} ${p.y}`)
      .join(" ")}`;
    return `<path d="${d}" fill="none" stroke="black" stroke-width="2" />`;
  });

  return `
    <svg viewBox="0 0 ${pad.canvas.width / ratio} ${pad.canvas.height / ratio}" xmlns="http://www.w3.org/2000/svg">
      ${paths.join("\n")}
    </svg>
  `;
};

const submit = () => {
  const data = {
    type: type.value,
    fields: {},
    signatures: [],
  };

  // Collect fields
  const values = contractContainer.value.querySelectorAll(".value");
  values.forEach((el, i) => {
    data.fields[`field_${i}`] = el.innerText.trim();
  });

  // Collect signatures
  signaturePads.value.forEach((pad, i) => {
    const svg = generateSVG(pad);
    if (svg) {
      data.signatures.push({
        index: i,
        svg: svg,
      });
    }
  });

  console.log("Submitted Data:", data);
  if (data.signatures.length === 0) {
    alerts("提示", "请先签署您的名字");
    return;
  }

  alerts("提示", "内容已提交，详见控制台输出");
};

onMounted(fetchTemplate);
</script>

<template>
  <div class="signature-view-container min-h-screen bg-gray-100 p-2 md:p-4">
    <div v-if="error" class="max-w-3xl mx-auto">
      <Message severity="error">{{ error }}</Message>
    </div>

    <div
      v-else-if="loading"
      class="flex flex-column align-items-center justify-content-center p-8"
    >
      <i class="pi pi-spin pi-spinner" style="font-size: 3rem"></i>
      <p class="mt-4 text-xl">正在加载合同模板...</p>
    </div>

    <div v-else class="max-w-4xl mx-auto">
      <!-- Toolbar -->
      <div
        class="sticky top-0 shadow-2 p-3 mb-4 border-round flex flex-wrap gap-2 align-items-center justify-content-between"
        style="
          z-index: 1000;
          background-color: var(--p-content-background, white);
        "
      >
        <div class="flex align-items-center gap-2">
          <Button
            icon="pi pi-arrow-left"
            severity="secondary"
            rounded
            @click="$router.back()"
          />
          <h1 class="text-xl font-bold m-0">
            {{ type === "contract" ? "委托授权合同" : "个人信息授权同意书" }}
          </h1>
        </div>
        <div class="flex gap-2">
          <Button
            label="清除签名"
            icon="pi pi-refresh"
            severity="warning"
            outlined
            @click="clearSignature"
          />
          <Button label="确认提交" icon="pi pi-check" @click="submit" />
        </div>
      </div>

      <div
        class="contract-document shadow-6 bg-white border-round mb-8 overflow-hidden"
      >
        <!-- 注入类型 -->
        <component :is="'style'">
          {{ contractStyle }}
          .contract-body-view .editable-field:hover { background-color:
          rgba(255, 255, 0, 0.2) !important; } .contract-body-view
          .editable-field:focus { background-color: rgba(0, 123, 255, 0.05)
          !important; outline: 2px solid #007bff; outline-offset: 2px; }
          .contract-body-view .contract-wrapper { border: none !important;
          padding: 30px !important; } @media (max-width: 600px) {
          .contract-body-view .contract-wrapper { padding: 15px !important; } }
        </component>

        <div class="contract-body-view" ref="contractContainer">
          <div class="contract-wrapper" v-html="contractHtml"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Global style overrides for the contract view to ensure it looks like a document */
.contract-body-view {
  font-family: "SimSun", "Songti SC", "STSong", serif;
  color: #000;
  line-height: 1.6;
}

.signature-view-container .p-message {
  margin-top: 2rem;
}

/* Ensure signature canvas is responsive */
.sig-line canvas {
  width: 100% !important;
}

/* 确保可编辑字段在所有状态下都可交互 */
.editable-field {
  pointer-events: auto !important;
}
</style>
