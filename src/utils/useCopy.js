/**
 * 这是一个内部辅助函数，用于处理传统的 document.execCommand 复制方法。
 * 它不需要被导出。
 * @param {string} text - 要复制的文本
 * @returns {Promise<void>}
 */
const TraditionalCopy = (text) => {
  return new Promise((resolve, reject) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // 将 textarea 移到屏幕外，使其不可见
    textArea.style.position = "absolute";
    textArea.style.left = "-9999px";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        resolve(); // 操作成功
      } else {
        reject(new Error('使用传统方法复制失败'));
      }
    } catch (err) {
      console.error('传统方法复制时发生错误:', err);
      reject(err);
    }

    document.body.removeChild(textArea);
  });
};


/**
 * @param {string} textToCopy - 要复制的文本。
 * @returns {Promise<void>} - 操作成功时解析，失败时拒絕。
 */
export const Copying = async (textToCopy) => {
  if (!textToCopy) {
    throw new Error('没有提供要复制的文本。');
  }

  // 优先尝试使用现代的、异步的 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (err) {
      console.error('使用现代方法复制失败:', err);
      // 如果现代方法失败，尝试退回传统方法
      return TraditionalCopy(textToCopy);
    }
  } else {
    return TraditionalCopy(textToCopy);
  }
};