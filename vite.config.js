import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";

import Components from "unplugin-vue-components/vite";
import { PrimeVueResolver } from "@primevue/auto-import-resolver";

import { vueApiPlugin, vueApiProxy } from "./src/api/api.js";

const DEV_MODE = process.env.VITE_DEV_MODE;
const backendTarget = "http://124.220.58.44:10086";

if (DEV_MODE) {
  console.log(`Vite 正在以 ${DEV_MODE} 模式启动`);
} else {
  console.log("Vite 正在打包编译");
}

// https://vite.dev/config/
export default defineConfig({
  css: {
    devSourcemap: false, // 关闭 CSS source map
  },
  plugins: [
    vue(),
    ...(DEV_MODE === "mock" ? [vueApiPlugin()] : []),
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
  server: {
    proxy: DEV_MODE === "proxy" ? vueApiProxy(backendTarget) : null,
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
});
