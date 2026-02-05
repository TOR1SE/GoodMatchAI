<template>
  <div class="auth-page page-enter-active">
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
              <i class="fas fa-user-plus"></i>
            </div>
            <div class="auth-logo-text">
              <h2>用户注册</h2>
              <p>AI公益资源调度平台</p>
            </div>
          </div>
        </div>

        <form class="auth-form" @submit.prevent="handleRegister">
          <!-- 用户名 -->
          <div class="form-group">
            <label class="form-label" for="username">用户名</label>
            <div class="input-with-icon">
              <i class="fas fa-user input-icon"></i>
              <input
                type="text"
                id="username"
                class="form-control"
                placeholder="请输入用户名（2-20位字符）"
                v-model="registerForm.username"
                @input="clearRegisterError('username')"
              >
            </div>
            <div v-if="registerErrors.username" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ registerErrors.username }}
            </div>
          </div>

          <!-- 手机号 -->
          <div class="form-group">
            <label class="form-label" for="phone">手机号</label>
            <div class="input-with-icon">
              <i class="fas fa-phone input-icon"></i>
              <input
                type="tel"
                id="phone"
                class="form-control"
                placeholder="请输入手机号"
                v-model="registerForm.phone"
                @input="clearRegisterError('phone')"
              >
            </div>
            <div v-if="registerErrors.phone" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ registerErrors.phone }}
            </div>
          </div>

          <!-- 邮箱 -->
          <div class="form-group">
            <label class="form-label" for="email">邮箱</label>
            <div class="input-with-icon">
              <i class="fas fa-envelope input-icon"></i>
              <input
                type="email"
                id="email"
                class="form-control"
                placeholder="请输入邮箱"
                v-model="registerForm.email"
                @input="clearRegisterError('email')"
              >
            </div>
            <div v-if="registerErrors.email" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ registerErrors.email }}
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
                placeholder="请输入密码（至少6位）"
                v-model="registerForm.password"
                @input="clearRegisterError('password')"
              >
            </div>
            <div v-if="registerErrors.password" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ registerErrors.password }}
            </div>
          </div>

          <!-- 确认密码 -->
          <div class="form-group">
            <label class="form-label" for="confirmPassword">确认密码</label>
            <div class="input-with-icon">
              <i class="fas fa-lock input-icon"></i>
              <input
                type="password"
                id="confirmPassword"
                class="form-control"
                placeholder="请再次输入密码"
                v-model="registerForm.confirmPassword"
                @input="clearRegisterError('confirmPassword')"
              >
            </div>
            <div v-if="registerErrors.confirmPassword" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ registerErrors.confirmPassword }}
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
                  v-model="registerForm.captcha"
                  @input="clearRegisterError('captcha')"
                  maxlength="6"
                >
              </div>
              <div class="captcha-image-container">
                <div class="captcha-image" @click="refreshCaptcha">
                  <div class="captcha-text">{{ captchaText }}</div>
                </div>
                <div class="refresh-captcha" @click="refreshCaptcha">
                  <i class="fas fa-sync-alt"></i> 换一张
                </div>
              </div>
            </div>
            <div v-if="registerErrors.captcha" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ registerErrors.captcha }}
            </div>
          </div>

          <!-- 用户协议 -->
          <div class="register-agreement checkbox-container">
            <input type="checkbox" id="agreeTerms" v-model="registerForm.agreeTerms">
            <label for="agreeTerms">我已阅读并同意 <a href="#" style="color: #4da6ff;">《AI公益资源调度平台用户协议》</a></label>
          </div>
          <div v-if="registerErrors.agreeTerms" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ registerErrors.agreeTerms }}
          </div>

          <div class="register-agreement checkbox-container">
            <input type="checkbox" id="agreePrivacy" v-model="registerForm.agreePrivacy">
            <label for="agreePrivacy">我已阅读并同意 <a href="#" style="color: #4da6ff;">《隐私政策》</a></label>
          </div>
          <div v-if="registerErrors.agreePrivacy" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ registerErrors.agreePrivacy }}
          </div>

          <!-- 提交按钮 -->
          <button type="submit" class="submit-btn register-submit-btn" :disabled="registerLoading">
            <i class="fas fa-user-plus btn-icon"></i>
            {{ registerLoading ? '注册中...' : '立即注册' }}
          </button>

          <div class="switch-auth">
            已有账号？
            <a href="#" @click.prevent="goToLogin">
              立即登录
            </a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { register } from '../services/api.js'

