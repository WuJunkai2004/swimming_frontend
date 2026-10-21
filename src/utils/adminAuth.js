import { saveData, getData, removeData } from "./useStorage";

const TOKEN_KEY = "token";
// 提前刷新的余量，避免拿到即将过期的 token 发起请求
const EXPIRY_LEEWAY_MS = 5 * 60 * 1000;

let refreshingPromise = null;

export function getAccessToken() {
  return getData(TOKEN_KEY);
}

export function saveAccessToken(token, expiryHours = 24) {
  saveData(TOKEN_KEY, token, expiryHours);
}

export function clearAccessToken() {
  removeData(TOKEN_KEY);
}

/**
 * 解析 JWT payload 中的 exp（秒级时间戳），解析失败返回 null
 */
export function decodeTokenExp(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

/**
 * token 是否缺失或临近过期
 */
export function isTokenStale(token) {
  if (!token) return true;
  const exp = decodeTokenExp(token);
  if (exp === null) return false; // 非 JWT 格式，交给服务端 425 判定
  return exp * 1000 - Date.now() < EXPIRY_LEEWAY_MS;
}

function redirectToLogin() {
  if (!window.location.pathname.startsWith("/login")) {
    window.location.assign("/login");
  }
}

/**
 * 调用 /admin/refresh 轮换双 token。
 * 成功返回新 accessToken 并落盘；refreshToken 失效（461）时清空本地会话并跳转登录页；
 * 网络错误时不销毁会话，返回 null 由调用方自行处理。
 * 并发调用共享同一次刷新请求（轮换策略下旧 refreshToken 会立即失效，必须去重）。
 */
export async function refreshAccessToken() {
  if (!refreshingPromise) {
    refreshingPromise = (async () => {
      try {
        const res = await fetch("/admin/refresh", {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();
        const token = data?.data?.accessToken || data?.data?.token;
        if (data?.statusCode === 200 && token) {
          saveAccessToken(token);
          return token;
        }
        if (data?.statusCode === 461) {
          clearAccessToken();
          redirectToLogin();
        }
        return null;
      } catch {
        return null;
      } finally {
        refreshingPromise = null;
      }
    })();
  }
  return refreshingPromise;
}

/**
 * 进入管理后台前确保会话有效：
 * token 缺失或临近过期时尝试用 refreshToken Cookie 静默换新；
 * 刷新失败（refreshToken 也失效）则清空会话并跳转登录页。
 */
export async function ensureAdminSession() {
  const token = getAccessToken();
  if (!isTokenStale(token)) return token;
  return await refreshAccessToken();
}
