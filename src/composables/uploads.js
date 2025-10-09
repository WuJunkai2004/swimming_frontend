/**
 * Upload an image file
 * @param {string} token 
 * @param {File} file 
 * @returns {Promise<Response>}
 */
export function uploadImage(token, file){
    const formData = new FormData();
    formData.append('token', token);
    formData.append('file', file, file.name || 'image.png');
    return fetch('/admin/uploadImage', {
        method: 'POST',
        body: formData
    });
}

/**
 * Upload a video file
 * @param {string} token
 * @param {File} file
 * @returns {Promise<Response>}
 */
export function uploadVideo(token, file){
    const formData = new FormData();
    formData.append('token', token);
    formData.append('file', file, file.name || 'video.mp4');
    return fetch('/admin/uploadVideo', {
        method: 'POST',
        body: formData
    });
}