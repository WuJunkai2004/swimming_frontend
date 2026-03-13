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
const contractTitle = ref("");

// 签名相关状态
const signatureRef = ref(null);
const signDialogVisible = ref(false);
const signPlaceholder =
  '<span class="placeholder-text" style="color: #999; font-size: 14px;">点击此处手写签名</span>';

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

  contractTitle.value = doc.title || "合同文档";

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

  values.forEach((element) => {
    element.setAttribute("contenteditable", "true");
    element.classList.add("editable-field");
    element.style.backgroundColor = "rgba(255, 255, 0, 0.05)";
    element.style.cursor = "text";
    element.style.minWidth = "40px";
    element.style.display = "inline-block";
    element.style.position = "relative";
    element.style.zIndex = "20"; // 确保在签名层之上

    // 添加点击触发器
    element.addEventListener("click", element.focus);
  });

  // 2. 设置用户签名区交互 (只针对 .user-signature)
  const userSigLine = contractContainer.value.querySelector(
    ".user-signature .sig-line",
  );
  if (userSigLine) {
    userSigLine.style.cursor = "pointer";
    userSigLine.style.position = "relative";
    userSigLine.style.minHeight = "80px";
    userSigLine.style.display = "flex";
    userSigLine.style.alignItems = "center";
    userSigLine.style.justifyContent = "center";
    userSigLine.style.backgroundColor = "rgba(0, 100, 255, 0.03)";
    userSigLine.innerHTML = signPlaceholder;

    userSigLine.addEventListener(
      "click",
      () => (signDialogVisible.value = true),
    );
  }

  // 3. 设置乙方公章占位 (放空)
  const sealSigLine = contractContainer.value.querySelector(
    ".seal-signature .sig-line",
  );
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

const updateSignaturePreview = () => {
  const userSigLine = contractContainer.value.querySelector(
    ".user-signature .sig-line",
  );
  if (!userSigLine) {
    return;
  }

  // 将所有字的SVG组合在一起展示
  const combinedHtml = signatureRef.value
    .getSignatures()
    .map(
      (svg) => `
    <div style="height: 60px; width: 60px; margin-right: -10px;">
      ${svg}
    </div>
  `,
    )
    .join("");

  // 如果没有签名，则显示提示文本
  if (combinedHtml.trim() === "") {
    userSigLine.innerHTML = signPlaceholder;
    return;
  }

  userSigLine.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; width: 100%;">
      ${combinedHtml}
    </div>
  `;
};

const clearAll = () => {
  signatureRef.value.clearSignatures();

  // 恢复预览区提示
  const userSigLine = contractContainer.value.querySelector(
    ".user-signature .sig-line",
  );
  if (userSigLine) {
    userSigLine.innerHTML = signPlaceholder;
  }
};

const submit = () => {
  const data = {
    type: type.value,
    fields: {},
    signatures: signatureRef.value.getSignatures(), // 每个字的SVG字符串数组
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
          <h1 class="text-xl font-bold m-0">{{ contractTitle }}</h1>
        </div>
        <div class="flex gap-2">
          <Button
            label="清除签名"
            icon="pi pi-refresh"
            severity="warning"
            outlined
            @click="clearAll"
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

    <SignDialog
      ref="signatureRef"
      v-model:visible="signDialogVisible"
      @complete="updateSignaturePreview"
    />
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
