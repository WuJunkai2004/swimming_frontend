import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { visualizer } from 'rollup-plugin-visualizer'

import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'

import { vueApiPlugin, vueApiProxy } from './src/api/api.js'

const DEV_MODE = process.env.VITE_DEV_MODE
const backendTarget = 'http://106.15.90.163:10086'

if(DEV_MODE){
  console.log(`Vite 正在以 ${DEV_MODE} 模式启动`)
} else {
  console.log("Vite 正在打包编译")
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    ...(DEV_MODE === 'mock' ? [vueApiPlugin()] : []),
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
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
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: DEV_MODE === 'proxy' ? vueApiProxy(backendTarget) : null
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
  },
})
