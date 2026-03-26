import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";

import Components from "unplugin-vue-components/vite";
import { PrimeVueResolver } from "@primevue/auto-import-resolver";

import { vueApiPlugin, vueApiProxy } from "./src/api/api.js";

// https://vite.dev/config/
const config = {
  css: {
    devSourcemap: false, // 关闭 CSS source map
  },
  plugins: [
    vue(),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: "dist/stats.html",
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log"],
        passes: 3,
        unsafe: true,
        unsafe_math: true,
      },
      mangle: {
        toplevel: true,
      },
      format: {
        comments: false,
      },
      module: true,
    },
    sourcemap: false,
  },
};

export default defineConfig((mode) => {
  console.log(`Vite 配置正在以 [${mode.mode}] 模式加载`);
  let finalConfig = { ...config };
  if (mode === 'development') {
    finalConfig.plugins.push(vueApiPlugin());
  }
  if (mode.mode === "debug") {
    const env = loadEnv("production", process.cwd(), "");
    if (!env.backend) {
      throw new Error("请在 .env 文件中设置 backend 变量，例如：backend=http://localhost:3000");
    }
    finalConfig.server = {
      proxy: vueApiProxy(env.backend),
    }
  }
  return finalConfig;
});
