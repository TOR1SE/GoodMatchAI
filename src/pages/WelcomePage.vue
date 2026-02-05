<template>
  <div class="home-page">
    <!-- 左上角标题 -->
    <div class="home-header">
      <div class="platform-title">AI公益资源调度平台</div>
      <div class="platform-subtitle">连接爱心，精准帮扶</div>
    </div>

    <!-- 背景轮播图 -->
    <div class="background-slides">
      <div class="background-slide active"
           style="background-image: url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')">
      </div>
      <div class="background-slide"
           style="background-image: url('/jisheimages/image1.jpg')">
      </div>
      <div class="background-slide"
           style="background-image: url('/jisheimages/image2.jpg')">
      </div>
      <div class="background-slide"
           style="background-image: url('/jisheimages/image3.jpg')">
      </div>
    </div>

    <!-- 主页内容 -->
    <div class="home-content">
      <!-- 按钮容器 -->
      <div class="button-container">
        <button class="glass-button login-btn" @click="goToLogin">
          <i class="fas fa-sign-in-alt button-icon"></i>
          用户登录
        </button>
        <button class="glass-button register-btn" @click="goToRegister">
          <i class="fas fa-user-plus button-icon"></i>
          用户注册
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WelcomePage',
  mounted() {
    this.startBackgroundInterval();
  },
  beforeUnmount() {
    if (this.backgroundInterval) {
      clearInterval(this.backgroundInterval);
    }
  },
  data() {
    return {
      currentBackgroundSlide: 0,
      backgroundInterval: null
    }
  },
  methods: {
    goToLogin() {
      this.$router.push('/login');
    },
    goToRegister() {
      this.$router.push('/register');
    },
    nextBackgroundSlide() {
      const slides = document.querySelectorAll('.background-slide');
      if (slides.length === 0) return;

      slides.forEach(slide => {
        slide.classList.remove('active');
      });

      this.currentBackgroundSlide = (this.currentBackgroundSlide + 1) % slides.length;
      slides[this.currentBackgroundSlide].classList.add('active');
    },
    startBackgroundInterval() {
      this.backgroundInterval = setInterval(() => {
        this.nextBackgroundSlide();
      }, 5000);
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', 'Microsoft YaHei', 'PingFang SC', sans-serif;
}

.home-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #fdf6e3 0%, #f0f8ff 100%);
}

/* 左上角标题 - 纯白色字体 */
.home-header {
  position: absolute;
  top: 30px;
  left: 40px;
  z-index: 10;
  text-align: left;
}

.platform-title {
  font-size: 32px;
  font-weight: 900;
  margin-bottom: 8px;
  color: white;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.platform-subtitle {
  font-size: 18px;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 背景轮播图 - 增加透明度 */
.background-slides {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.background-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1.5s ease-in-out;
  background-size: cover;
  background-position: center;
  background-color: rgba(0, 0, 0, 0.3);
}

.background-slide.active {
  opacity: 1;
}

/* 半透明遮罩层 */
.background-slide::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
}

/* 主页面内容 */
.home-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  padding: 20px;
}

/* 按钮容器 */
.button-container {
  display: flex;
  gap: 50px;
  justify-content: center;
  margin-top: 40px;
}

/* 更显眼的按钮样式 */
.glass-button {
  padding: 28px 65px;
  font-size: 26px;
  font-weight: 800;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 22px;
  min-width: 280px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.5);
}

/* 按钮背景效果 - 更深的颜色 */
.glass-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
  rgba(255, 165, 0, 0.35) 0%,
  rgba(30, 144, 255, 0.35) 100%);
  z-index: -1;
}

.glass-button:hover {
  transform: translateY(-12px) scale(1.08);
  box-shadow: 0 35px 70px rgba(0, 0, 0, 0.4);
  border: 3px solid rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.45);
}

.glass-button.login-btn {
  color: #1a3c5e;
  background: rgba(255, 255, 255, 0.4);
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);
}

.glass-button.register-btn {
  color: #7a4a1a;
  background: rgba(255, 255, 255, 0.4);
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);
}

.button-icon {
  font-size: 30px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
}
</style>
