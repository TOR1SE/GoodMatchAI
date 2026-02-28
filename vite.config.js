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
        target: 'http://f3aeab96.xq0.cn:16368',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
