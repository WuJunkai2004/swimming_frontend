import { refreshAccessToken } from "./adminAuth.js";

/**
 * 上传文件到 /admin/* 接口，accessToken 过期（425）时自动换新并重试一次
 * @param {string} path
 * @param {string} token
 * @param {File} file
 * @param {string} fallbackName
 * @returns {Promise<Response>}
 */
async function uploadWithRetry(path, token, file, fallbackName) {
    const buildFormData = (tk) => {
        const formData = new FormData();
        formData.append('token', tk);
        formData.append('file', file, file.name || fallbackName);
        return formData;
    };
    const send = (tk) => fetch(path, {
        method: 'POST',
        credentials: 'include',
        body: buildFormData(tk),
    });

    let response = await send(token);
    let statusCode = null;
    try {
        statusCode = (await response.clone().json()).statusCode;
    } catch {
        // 非 JSON 响应，原样返回
    }
    if (statusCode === 425) {
        const newToken = await refreshAccessToken();
        if (newToken) {
            response = await send(newToken);
        }
    }
    return response;
}

/**
 * Upload an image file
 * @param {string} token
 * @param {File} file
 * @returns {Promise<Response>}
 */
export function uploadImage(token, file){
    return uploadWithRetry('/admin/uploadImage', token, file, 'image.png');
}

/**
 * Upload a video file
 * @param {string} token
 * @param {File} file
 * @returns {Promise<Response>}
 */
export function uploadVideo(token, file){
    return uploadWithRetry('/admin/uploadVideo', token, file, 'video.mp4');
}
