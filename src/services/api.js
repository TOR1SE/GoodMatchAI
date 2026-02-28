// API服务层 - 使用axios调用真实后端接口
import axios from 'axios'
import router from '../router/index.js'

// 创建axios实例
const apiClient = axios.create({
  baseURL: '/api/v1', // 后端API基础URL（通过代理转发）
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 是否正在刷新token
let isRefreshing = false
// 等待刷新token的请求队列
let refreshSubscribers = []

// 刷新token函数
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) {
    throw new Error('没有refresh_token')
  }
  
  try {
    const response = await axios.post('/api/v1/refresh', {}, {
      headers: {
        'refresh_token': refreshToken
      }
    })
    
    if (response.data.code === 200) {
      const { access_token, refresh_token } = response.data.data
      localStorage.setItem('accessToken', access_token)
      localStorage.setItem('refreshToken', refresh_token)
      return access_token
    } else {
      throw new Error(response.data.message || '刷新token失败')
    }
  } catch (error) {
    // refresh_token 过期或无效
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('rememberLogin')
    router.push('/login')
    throw error
  }
}

// 请求拦截器 - 添加token认证
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理响应和token刷新
apiClient.interceptors.response.use(
  response => {
    // 后端返回格式为 { code: 200/201, data: {}, message: '' }
    console.log('API响应:', response.config.url, response.data)
    if (response.data.code === 200 || response.data.code === 201) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } else {
      console.error('API错误响应:', response.data)
      return Promise.reject(new Error(response.data.message || '请求失败'))
    }
  },
  async error => {
    const originalRequest = error.config
    
    // 打印错误响应详情（用于调试）
    console.error('API错误拦截器:', {
      url: originalRequest?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })
    
    // 如果是401错误且不是刷新token的请求
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 正在刷新token，将请求加入队列等待
        return new Promise(resolve => {
          refreshSubscribers.push(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          })
        })
      }
      
      originalRequest._retry = true
      isRefreshing = true
      
      try {
        const newToken = await refreshToken()
        // 重试原请求
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        // 执行队列中的请求
        refreshSubscribers.forEach(callback => callback(newToken))
        refreshSubscribers = []
        return apiClient(originalRequest)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    // 处理其他错误（500等）
    if (error.response?.data?.message) {
      return Promise.reject(new Error(error.response.data.message))
    }
    // 如果有响应但无message，返回状态码信息
    if (error.response?.status === 500) {
      return Promise.reject(new Error('服务器内部错误，请稍后重试'))
    }
    return Promise.reject(error)
  }
)

// 登录接口
export const login = async (account, password, captcha_id, captcha_value) => {
  return apiClient.post('/login', {
    account,
    password,
    captcha_id,
    captcha_value
  });
};

// 发送验证码接口
export const sendVerificationCode = async (account) => {
  return apiClient.post('/verification-code', {
    account
  });
};

// 注册接口
export const register = async (uname, account, password, captcha_id, captcha_value) => {
  return apiClient.post('/register', {
    uname,
    account,
    password,
    captcha_id,
    captcha_value
  });
};

// 获取验证码接口
export const getCaptcha = async () => {
  return apiClient.get('/get_code');
};



// 退出登录接口
export const logout = async () => {
  const token = localStorage.getItem('accessToken')
  return apiClient.post('/logout', {}, {
    headers: {
      'token': token
    }
  });
};

// 重设密码接口（忘记密码）
export const resetPassword = async (account, new_password, captcha_id, captcha_value) => {
  return apiClient.post('/reset_password', {
    account,
    new_password,
    captcha_id,
    captcha_value
  });
};

// 修改密码接口（需要登录）
export const updatePassword = async (old_password, new_password) => {
  const token = localStorage.getItem('accessToken')
  return apiClient.put('/update_password', {
    old_password,
    new_password
  }, {
    headers: {
      'token': token
    }
  });
};

// 获取用户信息接口
export const getUserInfo = async () => {
  const token = localStorage.getItem('accessToken')
  return apiClient.get('/user/get_info', {
    headers: {
      'token': token
    }
  });
};

// 更新用户信息接口
export const updateUserInfo = async (u_name, phone, email) => {
  const token = localStorage.getItem('accessToken')
  return apiClient.put('/user/update', {
    u_name,
    phone,
    email
  }, {
    headers: {
      'token': token
    }
  });
};

// 删除用户接口
export const deleteUser = async () => {
  const token = localStorage.getItem('accessToken')
  return apiClient.delete('/user/del', {
    headers: {
      'token': token
    }
  });
};

// ==================== 留言墙接口 ====================

// 创建留言
export const createBoardMessage = async (messageData) => {
  const token = localStorage.getItem('accessToken')
  // 支持两种调用方式：字符串 description 或对象 {description, section_id}
  const data = typeof messageData === 'string' 
    ? { description: messageData }
    : messageData
  return apiClient.post('/boards/create', data, {
    headers: {
      'token': token
    }
  });
};

// 获取留言列表
export const getBoardList = async (keyword = '', uid = '', page = 1, page_size = 20) => {
  const token = localStorage.getItem('accessToken')
  return apiClient.get('/boards/getlist', {
    params: {
      keyword,
      uid,
      page,
      page_size
    },
    headers: {
      'token': token
    }
  });
};

