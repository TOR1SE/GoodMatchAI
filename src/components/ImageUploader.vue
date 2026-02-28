<template>
  <div class="image-uploader">
    <!-- 图片预览区域 -->
    <div v-if="modelValue" class="image-preview">
      <img :src="modelValue" alt="预览" class="preview-img">
      <div class="preview-overlay">
        <button type="button" class="btn-replace" @click="triggerUpload">
          <span>更换图片</span>
        </button>
        <button type="button" class="btn-delete" @click="removeImage">
          <span>删除</span>
        </button>
      </div>
    </div>
    
    <!-- 上传区域 -->
    <div v-else class="upload-area" @click="triggerUpload" @drop.prevent="handleDrop" @dragover.prevent>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileChange"
      >
      <div class="upload-content">
        <div class="upload-icon">📷</div>
        <p class="upload-text">点击或拖拽上传图片</p>
        <p class="upload-hint">支持 JPG、PNG 格式，最大 5MB</p>
      </div>
    </div>
    
    <!-- 上传进度 -->
    <div v-if="uploading" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <span class="progress-text">{{ progress }}%</span>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="upload-error">
      <span>⚠️ {{ error }}</span>
    </div>
  </div>
</template>

<script>
import { upload } from '../services/uploadService.js'

export default {
  name: 'ImageUploader',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'success', 'error'],
  data() {
    return {
      uploading: false,
      progress: 0,
      error: ''
    }
  },
  methods: {
    triggerUpload() {
      this.$refs.fileInput.click()
    },
    
    handleFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.uploadFile(file)
      }
      // 清空input，允许重复选择同一文件
      event.target.value = ''
    },
    
    handleDrop(event) {
      const file = event.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        this.uploadFile(file)
      } else {
        this.error = '请上传图片文件'
      }
    },
    
    async uploadFile(file) {
      this.error = ''
      this.uploading = true
      this.progress = 0
      
      try {
        // 模拟进度（实际应根据上传进度更新）
        const progressInterval = setInterval(() => {
          if (this.progress < 90) {
            this.progress += 10
          }
        }, 200)
        
        // 调用上传服务
        const url = await upload(file, {
          compress: true,
          maxWidth: 1200
        })
        
        clearInterval(progressInterval)
        this.progress = 100
        
        // 更新父组件
        this.$emit('update:modelValue', url)
        this.$emit('success', url)
        
        // 延迟隐藏进度条
        setTimeout(() => {
          this.uploading = false
          this.progress = 0
        }, 500)
        
      } catch (err) {
        this.uploading = false
        this.progress = 0
        this.error = err.message || '上传失败，请重试'
        this.$emit('error', err)
      }
    },
    
    removeImage() {
      this.$emit('update:modelValue', '')
      this.error = ''
    }
  }
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

/* 上传区域 */
.upload-area {
  border: 2px dashed #d0d0d0;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #4a90e2;
  background: #f0f7ff;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 12px;
  color: #999;
}

/* 图片预览 */
.image-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;
}

.preview-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .preview-overlay {
  opacity: 1;
}

.btn-replace,
.btn-delete {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-replace {
  background: #4a90e2;
  color: white;
}

.btn-replace:hover {
  background: #357abd;
}

.btn-delete {
  background: #ff6b6b;
  color: white;
}

.btn-delete:hover {
  background: #ee5a5a;
}

/* 上传进度 */
.upload-progress {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a90e2, #357abd);
  transition: width 0.3s;
}

.progress-text {
  font-size: 12px;
  color: #666;
  min-width: 35px;
}

/* 错误提示 */
.upload-error {
  margin-top: 10px;
  padding: 10px 15px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  color: #ff4d4f;
  font-size: 13px;
}
</style>
