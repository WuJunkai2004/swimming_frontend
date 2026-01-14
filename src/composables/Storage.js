export function saveData(key, value, expiryHours = 24) {
  try {
    const data = {
      value: value,
      expiry: Date.now() + expiryHours * 60 * 60 * 1000,
    };
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
  } catch (e) {
    console.error("Serialization failed:", e);
    throw new Error("无法序列化数据，保存失败");
  }
}

export function getData(key) {
  const item = localStorage.getItem(key);
  if (!item) {
    return null;
  }

  try {
    const data = JSON.parse(item);

    if (data.expiry && Date.now() > data.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return data.value;
  } catch (e) {
    console.error("Data parsing failed:", e);
    return null;
  }
}
