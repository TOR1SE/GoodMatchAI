<template>
  <div class="donation-create">
    <div class="card">
      <h2>发布捐赠物资</h2>
      <form @submit.prevent="submitDonation">
        <div class="form-group">
          <label for="materialName">物资名称</label>
          <input type="text" id="materialName" v-model="donationForm.materialName" :class="{ 'error': errors.materialName }" placeholder="请输入物资名称">
          <span class="error-text" v-if="errors.materialName">{{ errors.materialName }}</span>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="quantity">数量</label>
            <input type="number" id="quantity" v-model.number="donationForm.quantity" :class="{ 'error': errors.quantity }" min="1" placeholder="请输入数量">
            <span class="error-text" v-if="errors.quantity">{{ errors.quantity }}</span>
          </div>
          <div class="form-group">
            <label for="unit">单位</label>
            <select id="unit" v-model="donationForm.unit">
              <option value="箱">箱</option>
              <option value="件">件</option>
              <option value="套">套</option>
              <option value="袋">袋</option>
              <option value="公斤">公斤</option>
              <option value="吨">吨</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="category">物资类别</label>
          <select id="category" v-model="donationForm.category">
            <option value="食品">食品</option>
            <option value="饮用水">饮用水</option>
            <option value="帐篷">帐篷</option>
            <option value="衣物">衣物</option>
            <option value="药品">药品</option>
            <option value="医疗设备">医疗设备</option>
            <option value="生活用品">生活用品</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="form-group">
          <label for="description">物资描述</label>
          <textarea id="description" v-model="donationForm.description" rows="4" placeholder="请详细描述物资情况"></textarea>
        </div>
        <div class="form-group">
          <label for="contactName">联系人</label>
          <input type="text" id="contactName" v-model="donationForm.contactName" :class="{ 'error': errors.contactName }" placeholder="请输入联系人姓名">
          <span class="error-text" v-if="errors.contactName">{{ errors.contactName }}</span>
        </div>
        <div class="form-group">
          <label for="contactPhone">联系电话</label>
          <input type="tel" id="contactPhone" v-model="donationForm.contactPhone" :class="{ 'error': errors.contactPhone }" placeholder="请输入联系电话">
          <span class="error-text" v-if="errors.contactPhone">{{ errors.contactPhone }}</span>
        </div>
        <div class="form-group">
          <label>所在地区</label>
          <div class="form-row three-col">
            <div class="form-group">
              <input type="text" v-model="donationForm.province" :class="{ 'error': errors.province }" placeholder="省份，如：四川省">
              <span class="error-text" v-if="errors.province">{{ errors.province }}</span>
            </div>
            <div class="form-group">
              <input type="text" v-model="donationForm.city" :class="{ 'error': errors.city }" placeholder="城市，如：成都市">
              <span class="error-text" v-if="errors.city">{{ errors.city }}</span>
            </div>
            <div class="form-group">
              <input type="text" v-model="donationForm.district" :class="{ 'error': errors.district }" placeholder="区县，如：武侯区">
              <span class="error-text" v-if="errors.district">{{ errors.district }}</span>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label for="location">详细地址</label>
          <input type="text" id="location" v-model="donationForm.location" :class="{ 'error': errors.location }" placeholder="请输入街道、门牌号等详细地址">
          <span class="error-text" v-if="errors.location">{{ errors.location }}</span>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="resetForm" :disabled="loading">重置</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '发布中...' : '发布捐赠' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { createDonation } from '../services/api.js'

