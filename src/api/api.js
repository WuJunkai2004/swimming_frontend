import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

function loadApiConfig() {
  // See ./README.md for the expected structure of these JSON files
  const __filename = fileURLToPath(import.meta.url);
  const apiDir = path.dirname(__filename);
  const apiConfigs = {};
  try{
    const files = fs.readdirSync(apiDir);
    for(const filename of files) {
      if(!filename.endsWith('.json')){
        continue;
      }
      const filePath = path.join(apiDir, filename);
      const moduleName = path.basename(filename, '.json');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const apiData = JSON.parse(fileContent);
      apiConfigs[`/${moduleName}`] = apiData;
    }
  } catch (err) {
    console.error('Error loading API config:', err);
  }
  console.log('Loaded API config:', Object.keys(apiConfigs));
  return apiConfigs;
}



export function vueApiPlugin() {
  const apiConfig = loadApiConfig();
  return {
    name: 'vue-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        for (const apiPath in apiConfig) {
          const apiUrl = apiConfig[apiPath].url || apiPath;
          if (req.url === apiUrl ||
              req.url.startsWith(apiUrl + '?') ||
              req.url.startsWith(apiUrl + '/')) {
            const api = apiConfig[apiPath];
            if (api.method && !api.method.includes(req.method)) {
              res.statusCode = 405; // Method Not Allowed
              res.end(JSON.stringify(api.fail || { message: 'Method Not Allowed' }));
              return;
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(api.response || {}));
            return;
          }
        }
        next();
      });
    }
  }
}


export function vueApiProxy(target){
  const apiConfig = loadApiConfig();
  const proxyConfig = {};

  for (const key in apiConfig) {
    let api = apiConfig[key];
    let path = api.url || key;
    if(!path.startsWith('/')){
      path = '/' + path;
    }
    proxyConfig[path] = {
      target: target,
      changeOrigin: true,
    };
  }

  return proxyConfig;
}
