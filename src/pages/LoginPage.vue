<template>
  <div class="auth-page page-enter-active">
    <!-- Toast 提示 -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      <i class="fas fa-check-circle"></i>
      <span>{{ toast.message }}</span>
    </div>
    
    <button class="auth-back-btn" @click="goToHome">
      <i class="fas fa-arrow-left"></i> 返回主页
    </button>

    <div class="auth-container">
      <!-- 左侧图片区域 -->
      <div class="auth-image-section">
        <div class="auth-image"></div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="auth-form-section">
        <div class="auth-header">
          <div class="auth-logo">
            <div class="auth-logo-icon">
              <i class="fas fa-sign-in-alt"></i>
            </div>
            <div class="auth-logo-text">
              <h2>用户登录</h2>
              <p>AI公益资源调度平台</p>
            </div>
          </div>
        </div>

        <form class="auth-form" @submit.prevent="handleLogin">
          <!-- 账号 -->
          <div class="form-group">
            <label class="form-label" for="account">账号</label>
            <div class="input-with-icon">
              <i class="fas fa-user input-icon"></i>
              <input
                type="text"
                id="account"
                class="form-control"
                placeholder="请输入账号"
                v-model="loginForm.account"
                @input="clearError('account')"
              >
            </div>
            <div v-if="errors.account" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ errors.account }}
            </div>
          </div>

          <!-- 密码 -->
          <div class="form-group">
            <label class="form-label" for="password">密码</label>
            <div class="input-with-icon">
              <i class="fas fa-lock input-icon"></i>
              <input
                type="password"
                id="password"
                class="form-control"
                placeholder="请输入密码"
                v-model="loginForm.password"
                @input="clearError('password')"
              >
            </div>
            <div v-if="errors.password" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ errors.password }}
            </div>
          </div>

          <!-- 验证码 -->
          <div class="form-group">
            <label class="form-label" for="captcha">验证码</label>
            <div class="captcha-group">
              <div class="input-with-icon captcha-input">
                <i class="fas fa-shield-alt input-icon"></i>
                <input
                  type="text"
                  id="captcha"
                  class="form-control"
                  placeholder="请输入验证码"
                  v-model="loginForm.captcha"
                  @input="clearError('captcha')"
                  maxlength="6"
                >
              </div>
              <div class="captcha-image-container">
                <div class="captcha-image" @click="refreshCaptcha">
                  <img v-if="captchaImage" :src="captchaImage" alt="验证码" style="width: 100%; height: 100%; object-fit: contain;">
                  <div v-else class="captcha-placeholder">加载中...</div>
                </div>
                <div class="refresh-captcha" @click="refreshCaptcha">
                  <i class="fas fa-sync-alt"></i> 换一张
                </div>
              </div>
            </div>
            <div v-if="errors.captcha" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ errors.captcha }}
            </div>
          </div>

          <div class="remember-forgot">
            <div class="checkbox-container">
              <input type="checkbox" id="remember" v-model="loginForm.remember">
              <label for="remember">记住登录状态</label>
            </div>
            <a href="#" class="forgot-link" @click.prevent="showForgotPassword">忘记密码？</a>
          </div>

          <!-- 提交按钮 -->
          <button type="submit" class="submit-btn" :disabled="loading">
            <i class="fas fa-sign-in-alt btn-icon"></i>
            {{ loading ? '登录中...' : '登录平台' }}
          </button>

          <div class="demo-auth">
            <button type="button" class="demo-btn" @click="fillDemoCredentials">
              <i class="fas fa-user-secret"></i> 使用演示账号快速登录
            </button>
          </div>

          <div class="switch-auth">
            还没有账号？
            <a href="#" class="register-link" @click.prevent="goToRegister">
              立即注册
            </a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { login, getCaptcha, getUserInfo } from '../services/api.js'

