import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";

function loadApiConfig() {
  const __filename = fileURLToPath(import.meta.url);
  const apiDir = path.dirname(__filename);
  const apiListPath = path.join(apiDir, "API_list.txt");
  const apiConfigs = {};
  try {
    const listContent = fs.readFileSync(apiListPath, "utf-8");
    const lines = listContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    for (const line of lines) {
      apiConfigs[line] = { url: line };
    }
  } catch (err) {
    console.error("Error loading API list:", err);
  }
  console.log(
    "Loaded API config from API_list.txt:",
    Object.keys(apiConfigs).length,
    "endpoints",
  );
  return apiConfigs;
}

export function vueApiPlugin() {
  const apiConfig = loadApiConfig();
  return {
    name: "vue-api-plugin",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        for (const apiPath in apiConfig) {
          const apiUrl = apiConfig[apiPath].url || apiPath;
          if (
            req.url === apiUrl ||
            req.url.startsWith(apiUrl + "?") ||
            req.url.startsWith(apiUrl + "/")
          ) {
            const api = apiConfig[apiPath];
            if (api.method && !api.method.includes(req.method)) {
              res.statusCode = 405; // Method Not Allowed
              res.end(
                JSON.stringify(api.fail || { message: "Method Not Allowed" }),
              );
              return;
            }
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(api.response || {}));
            return;
          }
        }
        next();
      });
    },
  };
}

export function vueApiProxy(target) {
  const apiConfig = loadApiConfig();
  const proxyConfig = {};

  for (const key in apiConfig) {
    let api = apiConfig[key];
    let path = api.url || key;
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    proxyConfig[path] = {
      target: target,
      changeOrigin: true,
    };
  }

  return proxyConfig;
}
