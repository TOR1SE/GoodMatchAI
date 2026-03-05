<template>
  <div class="bullet-message-section">
    <div class="container">
      <h2 class="section-title">
        <span class="heart-icon">✨</span>
        {{ disasterName }}的暖心留言墙
        <span class="heart-icon">✨</span>
      </h2>
      <p class="section-subtitle">为{{ disasterName }}的乡亲们送去你的鼓励与祝福</p>
      
      <!-- 弹幕展示区域 -->
      <div class="bullet-screen" ref="bulletScreen">
        <div 
          v-for="bullet in visibleBullets" 
          :key="bullet.displayId"
          class="bullet-item"
          :style="getBulletStyle(bullet)"
        >
          <span class="bullet-content">{{ bullet.content }}</span>
        </div>
      </div>
      
      <!-- 输入区域 -->
      <div class="input-area">
        <div class="input-row">
          <input 
            v-model="message" 
            type="text" 
            placeholder="写下你的暖心祝福..." 
            class="message-input-full"
            maxlength="50"
            @keyup.enter="sendMessage"
          />
          <button @click="sendMessage" class="send-btn" :disabled="!message.trim() || loading">
            <span>{{ loading ? '发送中...' : '发送' }}</span>
            <span class="send-icon">✉️</span>
          </button>
        </div>
        <p class="input-hint">{{ message.length }}/50 字</p>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  createBoardMessage, 
  getBoardList, 
  getBoardsBySection, 
  getActiveSections, 
  createSection,
  getArticleList,
  getArticleDetail,
  createDisasterArea,
  generateArticle
} from '../services/api.js'

