/**
 * 保存数据到localStorage，支持过期时间
 * @param {string} 键
 * @param {any} 值，可以是任意可序列化的数据
 * @param {int} 过期时间，单位小时，默认24小时，如果为0则表示永不过期
 */
export function saveData(key, value, expiryHours = 24) {
  try {
    const data = {
      value: value,
      expiry: Date.now() + expiryHours * 60 * 60 * 1000,
      forever: expiryHours === 0,
    };
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (e) {
    console.error("Serialization failed:", e);
    throw new Error("无法序列化数据，保存失败");
  }
}

/**
 * 从localStorage获取数据，自动处理过期逻辑
 * @param {string} key
 * @returns {any|null} 返回存储的数据，如果不存在或已过期则返回null
 */
export function getData(key) {
  const item = localStorage.getItem(key);
  if (!item) {
    return null;
  }

  try {
    const data = JSON.parse(item);

    if (!data.forever && data.expiry && Date.now() > data.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return data.value;
  } catch (e) {
    console.error("Data parsing failed:", e);
    return null;
  }
}

/**
 * 删除localStorage中的数据
 * @param {string} key
 */
export function removeData(key) {
  localStorage.removeItem(key);
}