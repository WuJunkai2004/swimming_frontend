/**
 * 一个通用的、自适应的 SHA-256 哈希函数。
 * 它会优先使用浏览器原生 Crypto API，仅在不安全的环境 (HTTP) 下，
 * 才会异步加载 crypto-js 作为备用。
 * @param {string} message - 需要进行哈希计算的字符串
 * @returns {Promise<string>} - 返回一个 Promise，最终解析为十六进制格式的哈希字符串
 */
export async function SHA256(message){
    // window.isSecureContext 会判断目前是否为安全上下文 (HTTPS 或 localhost)
    if (window.crypto && window.crypto.subtle && window.isSecureContext) {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
        return hashHex;
    }
    // console.warn("警告：目前处于非安全上下文，正在加载 crypto-js 作为备用方案。");
    try {
        // 使用动态 import()，只有在这段 else 代码被执行时，浏览器才会去下载 crypto-js
        const sha256 = (await import('crypto-js/sha256')).default;
        const encHex = (await import('crypto-js/enc-hex')).default;
        const hash = sha256(message).toString(encHex);
        return hash;
    } catch (error) {
        console.error("动态加载 crypto-js 失败:", error);
        throw new Error("哈希计算失败，因为无法加载备用函数库。");
    }
}