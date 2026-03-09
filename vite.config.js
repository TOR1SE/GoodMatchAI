import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueInspector from 'vite-plugin-vue-inspector'

export default defineConfig({
  plugins: [
    vue(),
    VueInspector({
      toggleKeyCombo: 'ctrl-shift-click'
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://114.132.59.90:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