export default {
  name: 'DonationCreate',
  data() {
    return {
      donationForm: {
        materialName: '',
        quantity: null,
        unit: '箱',
        category: '食品',
        description: '',
        contactName: '',
        contactPhone: '',
        province: '',
        city: '',
        district: '',
        location: ''
      },
      loading: false,
      errors: {}
    }
  },
  methods: {
    // 表单验证
    validateForm() {
      this.errors = {}
      let isValid = true

      if (!this.donationForm.materialName.trim()) {
        this.errors.materialName = '请输入物资名称'
        isValid = false
      }

      if (!this.donationForm.quantity || this.donationForm.quantity <= 0) {
        this.errors.quantity = '请输入有效的数量'
        isValid = false
      }

      if (!this.donationForm.contactName.trim()) {
        this.errors.contactName = '请输入联系人姓名'
        isValid = false
      }

      if (!this.donationForm.contactPhone.trim()) {
        this.errors.contactPhone = '请输入联系电话'
        isValid = false
      } else if (!/^1[3-9]\d{9}$/.test(this.donationForm.contactPhone)) {
        this.errors.contactPhone = '请输入正确的手机号格式'
        isValid = false
      }

      if (!this.donationForm.province.trim()) {
        this.errors.province = '请输入省份'
        isValid = false
      }

      if (!this.donationForm.city.trim()) {
        this.errors.city = '请输入城市'
        isValid = false
      }

      if (!this.donationForm.district.trim()) {
        this.errors.district = '请输入区县'
        isValid = false
      }

      if (!this.donationForm.location.trim()) {
        this.errors.location = '请输入详细地址'
        isValid = false
      }

      return isValid
    },

    // 获取详细错误信息
    getErrorMessage(error) {
      // 处理后端返回的错误
      if (error.response) {
        const status = error.response.status
        const data = error.response.data

        // 根据状态码返回不同错误信息
        switch (status) {
          case 400:
            return data.message || '请求参数错误，请检查填写信息'
          case 401:
            return '登录已过期，请重新登录'
          case 403:
            return '没有权限执行此操作'
          case 404:
            return '接口不存在'
          case 500:
            return data.message || '服务器内部错误，请稍后重试'
          default:
            return data.message || `请求失败 (${status})`
        }
      }

      // 网络错误
      if (error.request) {
        return '网络连接失败，请检查网络'
      }

      // 其他错误
      return error.message || '操作失败，请重试'
    },

    async submitDonation() {
      // 表单验证
      if (!this.validateForm()) {
        // 显示第一个错误
        const firstError = Object.values(this.errors)[0]
        alert(firstError)
        return
      }

      this.loading = true
      this.errors = {}

      try {
        // 构造请求数据
        const donationData = {
          donor_name: this.donationForm.contactName.trim(),
          donor_phone: this.donationForm.contactPhone.trim(),
          material: {
            type: this.donationForm.category,
            sub_type: this.donationForm.materialName.trim(),
            quantity: parseInt(this.donationForm.quantity),
            unit: this.donationForm.unit,
            urgency: false,
            valid_period: '2026-12-31',
            description: this.donationForm.description.trim() || ''
          },
          source_addr: {
            addressId: 'addr-' + Date.now(),
            province: this.donationForm.province.trim(),
            city: this.donationForm.city.trim(),
            district: this.donationForm.district.trim(),
            detail: this.donationForm.location.trim(),
            longitude: 0,
            latitude: 0
          }
        }

        // 打印请求数据用于调试
        console.log('捐赠请求数据:', JSON.stringify(donationData, null, 2))
        
        const res = await createDonation(donationData)

        if (res.success) {
          alert('捐赠发布成功！')
          this.$router.push('/donation/list')
        } else {
          alert(res.message || '捐赠发布失败')
        }
      } catch (error) {
        // 增强错误日志 - 打印完整的错误信息
        console.error('========== 捐赠发布错误详情 ==========')
        console.error('错误对象:', error)
        console.error('错误消息:', error.message)
        console.error('错误类型:', error.constructor.name)
        
        if (error.response) {
          console.error('HTTP状态码:', error.response.status)
          console.error('响应数据:', error.response.data)
          console.error('响应头:', error.response.headers)
        } else if (error.request) {
          console.error('请求已发送但没有收到响应:', error.request)
        } else {
          console.error('请求配置错误:', error.config)
        }
        console.error('=====================================')
        
        const errorMsg = this.getErrorMessage(error)
        alert('发布失败：' + errorMsg)
      } finally {
        this.loading = false
      }
    },
    resetForm() {
      this.donationForm = {
        materialName: '',
        quantity: null,
        unit: '箱',
        category: '食品',
        description: '',
        contactName: '',
        contactPhone: '',
        location: ''
      }
    }
  }
}
</script>

<style scoped>
.donation-create {
  padding: 20px 0;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

h2 {
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row .form-group {
  flex: 1;
}

.form-row.three-col {
  gap: 10px;
}

.form-row.three-col .form-group {
  flex: 1;
}

.form-row.three-col input {
  padding: 10px;
  font-size: 14px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

input, select, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #007bff;
}

input.error, select.error, textarea.error {
  border-color: #dc3545;
  background-color: #fff5f5;
}

.error-text {
  display: block;
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}
</style>