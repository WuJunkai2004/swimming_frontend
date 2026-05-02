import fs from 'node:fs';

async function generateVercelConfig() {
  const apiListPath = 'src/api/API_list.txt';
  const vercelConfigPath = 'vercel.json';
  const backendUrl = process.env.BACKEND_URL;

  console.log("开始生成 Vercel 配置文件...");

  if (!backendUrl) {
    console.error('错误：环境变量 BACKEND_URL 未设置。');
    process.exit(1);
  }

  const normalizedBackendUrl = backendUrl.replace(/\/+$/, '');
  console.log(`使用的后端测试地址: ${normalizedBackendUrl}`);

  // 确保 dist 目录存在 (保持与原 Python 脚本行为一致)
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  try {
    if (!fs.existsSync(apiListPath)) {
        console.error(`错误：${apiListPath} 不存在。`);
        process.exit(1);
    }

    const listContent = fs.readFileSync(apiListPath, 'utf-8');
    const apiPaths = listContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const rewrites = apiPaths.map(apiPath => {
      const path = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
      return {
        source: path,
        destination: `${normalizedBackendUrl}${path}`
      };
    });

    // 添加 SPA 回退路由
    rewrites.push({
      source: "/(.*)",
      destination: "/index.html"
    });

    const vercelConfig = { rewrites };

    fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2), 'utf-8');
    console.log(`成功生成 vercel.json 文件，包含 ${apiPaths.length} 个 API 重写规则。`);
  } catch (error) {
    console.error('生成 vercel.json 时出错:', error);
    process.exit(1);
  }
}

generateVercelConfig();