export default {
  name: 'LoginPage',
  data() {
    return {
      loginForm: {
        account: '',
        password: '',
        captcha: '',
        remember: false
      },
      errors: {
        account: '',
        password: '',
        captcha: ''
      },
      loading: false,
      captchaId: '',
      captchaImage: '',
      toast: {
        show: false,
        message: '',
        type: 'success',
        timer: null
      }
    }
  },
  mounted() {
    this.loadCaptcha();
  },
  methods: {
    goToHome() {
      this.$router.push('/welcome');
    },
    goToRegister() {
      this.$router.push('/register');
    },
    async loadCaptcha() {
      try {
        const res = await getCaptcha();
        if (res.success) {
          this.captchaId = res.data.captcha_id;
          this.captchaImage = res.data.captcha_image;
        }
      } catch (error) {
        console.error('获取验证码失败:', error);
        alert('获取验证码失败，请刷新页面重试');
      }
    },
    refreshCaptcha() {
      this.loadCaptcha();
      this.loginForm.captcha = '';
      this.clearError('captcha');
    },
    clearError(field) {
      if (this.errors[field]) {
        this.errors[field] = '';
      }
    },
    validateLoginForm() {
      let isValid = true;
      Object.keys(this.errors).forEach(key => this.errors[key] = '');

      if (!this.loginForm.account.trim()) {
        this.errors.account = '请输入账号';
        isValid = false;
      }

      if (!this.loginForm.password) {
        this.errors.password = '请输入密码';
        isValid = false;
      } else if (this.loginForm.password.length < 6) {
        this.errors.password = '密码至少6个字符';
        isValid = false;
      }

      if (!this.loginForm.captcha.trim()) {
        this.errors.captcha = '请输入验证码';
        isValid = false;
      }

      return isValid;
    },
    async handleLogin() {
      if (!this.validateLoginForm()) return;

      this.loading = true;

      try {
        // 调用登录API
        const res = await login(
          this.loginForm.account,
          this.loginForm.password,
          this.captchaId,
          this.loginForm.captcha
        );

        if (res.success) {
          // 保存token
          const { access_token, refresh_token } = res.data;
          localStorage.setItem('accessToken', access_token);
          localStorage.setItem('refreshToken', refresh_token);
          localStorage.setItem('isLoggedIn', 'true');
          
          // 获取并保存用户信息
          try {
            const userRes = await getUserInfo();
            if (userRes.success && userRes.data) {
              localStorage.setItem('userId', userRes.data.id);
              localStorage.setItem('userName', userRes.data.uname);
            }
          } catch (e) {
            console.error('获取用户信息失败:', e);
          }
          
          // 如果选择记住登录状态
          if (this.loginForm.remember) {
            localStorage.setItem('rememberLogin', 'true');
          }

          // 先跳转到主页，再显示 toast 提示
          this.$router.push('/home');
          this.showToast('登录成功！欢迎登录AI公益资源调度平台', 'success');
        } else {
          // 显示更友好的错误提示
          const errorMsg = res.message || '登录失败';
          if (errorMsg.includes('不存在') || errorMsg.includes('未注册')) {
            alert('该账号尚未注册，请先注册后再登录');
          } else if (errorMsg.includes('密码')) {
            alert('密码错误，请重新输入');
          } else if (errorMsg.includes('验证码')) {
            alert('验证码错误或已过期，请重新输入');
          } else {
            alert(errorMsg);
          }
          this.refreshCaptcha();
        }
      } catch (error) {
        console.error('登录错误:', error);
        alert('网络连接失败，请检查网络后重试');
        this.refreshCaptcha();
      } finally {
        this.loading = false;
      }
    },
    fillDemoCredentials() {
      this.loginForm.account = 'demo';
      this.loginForm.password = 'demo123';
      this.loginForm.remember = true;

      this.clearError('account');
      this.clearError('password');
      this.clearError('captcha');

      alert('已填充演示账号信息，请输入验证码后点击登录按钮');
    },
    showForgotPassword() {
      alert('忘记密码功能：请通过注册手机号或邮箱找回密码，或联系平台客服：400-123-4567');
    },
    showToast(message, type = 'success') {
      // 清除之前的定时器
      if (this.toast.timer) {
        clearTimeout(this.toast.timer);
      }
      
      // 显示 toast
      this.toast.message = message;
      this.toast.type = type;
      this.toast.show = true;
      
      // 3秒后自动隐藏
      this.toast.timer = setTimeout(() => {
        this.toast.show = false;
      }, 3000);
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

/* Toast 提示样式 */
.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #4caf50;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  animation: slideDown 0.3s ease;
}

.toast.success {
  background: #4caf50;
}

.toast.error {
  background: #f44336;
}

.toast i {
  font-size: 18px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.auth-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #fdf6e3 0%, #f0f8ff 100%);
  position: relative;
  overflow: hidden;
}

/* 返回按钮 */
.auth-back-btn {
  position: absolute;
  top: 30px;
  left: 30px;
  z-index: 100;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.4);
  padding: 14px 28px;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 700;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  font-size: 16px;
}

.auth-back-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateX(-5px) scale(1.05);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

/* 进一步加大横版登录/注册容器 */
.auth-container {
  width: 1050px;
  height: 650px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 2;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  display: flex;
}

/* 左侧图片区域 */
.auth-image-section {
  flex: 0 0 40%;
  position: relative;
  overflow: hidden;
}

.auth-image {
  width: 100%;
  height: 100%;
  background-image: url('/jisheimages/image4.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* 右侧表单区域 */
.auth-form-section {
  flex: 0 0 60%;
  display: flex;
  flex-direction: column;
  padding: 35px 45px;
  background: linear-gradient(135deg, rgba(240, 248, 255, 0.95) 0%, rgba(253, 246, 227, 0.95) 100%);
  overflow-y: auto;
}

/* 表单头部 */
.auth-header {
  text-align: center;
  margin-bottom: 20px;
}

.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  flex-direction: column;
}

.auth-logo-icon {
  font-size: 28px;
  margin-bottom: 10px;
  background: linear-gradient(to right, #4da6ff, #ffb64d);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 15px rgba(77, 166, 255, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: white;
}

.auth-logo-text h2 {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0.1px;
  margin-bottom: 5px;
  color: #2c3e50;
}

.auth-logo-text p {
  font-size: 13px;
  color: #5a6c7d;
  font-weight: 500;
}

/* 表单样式 */
.auth-form {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 14px;
}

.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 13px;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
  font-size: 14px;
  z-index: 1;
}

.form-control {
  width: 100%;
  padding: 11px 12px 11px 40px;
  border: 1.5px solid #dce4ec;
  border-radius: 8px;
  font-size: 13px;
  transition: all 0.3s;
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
}

.form-control:focus {
  outline: none;
  border-color: #4da6ff;
  background-color: white;
  box-shadow: 0 0 0 2px rgba(77, 166, 255, 0.2);
}

.error-message {
  color: #e74c3c;
  font-size: 11px;
  margin-top: 3px;
  display: flex;
  align-items: center;
  font-weight: 500;
}

/* 验证码区域 */
.captcha-group {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.captcha-input {
  flex: 1;
}

.captcha-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
}

.captcha-image {
  height: 42px;
  border-radius: 8px;
  overflow: hidden;
  border: 1.5px solid #dce4ec;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}

.captcha-text {
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 3px;
  color: #2c3e50;
}

.refresh-captcha {
  font-size: 11px;
  color: #4da6ff;
  margin-top: 4px;
  cursor: pointer;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.refresh-captcha:hover {
  color: #3399ff;
  text-decoration: underline;
}

/* 记住我/忘记密码 */
.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 12px;
}

.checkbox-container input {
  margin-right: 5px;
  width: 13px;
  height: 13px;
  accent-color: #4da6ff;
}

.checkbox-container label {
  color: #2c3e50;
  font-weight: 500;
  font-size: 12px;
}

.forgot-link {
  color: #4da6ff;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
  font-size: 12px;
}

.forgot-link:hover {
  color: #3399ff;
  text-decoration: underline;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(to right, #4da6ff, #3399ff);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 5px 15px rgba(77, 166, 255, 0.3);
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(to right, #3399ff, #1a8cff);
  box-shadow: 0 8px 20px rgba(77, 166, 255, 0.4);
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  margin-right: 8px;
  font-size: 14px;
}

/* 注册链接 */
.switch-auth {
  text-align: center;
  margin-top: 16px;
  color: #7f8c8d;
  font-size: 12px;
}

.switch-auth a {
  color: #4da6ff;
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
  font-size: 12px;
}

.switch-auth a:hover {
  text-decoration: underline;
}

/* 演示登录 */
.demo-auth {
  margin-top: 12px;
  text-align: center;
}

.demo-btn {
  background-color: rgba(255, 255, 255, 0.9);
  color: #4da6ff;
  border: 1.5px solid #dce4ec;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  width: 100%;
}

.demo-btn:hover {
  background-color: white;
  border-color: #4da6ff;
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(77, 166, 255, 0.15);
}

.register-link {
  color: #4da6ff;
}

/* 滚动条样式 */
.auth-form-section::-webkit-scrollbar {
  width: 4px;
}

.auth-form-section::-webkit-scrollbar-track {
  background: transparent;
}

.auth-form-section::-webkit-scrollbar-thumb {
  background: rgba(77, 166, 255, 0.3);
  border-radius: 2px;
}
</style>
