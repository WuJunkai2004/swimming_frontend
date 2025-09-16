import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

function loadApiConfig() {
  // load all json file in /src/api/
  // the json file should be like
/**
 * {
 *   'url': 'sport/preview' 
 *   'description': 'Get sport preview data'
 *   'method': ['GET', 'POST']
 *   'response': {
 *      The response data
 *   }
 * }
 */
  const __filename = fileURLToPath(import.meta.url);
  const apiDir = path.dirname(__filename);
  const apiConfig = {};
  try{
    const files = fs.readdirSync(apiDir);
    for(const filename of files) {
      if(!filename.endsWith('.json')){
        continue;
      }
      const filePath = path.join(apiDir, filename);
      const moduleName = filename.basename(filename, '.json');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const apiData = JSON.parse(fileContent);
      apiConfig[`/${apiData.url}`] = apiData;
    }
  } catch (err) {
    console.error('Error loading API config:', err);
  }
  console.log('Loaded API config:', Object.keys(apiConfig));
  return apiConfig;
}

const ApiConfig = loadApiConfig();

export function vueApiPlugin() {
  return {
    name: 'vue-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        for (const apiPath in ApiConfig) {
          if (req.url === apiPath || req.url === `${apiPath}/`) {
            const api = ApiConfig[apiPath];
            if (api.method && !api.method.includes(req.method)) {
              res.statusCode = 405; // Method Not Allowed
              res.end(`Method ${req.method} not allowed for ${apiPath}`);
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