export default {
  name: 'RegisterPage',
  data() {
    return {
      registerForm: {
        username: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        captcha: '',
        agreeTerms: false,
        agreePrivacy: false
      },
      registerErrors: {
        username: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        captcha: '',
        agreeTerms: '',
        agreePrivacy: ''
      },
      registerLoading: false,
      captchaText: ''
    }
  },
  mounted() {
    this.generateCaptcha();
  },
  methods: {
    goToHome() {
      this.$router.push('/welcome');
    },
    goToLogin() {
      this.$router.push('/login');
    },
    generateCaptcha() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.captchaText = result;
    },
    refreshCaptcha() {
      this.generateCaptcha();
      this.registerForm.captcha = '';
      this.clearRegisterError('captcha');
    },
    clearRegisterError(field) {
      if (this.registerErrors[field]) {
        this.registerErrors[field] = '';
      }
    },
    validateRegisterForm() {
      let isValid = true;
      Object.keys(this.registerErrors).forEach(key => this.registerErrors[key] = '');

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^1[3-9]\d{9}$/;
      const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9_-]{2,20}$/;

      if (!this.registerForm.username.trim()) {
        this.registerErrors.username = '请输入用户名';
        isValid = false;
      } else if (!usernameRegex.test(this.registerForm.username)) {
        this.registerErrors.username = '用户名2-20位，可包含中文、英文、数字、下划线';
        isValid = false;
      }

      if (!this.registerForm.phone.trim()) {
        this.registerErrors.phone = '请输入手机号';
        isValid = false;
      } else if (!phoneRegex.test(this.registerForm.phone)) {
        this.registerErrors.phone = '请输入有效的11位手机号';
        isValid = false;
      }

      if (!this.registerForm.email.trim()) {
        this.registerErrors.email = '请输入邮箱';
        isValid = false;
      } else if (!emailRegex.test(this.registerForm.email)) {
        this.registerErrors.email = '请输入有效的邮箱';
        isValid = false;
      }

      if (!this.registerForm.password) {
        this.registerErrors.password = '请输入密码';
        isValid = false;
      } else if (this.registerForm.password.length < 6) {
        this.registerErrors.password = '密码至少6个字符';
        isValid = false;
      }

      if (!this.registerForm.confirmPassword) {
        this.registerErrors.confirmPassword = '请确认密码';
        isValid = false;
      } else if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.registerErrors.confirmPassword = '两次输入的密码不一致';
        isValid = false;
      }

      if (!this.registerForm.captcha.trim()) {
        this.registerErrors.captcha = '请输入验证码';
        isValid = false;
      } else if (this.registerForm.captcha.toUpperCase() !== this.captchaText) {
        this.registerErrors.captcha = '验证码错误，请重新输入';
        isValid = false;
        setTimeout(this.refreshCaptcha, 500);
      }

      if (!this.registerForm.agreeTerms) {
        this.registerErrors.agreeTerms = '请同意用户协议';
        isValid = false;
      }

      if (!this.registerForm.agreePrivacy) {
        this.registerErrors.agreePrivacy = '请同意隐私政策';
        isValid = false;
      }

      return isValid;
    },
    async handleRegister() {
      if (!this.validateRegisterForm()) return;

      this.registerLoading = true;

      try {
        // 验证验证码
        if (this.registerForm.captcha.toUpperCase() !== this.captchaText) {
          alert('验证码错误，请重新输入');
          this.refreshCaptcha();
          this.registerLoading = false;
          return;
        }

        // 调用注册接口 - 使用手机号或邮箱作为账号
        const account = this.registerForm.phone || this.registerForm.email;
        const response = await register(account, this.registerForm.password, this.registerForm.captcha);

        alert(response.message || `注册成功！请登录您的账号。\n用户名：${this.registerForm.username}\n手机号：${this.registerForm.phone}\n邮箱：${this.registerForm.email}`);
        this.$router.push('/login');
      } catch (error) {
        alert(error.message || '注册失败，请检查输入信息');
        this.refreshCaptcha();
      } finally {
        this.registerLoading = false;
      }
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

/* 注册页面特殊样式 */
.register-submit-btn {
  background: linear-gradient(to right, #ffb64d, #ffa726);
  box-shadow: 0 5px 15px rgba(255, 182, 77, 0.3);
}

.register-submit-btn:hover:not(:disabled) {
  background: linear-gradient(to right, #ffa726, #ff9800);
  box-shadow: 0 8px 20px rgba(255, 167, 38, 0.4);
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

/* 注册页面需要的额外字段 */
.register-agreement {
  margin: 10px 0;
  font-size: 11px;
}

.checkbox-container {
  display: flex;
  align-items: center;
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
