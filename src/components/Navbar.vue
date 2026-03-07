<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">
          AI智能物资分配系统
        </router-link>
      </div>
      <ul class="navbar-nav">
        <li class="nav-item">
          <router-link to="/home" class="nav-link" active-class="active">首页</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/donation/list" class="nav-link" active-class="active">捐赠物资</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/demand/list" class="nav-link" active-class="active">灾区需求</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/matching/list" class="nav-link" active-class="active">智能匹配</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/logistics/list" class="nav-link" active-class="active">物流跟踪</router-link>
        </li>
        <!-- <li class="nav-item">
          <router-link to="/ai-analysis" class="nav-link" active-class="active">AI分析</router-link>
        </li> -->
        <li class="nav-item">
          <router-link to="/user" class="nav-link" active-class="active">个人中心</router-link>
        </li>
        <!-- <li class="nav-item">
          <router-link to="/admin" class="nav-link" active-class="active">管理后台</router-link>
        </li> -->
        
        <li v-if="!isLoggedIn" class="nav-item">
          <router-link to="/login" class="nav-link" active-class="active">登录</router-link>
        </li>
        <li v-else class="nav-item">
          <button class="nav-link logout-btn" @click="handleLogout">退出登录</button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '../services/api.js'

const router = useRouter()
const isLoggedIn = ref(false)

// 检查登录状态
const checkLoginStatus = () => {
  isLoggedIn.value = !!localStorage.getItem('accessToken')
}

// 处理登出
const handleLogout = async () => {
  try {
    await logout()
  } catch (error) {
    console.error('登出请求失败:', error)
  } finally {
    // 清除本地存储的token
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('rememberLogin')
    
    // 更新登录状态
    isLoggedIn.value = false
    
    // 跳转到登录页
    router.push('/login')
    
    alert('已成功退出登录')
  }
}

// 组件挂载时检查登录状态
onMounted(() => {
  checkLoginStatus()
  // 监听storage变化，同步登录状态
  window.addEventListener('storage', checkLoginStatus)
})
</script>

<style scoped>
.navbar {
  background-color: #ffffff;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 12px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand {
  font-size: 20px;
  font-weight: bold;
}

.brand-link {
  color: #007bff;
  text-decoration: none;
  transition: color 0.3s ease;
}

.brand-link:hover {
  color: #0056b3;
}

.navbar-nav {
  display: flex;
  list-style: none;
  gap: 24px;
  margin: 0;
  padding: 0;
}

.nav-item {
  position: relative;
}

.nav-link {
  color: #495057;
  text-decoration: none;
  padding: 8px 0;
  font-size: 16px;
  transition: color 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #007bff;
}

.nav-link.active {
  color: #007bff;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #007bff;
  transition: width 0.3s ease;
}

/* 退出登录按钮样式 */
.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #dc3545;
  padding: 8px 0;
  transition: color 0.3s ease;
}

.logout-btn:hover {
  color: #c82333;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .navbar-nav {
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .navbar .container {
    flex-direction: column;
    align-items: flex-start;
  }

  .navbar-nav {
    flex-direction: column;
    width: 100%;
    gap: 10px;
    margin-top: 16px;
  }

  .nav-link {
    display: block;
    padding: 8px 0;
  }

  .nav-link.active::after {
    left: 0;
    width: 30px;
  }
}

@media (max-width: 576px) {
  .navbar-brand {
    font-size: 18px;
  }

  .nav-link {
    font-size: 14px;
  }
}
</style>
