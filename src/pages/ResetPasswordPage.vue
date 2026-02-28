<template>
  <div class="auth-page page-enter-active">
    <button class="auth-back-btn" @click="goToLogin">
      <i class="fas fa-arrow-left"></i> 返回登录
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
              <i class="fas fa-key"></i>
            </div>
            <div class="auth-logo-text">
              <h2>重设密码</h2>
              <p>AI公益资源调度平台</p>
            </div>
          </div>
        </div>

        <form class="auth-form" @submit.prevent="handleResetPassword">
          <!-- 账号 -->
          <div class="form-group">
            <label class="form-label" for="account">账号</label>
            <div class="input-with-icon">
              <i class="fas fa-user input-icon"></i>
              <input
                type="text"
                id="account"
                class="form-control"
                placeholder="请输入账号（手机号）"
                v-model="resetForm.account"
                @input="clearError('account')"
              >
            </div>
            <div v-if="errors.account" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ errors.account }}
            </div>
          </div>

          <!-- 新密码 -->
          <div class="form-group">
            <label class="form-label" for="newPassword">新密码</label>
            <div class="input-with-icon">
              <i class="fas fa-lock input-icon"></i>
              <input
                type="password"
                id="newPassword"
                class="form-control"
                placeholder="请输入新密码（至少6位）"
                v-model="resetForm.newPassword"
                @input="clearError('newPassword')"
              >
            </div>
            <div v-if="errors.newPassword" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ errors.newPassword }}
            </div>
          </div>

          <!-- 确认新密码 -->
          <div class="form-group">
            <label class="form-label" for="confirmPassword">确认新密码</label>
            <div class="input-with-icon">
              <i class="fas fa-lock input-icon"></i>
              <input
                type="password"
                id="confirmPassword"
                class="form-control"
                placeholder="请再次输入新密码"
                v-model="resetForm.confirmPassword"
                @input="clearError('confirmPassword')"
              >
            </div>
            <div v-if="errors.confirmPassword" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ errors.confirmPassword }}
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
                  v-model="resetForm.captcha_value"
                  @input="clearError('captcha_value')"
                  maxlength="6"
                >
              </div>
              <div class="captcha-image-container">
                <div
                  class="captcha-image"
                  @click="refreshCaptcha"
                  style="cursor: pointer; height: 40px; width: 120px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px solid #ddd;"
                >
                  <img
                    v-if="captcha_image"
                    :src="captcha_image"
                    style="height: 100%; width: 100%; object-fit: contain;"
                    alt="验证码"
                  >
                  <span v-else style="color: #999; font-size: 12px;">加载中...</span>
                </div>
                <div class="refresh-captcha" @click="refreshCaptcha">
                  <i class="fas fa-sync-alt"></i> 换一张
                </div>
              </div>
            </div>
            <div v-if="errors.captcha_value" class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ errors.captcha_value }}
            </div>
          </div>

          <!-- 提交按钮 -->
          <button type="submit" class="submit-btn" :disabled="loading">
            <i class="fas fa-key btn-icon"></i>
            {{ loading ? '提交中...' : '重设密码' }}
          </button>

          <div class="switch-auth">
            想起密码了？
            <a href="#" class="register-link" @click.prevent="goToLogin">
              返回登录
            </a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { resetPassword, getCaptcha } from '../services/api.js'

export default {
  name: 'ResetPasswordPage',
  data() {
    return {
      resetForm: {
        account: '',
        newPassword: '',
        confirmPassword: '',
        captcha_value: ''
      },
      errors: {
        account: '',
        newPassword: '',
        confirmPassword: '',
        captcha_value: ''
      },
      loading: false,
      captcha_id: '',
      captcha_image: ''
    }
  },
  mounted() {
    this.loadCaptcha();
  },
  methods: {
    goToLogin() {
      this.$router.push('/login');
    },
    async loadCaptcha() {
      try {
        const res = await getCaptcha();
        if (res.success) {
          this.captcha_id = res.data.captcha_id;
          this.captcha_image = res.data.captcha_image;
        }
      } catch (error) {
        console.error('获取验证码失败:', error);
      }
    },
    async refreshCaptcha() {
      await this.loadCaptcha();
      this.resetForm.captcha_value = '';
      this.clearError('captcha_value');
    },
    clearError(field) {
      if (this.errors[field]) {
        this.errors[field] = '';
      }
    },
    validateForm() {
      let isValid = true;
      Object.keys(this.errors).forEach(key => this.errors[key] = '');

      // 验证账号
      if (!this.resetForm.account.trim()) {
        this.errors.account = '请输入账号';
        isValid = false;
      } else if (!/^1\d{10}$/.test(this.resetForm.account)) {
        this.errors.account = '请输入正确的手机号';
        isValid = false;
      }

      // 验证新密码
      if (!this.resetForm.newPassword) {
        this.errors.newPassword = '请输入新密码';
        isValid = false;
      } else if (this.resetForm.newPassword.length < 6) {
        this.errors.newPassword = '密码至少6个字符';
        isValid = false;
      }

      // 验证确认密码
      if (!this.resetForm.confirmPassword) {
        this.errors.confirmPassword = '请确认新密码';
        isValid = false;
      } else if (this.resetForm.confirmPassword !== this.resetForm.newPassword) {
        this.errors.confirmPassword = '两次输入的密码不一致';
        isValid = false;
      }

      // 验证验证码
      if (!this.resetForm.captcha_value.trim()) {
        this.errors.captcha_value = '请输入验证码';
        isValid = false;
      }

      return isValid;
    },
    async handleResetPassword() {
      if (!this.validateForm()) return;

      this.loading = true;

      try {
        const res = await resetPassword(
          this.resetForm.account,
          this.resetForm.newPassword,
          this.captcha_id,
          this.resetForm.captcha_value
        );

        if (res.success) {
          alert('密码重设成功！请使用新密码登录');
          this.$router.push('/login');
        }
      } catch (error) {
        alert(error.message || '重设密码失败');
        this.refreshCaptcha();
        this.resetForm.captcha_value = '';
      } finally {
        this.loading = false;
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

/* 登录/注册容器 */
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
  color: #ffffff;
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
  color: #ffffff;
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