export default {
  name: 'BulletMessage',
  props: {
    disasterId: {
      type: Number,
      required: true
    },
    disasterName: {
      type: String,
      default: '灾区'
    },
    sectionId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      message: '',
      bullets: [],
      visibleBullets: [],
      bulletIdCounter: 0,
      screenHeight: 180,
      trackHeight: 35,
      tracks: 5,
      trackOccupancy: {},
      loading: false,
      currentSectionId: '', // 从路由参数获取的 sectionId
      // WebSocket 相关
      ws: null,
      wsConnected: false,
      clientId: ''
    }
  },
  computed: {
    canSend() {
      return this.message.trim() && !this.loading
    }
  },
  watch: {
    disasterId() {
      // 当灾区ID变化时，重新加载弹幕
      this.loadBullets()
      this.visibleBullets = []
    },
    sectionId(newVal) {
      // 当分区ID变化时，更新 currentSectionId 并重新加载
      console.log('sectionId 变化:', newVal)
      this.currentSectionId = newVal || ''
      this.loadBullets()
      this.visibleBullets = []
      // 如果 WebSocket 已连接，重新订阅
      if (this.wsConnected && this.currentSectionId) {
        console.log('sectionId 变化，重新订阅分区:', this.currentSectionId)
        this.subscribeSection(this.currentSectionId)
      }
    },
    '$route.query.sectionId'(newVal) {
      // 当路由参数变化时，更新 sectionId 并重新加载
      this.currentSectionId = newVal || ''
      this.loadBullets()
      this.visibleBullets = []
      // 重新订阅 WebSocket
      if (this.wsConnected) {
        this.subscribeSection(this.currentSectionId)
      }
    }
  },
  async mounted() {
    console.log('BulletMessage mounted, props:', { disasterId: this.disasterId, disasterName: this.disasterName, sectionId: this.sectionId })
    console.log('sectionId 值:', this.sectionId, '是否为空:', !this.sectionId)
    
    // 使用 props 传入的 sectionId（由父组件 DisasterPage 统一管理）
    this.currentSectionId = this.sectionId || ''
    console.log('使用 props 传入的 sectionId:', this.currentSectionId)
    
    // 先加载弹幕数据，再启动动画
    await this.loadBullets()
    this.startBulletAnimation()
    // 页面加载后立即显示3条弹幕
    this.showInitialBullets()
    // 初始化 WebSocket
    this.initWebSocket()
  },
  beforeUnmount() {
    this.stopBulletAnimation()
    // 关闭 WebSocket
    this.closeWebSocket()
  },
  methods: {
    // 获取或创建区块
    async getOrCreateSection() {
      try {
        console.log('获取活跃区块列表...')
        const res = await getActiveSections()
        
        if (res.success && res.data && res.data.length > 0) {
          // 尝试根据灾区名称匹配区块
          const matchedSection = res.data.find(section => 
            section.name === this.disasterName || 
            section.name.includes(this.disasterName)
          )
          
          if (matchedSection) {
            console.log('找到匹配的区块:', matchedSection.name, matchedSection.id)
            this.currentSectionId = matchedSection.id
          } else {
            // 没有找到匹配的，使用第一个或创建新的
            console.log('未找到匹配区块，使用第一个:', res.data[0].name)
            this.currentSectionId = res.data[0].id
          }
        } else {
          // 没有活跃区块，创建一个新的
          console.log('没有活跃区块，创建新区块:', this.disasterName)
          const createRes = await createSection({
            name: this.disasterName,
            description: `${this.disasterName}留言墙`
          })
          
          if (createRes.success) {
            console.log('创建区块成功:', createRes.data.id)
            this.currentSectionId = createRes.data.id
          } else {
            console.error('创建区块失败:', createRes.message)
            this.currentSectionId = ''
          }
        }
      } catch (error) {
        console.error('获取或创建区块失败:', error)
        this.currentSectionId = ''
      }
    },
    
    async loadBullets() {
      try {
        // 没有 sectionId 时不加载留言
        if (!this.currentSectionId) {
          console.log('没有 sectionId，不加载留言')
          this.bullets = []
          return
        }
        
        console.log('根据 sectionId 获取分区留言:', this.currentSectionId)
        const res = await getBoardsBySection(this.currentSectionId)
        
        console.log('获取留言返回:', res)
        
        if (res.success && res.data && res.data.list) {
          this.bullets = res.data.list.map(item => ({
            id: item.id,
            content: item.description,
            time: new Date(item.create_time || item.createTime).getTime(),
            uid: item.uid,
            section_id: item.section_id
          }))
          console.log('加载留言成功:', this.bullets.length, '条')
        } else {
          console.log('返回数据格式不对:', res)
          this.bullets = []
        }
      } catch (error) {
        console.error('加载留言失败:', error)
        this.bullets = []
      }
    },
    async sendMessage() {
      if (!this.canSend) return
      
      this.loading = true
      
      try {
        // 调用后端接口创建留言，带上 section_id
        const messageData = {
          description: this.message.trim()
        }
        // 如果有 section_id，添加到请求数据中
        if (this.currentSectionId) {
          messageData.section_id = this.currentSectionId
        }
        const res = await createBoardMessage(messageData)
        
        if (res.success) {
          // 创建成功后，本地显示新留言
          // 注意：不需要重新加载列表，WebSocket 会广播给所有用户
          const newBullet = {
            id: res.data.id,
            content: this.message.trim(),
            time: Date.now(),
            section_id: this.currentSectionId
          }
          this.addBulletToScreen(newBullet)
          
          this.message = ''
        }
      } catch (error) {
        alert(error.message || '发送留言失败')
      } finally {
        this.loading = false
      }
    },
    addBulletToScreen(bullet) {
      // 找到未被占用的轨道，增加间隔避免重叠
      let trackIndex = 0;
      let attempts = 0;
      const minInterval = 6000; // 同轨道最小间隔6秒，大幅减少重叠
      
      do {
        trackIndex = Math.floor(Math.random() * this.tracks);
        attempts++;
      } while (this.isTrackOccupied(trackIndex, minInterval) && attempts < this.tracks * 3);
      
      // 如果所有轨道都被占用，这次就不发送了
      if (attempts >= this.tracks * 3) {
        return;
      }
      
      // 记录轨道占用时间
      if (!this.trackOccupancy[trackIndex]) {
        this.trackOccupancy[trackIndex] = [];
      }
      this.trackOccupancy[trackIndex].push(Date.now());
      
      // 清理过期的占用记录
      this.trackOccupancy[trackIndex] = this.trackOccupancy[trackIndex].filter(
        time => Date.now() - time < minInterval
      );
      
      const bulletWithPosition = {
        ...bullet,
        displayId: this.bulletIdCounter++,
        top: trackIndex * this.trackHeight + 10,
        left: 110, // 从更右边开始，给更多间隔
        speed: 0.06 + Math.random() * 0.03, // 稍微快一点的速度
        trackIndex: trackIndex,
        opacity: 1,
        isFadingOut: false
      }
      
      this.visibleBullets.push(bulletWithPosition)
      
      // 35秒后开始淡出
      setTimeout(() => {
        const index = this.visibleBullets.findIndex(b => b.displayId === bulletWithPosition.displayId)
        if (index > -1) {
          this.visibleBullets[index].isFadingOut = true
        }
      }, 35000)
      
      // 38秒后完全移除
      setTimeout(() => {
        const index = this.visibleBullets.findIndex(b => b.displayId === bulletWithPosition.displayId)
        if (index > -1) {
          this.visibleBullets.splice(index, 1)
        }
      }, 38000)
    },
    isTrackOccupied(trackIndex, minInterval) {
      if (!this.trackOccupancy[trackIndex]) return false;
      const recentOccupancy = this.trackOccupancy[trackIndex].filter(
        time => Date.now() - time < minInterval
      );
      return recentOccupancy.length > 0;
    },
    startBulletAnimation() {
      let lastTime = Date.now()
      
      const animate = () => {
        const now = Date.now()
        const deltaTime = now - lastTime
        lastTime = now
        
        this.visibleBullets.forEach(bullet => {
          bullet.left -= bullet.speed * deltaTime / 16
          // 淡出效果
          if (bullet.isFadingOut && bullet.opacity > 0) {
            bullet.opacity -= 0.02 * deltaTime / 16
            if (bullet.opacity < 0) bullet.opacity = 0
          }
        })
        
        this.visibleBullets = this.visibleBullets.filter(bullet => bullet.left > -50)
        
        if (Math.random() < 0.004 && this.bullets.length > 0) {
          const randomBullet = this.bullets[Math.floor(Math.random() * this.bullets.length)]
          this.addBulletToScreen(randomBullet)
        }
        
        this.animationFrame = requestAnimationFrame(animate)
      }
      
      this.animationFrame = requestAnimationFrame(animate)
    },
    stopBulletAnimation() {
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame)
      }
    },
    getBulletStyle(bullet) {
      return {
        top: `${bullet.top}px`,
        left: `${bullet.left}%`,
        color: '#333333',
        opacity: bullet.opacity !== undefined ? bullet.opacity : 1,
        transition: 'opacity 0.3s ease'
      }
    },
    formatTime(timestamp) {
      const date = new Date(timestamp)
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
    },
    showInitialBullets() {
      // 页面加载后立即显示3条弹幕，错开时间
      if (this.bullets.length > 0) {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const randomBullet = this.bullets[Math.floor(Math.random() * this.bullets.length)]
            this.addBulletToScreen(randomBullet)
          }, i * 800) // 每800ms显示一条
        }
      }
    },

    // ==================== WebSocket 方法 ====================

    // 初始化 WebSocket
    initWebSocket() {
      const wsUrl = 'ws://f3aeab96.xq0.cn:16368/api/v1/ws/boards'
      console.log('正在连接 WebSocket:', wsUrl)

      // token 放在 cookie 中，浏览器会自动携带
      // 不需要手动传递 token
      
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket 连接成功')
        // 等待 system:connected 消息后再发送认证
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleWebSocketMessage(data)
        } catch (error) {
          console.error('解析 WebSocket 消息失败:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket 错误:', error)
      }

      this.ws.onclose = () => {
        console.log('WebSocket 连接关闭')
        this.wsConnected = false
        this.clientId = ''
        // 3秒后尝试重连
        setTimeout(() => {
          if (!this.wsConnected) {
            console.log('尝试重新连接 WebSocket...')
            this.initWebSocket()
          }
        }, 3000)
      }
    },

    // 发送认证消息
    sendAuthMessage() {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // 从 localStorage 获取 token
        const token = localStorage.getItem('accessToken')
        if (!token) {
          console.error('没有 token，无法认证')
          return
        }
        const message = {
          type: 'auth',
          payload: {
            token: token
          }
        }
        this.ws.send(JSON.stringify(message))
        console.log('发送认证消息')
      }
    },

    // 订阅分区
    subscribeSection(sectionId) {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const message = {
          type: 'subscribe_section',
          payload: {
            section_id: sectionId || ''
          }
        }
        this.ws.send(JSON.stringify(message))
        console.log('发送订阅请求:', sectionId || '全部')
      }
    },

    // 处理 WebSocket 消息
    handleWebSocketMessage(data) {
      console.log('收到 WebSocket 消息:', data)

      switch (data.type) {
        case 'system:connected':
          this.clientId = data.payload.client_id
          console.log('WebSocket 已连接，client_id:', this.clientId)
          // 发送认证消息
          this.sendAuthMessage()
          break

        case 'auth_success':
          console.log('认证成功:', data.payload)
          this.wsConnected = true
          // 认证成功后订阅分区（只有 sectionId 不为空时才订阅）
          if (this.currentSectionId) {
            console.log('认证成功，准备订阅分区:', this.currentSectionId)
            this.subscribeSection(this.currentSectionId)
          } else {
            console.log('认证成功，但 currentSectionId 为空，暂不订阅')
          }
          break

        case 'auth_failed':
          console.error('认证失败:', data.payload.message)
          this.wsConnected = false
          break

        case 'board:created':
          // 收到新留言，检查是否属于当前分区
          console.log('收到新留言:', data.payload)
          console.log('当前分区:', this.currentSectionId, '留言分区:', data.payload.section_id)
          
          // 如果当前有指定分区，只显示该分区的消息
          if (this.currentSectionId && data.payload.section_id !== this.currentSectionId) {
            console.log('该留言不属于当前分区，跳过显示')
            return
          }
          
          const newBullet = {
            id: data.payload.id,
            content: data.payload.description,
            time: Date.now(),
            uid: data.payload.uId,
            section_id: data.payload.section_id
          }
          // 添加到 bullets 列表
          this.bullets.push(newBullet)
          // 显示到屏幕
          this.addBulletToScreen(newBullet)
          break

        case 'board:updated':
          // 留言被更新
          console.log('留言已更新:', data.payload)
          this.updateBulletInList(data.payload)
          break

        case 'board:deleted':
          // 留言被删除
          console.log('留言已删除:', data.payload)
          this.removeBulletFromList(data.payload.id)
          break

        case 'subscribe_section_success':
          // 订阅成功
          console.log('订阅分区成功:', data.payload)
          this.wsConnected = true
          break

        default:
          console.log('未知消息类型:', data.type)
      }
    },

    // 更新列表中的留言
    updateBulletInList(updatedMessage) {
      const index = this.bullets.findIndex(b => b.id === updatedMessage.id)
      if (index !== -1) {
        this.bullets[index].content = updatedMessage.description
      }
    },

    // 从列表中移除留言
    removeBulletFromList(id) {
      this.bullets = this.bullets.filter(b => b.id !== id)
      this.visibleBullets = this.visibleBullets.filter(b => b.id !== id)
    },

    // 关闭 WebSocket
    closeWebSocket() {
      if (this.ws) {
        this.ws.close()
        this.ws = null
      }
    }
  }
}
</script>

<style scoped>
.bullet-message-section {
  padding: 25px 0;
  background: linear-gradient(135deg, #a8d8ea 0%, #f9c89b 100%);
  border-radius: 12px;
  margin: 20px 0;
}

.section-title {
  text-align: center;
  color: white;
  font-size: 20px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.heart-icon {
  font-size: 18px;
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.section-subtitle {
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  margin-bottom: 18px;
}

.bullet-screen {
  position: relative;
  height: 175px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 18px;
  backdrop-filter: blur(10px);
}

.bullet-item {
  position: absolute;
  white-space: nowrap;
  font-size: 14px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 18px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.bullet-item:hover {
  transform: scale(1.05);
  z-index: 100;
}

.bullet-content {
  color: #666;
}

.input-area {
  padding: 0 15px;
}

.input-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.message-input-full {
  flex: 1;
  padding: 12px 18px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 25px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.9);
}

.message-input-full:focus {
  border-color: #4a90e2;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.2);
}

.message-input-full::placeholder {
  color: #999;
}

.send-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.send-icon {
  font-size: 14px;
}

.input-hint {
  text-align: right;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10px;
  margin-bottom: 0;
  padding-right: 5px;
}
</style>
