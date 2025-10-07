export function uploadImage(token, title, content){
    const formData = new FormData();
    formData.append('token', token);
    formData.append('title', title);
    formData.append('content', content);
    return fetch('/admin/uploadImage', {
        method: 'POST',
        body: formData
    });
}

export function uploadVideo(token, title, content){
    const formData = new FormData();
    formData.append('token', token);
    formData.append('title', title);
    formData.append('content', content);
    return fetch('/admin/uploadVideo', {
        method: 'POST',
        body: formData
    });
}