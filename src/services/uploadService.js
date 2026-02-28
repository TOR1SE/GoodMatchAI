/**
 * 图片上传服务
 * 支持阿里云OSS、腾讯云COS、七牛云等云存储
 * 也可以改为上传到自建服务器
 */

// 配置信息（后续可以从后端获取临时凭证）
const UPLOAD_CONFIG = {
  // 当前使用的存储类型：'aliyun' | 'tencent' | 'qiniu' | 'server'
  type: 'server',
  
  // 服务器上传地址（自建服务器时使用）
  serverUrl: '/api/upload/image',
  
  // 阿里云OSS配置（临时，实际应从后端获取STS凭证）
  aliyun: {
    region: 'oss-cn-beijing',
    bucket: 'your-bucket-name',
    // 从后端获取临时凭证
    getSTSToken: async () => {
      // 调用后端接口获取临时凭证
      const response = await fetch('/api/oss/sts-token')
      return response.json()
    }
  },
  
  // 腾讯云COS配置
  tencent: {
    bucket: 'your-bucket-name',
    region: 'ap-beijing',
    getTempKeys: async () => {
      const response = await fetch('/api/cos/temp-keys')
      return response.json()
    }
  }
}

/**
 * 上传图片到服务器
 * @param {File} file - 图片文件
 * @returns {Promise<string>} - 返回图片URL
 */
export async function uploadImage(file) {
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    throw new Error('只能上传图片文件')
  }
  
  // 检查文件大小（最大5MB）
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('图片大小不能超过5MB')
  }
  
  const formData = new FormData()
  formData.append('image', file)
  
  try {
    const response = await fetch(UPLOAD_CONFIG.serverUrl, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('上传失败')
    }
    
    const data = await response.json()
    return data.url // 返回图片URL
  } catch (error) {
    console.error('上传图片失败:', error)
    throw error
  }
}

/**
 * 上传图片到阿里云OSS（前端直传）
 * @param {File} file - 图片文件
 * @returns {Promise<string>} - 返回图片URL
 */
export async function uploadToAliyunOSS(file) {
  try {
    // 1. 从后端获取临时STS凭证
    const stsToken = await UPLOAD_CONFIG.aliyun.getSTSToken()
    
    // 2. 生成唯一文件名
    const filename = generateUniqueFilename(file.name)
    
    // 3. 构造FormData
    const formData = new FormData()
    formData.append('key', filename)
    formData.append('policy', stsToken.policy)
    formData.append('OSSAccessKeyId', stsToken.accessKeyId)
    formData.append('signature', stsToken.signature)
    formData.append('x-oss-security-token', stsToken.securityToken)
    formData.append('file', file)
    
    // 4. 上传到OSS
    const uploadUrl = `https://${UPLOAD_CONFIG.aliyun.bucket}.${UPLOAD_CONFIG.aliyun.region}.aliyuncs.com`
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('OSS上传失败')
    }
    
    // 5. 返回图片访问URL
    return `${uploadUrl}/${filename}`
  } catch (error) {
    console.error('OSS上传失败:', error)
    throw error
  }
}

/**
 * 上传图片到腾讯云COS（前端直传）
 * @param {File} file - 图片文件
 * @returns {Promise<string>} - 返回图片URL
 */
export async function uploadToTencentCOS(file) {
  try {
    // 1. 从后端获取临时密钥
    const tempKeys = await UPLOAD_CONFIG.tencent.getTempKeys()
    
    // 2. 生成唯一文件名
    const filename = generateUniqueFilename(file.name)
    
    // 3. 计算签名（需要引入cos-js-sdk-v5）
    // 这里简化处理，实际应使用COS SDK
    const uploadUrl = `https://${UPLOAD_CONFIG.tencent.bucket}.cos.${UPLOAD_CONFIG.tencent.region}.myqcloud.com/${filename}`
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': tempKeys.authorization,
        'x-cos-security-token': tempKeys.token
      },
      body: file
    })
    
    if (!response.ok) {
      throw new Error('COS上传失败')
    }
    
    return uploadUrl
  } catch (error) {
    console.error('COS上传失败:', error)
    throw error
  }
}

/**
 * 生成唯一文件名
 * @param {string} originalName - 原始文件名
 * @returns {string} - 唯一文件名
 */
function generateUniqueFilename(originalName) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()
  return `images/${timestamp}_${random}.${extension}`
}

/**
 * 压缩图片（可选）
 * @param {File} file - 原图片文件
 * @param {number} maxWidth - 最大宽度
 * @param {number} quality - 压缩质量 0-1
 * @returns {Promise<Blob>} - 压缩后的图片Blob
 */
export function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // 等比例缩放
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob((blob) => {
          resolve(blob)
        }, file.type, quality)
      }
      img.onerror = reject
    }
    reader.onerror = reject
  })
}

/**
 * 统一的图片上传接口
 * @param {File} file - 图片文件
 * @param {Object} options - 配置选项
 * @returns {Promise<string>} - 返回图片URL
 */
export async function upload(file, options = {}) {
  const { compress = true, maxWidth = 1200 } = options
  
  try {
    let uploadFile = file
    
    // 如果需要压缩
    if (compress && file.size > 1024 * 1024) { // 大于1MB才压缩
      const compressedBlob = await compressImage(file, maxWidth)
      uploadFile = new File([compressedBlob], file.name, { type: file.type })
    }
    
    // 根据配置选择上传方式
    switch (UPLOAD_CONFIG.type) {
      case 'aliyun':
        return await uploadToAliyunOSS(uploadFile)
      case 'tencent':
        return await uploadToTencentCOS(uploadFile)
      case 'server':
      default:
        return await uploadImage(uploadFile)
    }
  } catch (error) {
    console.error('上传失败:', error)
    throw error
  }
}

export default {
  upload,
  uploadImage,
  uploadToAliyunOSS,
  uploadToTencentCOS,
  compressImage
}