// 获取单个留言
export const getBoardMessage = async (id) => {
  const token = localStorage.getItem('accessToken')
  return apiClient.get(`/boards/${id}`, {
    headers: {
      'token': token
    }
  });
};

// 获取当前用户近期留言
export const getRecentBoards = async () => {
  const token = localStorage.getItem('accessToken')
  return apiClient.get('/boards/recent', {
    headers: {
      'token': token
    }
  });
};

// 更新留言
export const updateBoardMessage = async (id, description) => {
  const token = localStorage.getItem('accessToken')
  return apiClient.put(`/boards/${id}`, {
    description
  }, {
    headers: {
      'token': token
    }
  });
};

// 删除留言
export const deleteBoardMessage = async (id) => {
  const token = localStorage.getItem('accessToken')
  return apiClient.delete(`/boards/${id}`, {
    headers: {
      'token': token
    }
  });
};

// 获取当前用户留言总数
export const getUserBoardCount = async () => {
  const token = localStorage.getItem('accessToken')
  return apiClient.get('/boards/count', {
    headers: {
      'token': token
    }
  });
};

// 获取所有用户留言总数
export const getAllBoardCount = async () => {
  const token = localStorage.getItem('accessToken')
  return apiClient.get('/boards/count_all', {
    headers: {
      'token': token
    }
  });
};

// 更新留言所属区块
export const updateBoardSection = async (id, section_id) => {
  const token = localStorage.getItem('accessToken')
  return apiClient.put(`/boards/${id}/section`, {
    section_id
  }, {
    headers: {
      'token': token
    }
  });
};

// 根据区块获取留言列表
export const getBoardsBySection = async (section_id) => {
  return apiClient.get(`/boards/section/${section_id}`);
};

// ==================== 留言墙分区接口 ====================

// 获取区块列表
export const getSectionList = async (status = '', page = 1, page_size = 10) => {
  const token = localStorage.getItem('accessToken')
  return apiClient.get('/board-sections', {
    params: {
      status,
      page,
      page_size
    },
    headers: {
      'token': token
    }
  });
};

// 获取活跃区块
export const getActiveSections = async () => {
  const token = localStorage.getItem('accessToken')
  return apiClient.get('/board-sections/active', {
    headers: {
      'token': token
    }
  });
};

// 根据ID获取区块详情
export const getSectionById = async (id) => {
  const token = localStorage.getItem('accessToken')
  return apiClient.get(`/board-sections/${id}`, {
    headers: {
      'token': token
    }
  });
};

// 获取区块统计信息
export const getSectionStats = async (id) => {
  const token = localStorage.getItem('accessToken')
  return apiClient.get(`/board-sections/${id}/stats`, {
    headers: {
      'token': token
    }
  });
};

// 创建区块
export const createSection = async (name, description) => {
  const token = localStorage.getItem('accessToken')
  return apiClient.post('/board-sections', {
    name,
    description
  }, {
    headers: {
      'token': token
    }
  });
};

// 更新区块
export const updateSection = async (id, name, description, status) => {
  const token = localStorage.getItem('accessToken')
  return apiClient.put(`/board-sections/${id}`, {
    name,
    description,
    status
  }, {
    headers: {
      'token': token
    }
  });
};

// 删除区块
export const deleteSection = async (id) => {
  const token = localStorage.getItem('accessToken')
  return apiClient.delete(`/board-sections/${id}`, {
    headers: {
      'token': token
    }
  });
};

// ==================== 捐赠接口 ====================

// 创建捐赠
export const createDonation = async (donationData) => {
  const token = localStorage.getItem('accessToken')
  return apiClient.post('/donations', donationData, {
    headers: {
      'token': token
    }
  });
};

// 获取捐赠列表（按手机号）
export const getDonationList = async (donor_phone = '', page = 1, page_size = 10) => {
  const token = localStorage.getItem('accessToken')
  return apiClient.get('/donations', {
    params: {
      donor_phone,
      page,
      page_size
    },
    headers: {
      'token': token
    }
  });
};

// 按状态查询捐赠列表
export const getDonationsByStatus = async (status = '', page = 1, page_size = 10) => {
  const token = localStorage.getItem('accessToken')
  return apiClient.get('/donations/status', {
    params: {
      status,
      page,
      page_size
    },
    headers: {
      'token': token
    }
  });
};

// 获取捐赠详情
export const getDonationDetail = async (id) => {
  const token = localStorage.getItem('accessToken')
  return apiClient.get(`/donations/${id}`, {
    headers: {
      'token': token
    }
  });
};

// 分配捐赠到灾区
export const allocateDonation = async (donation_id, disaster_area_id) => {
  const token = localStorage.getItem('accessToken')
  return apiClient.post('/donations/allocate', {
    donation_id,
    disaster_area_id
  }, {
    headers: {
      'token': token
    }
  });
};

// 更新捐赠状态
export const updateDonationStatus = async (donation_id, status) => {
  const token = localStorage.getItem('accessToken')
  return apiClient.put('/donations/status', {
    donation_id,
    status
  }, {
    headers: {
      'token': token
    }
  });
};
