<template>
  <div class="user-center-page">
    <div class="container">
      <div class="card">
        <div class="card-header">
          <h2>个人中心</h2>
        </div>
        <div class="card-body">
          <div class="user-info-section">
            <h3>基本信息</h3>
            <!-- 普通信息展示模式 -->
            <div v-if="!isEditing" class="user-info">
              <div class="info-item">
                <label>用户名：</label>
                <span>{{ userInfo.username }}</span>
              </div>
              <div class="info-item">
                <label>真实姓名：</label>
                <span>{{ userInfo.realName }}</span>
              </div>
              <div class="info-item">
                <label>联系方式：</label>
                <span>{{ userInfo.phone }}</span>
              </div>
              <div class="info-item">
                <label>邮箱：</label>
                <span>{{ userInfo.email }}</span>
              </div>

              <div class="info-item">
                <label>注册时间：</label>
                <span>{{ userInfo.registerTime }}</span>
              </div>
            </div>
            
            <!-- 编辑模式表单 -->
            <div v-else class="edit-form">
              <div class="info-item">
                <label>用户名：</label>
                <input type="text" v-model="editForm.username" class="form-input">
              </div>
              <div class="info-item">
                <label>真实姓名：</label>
                <input type="text" v-model="editForm.realName" class="form-input">
              </div>
              <div class="info-item">
                <label>联系方式：</label>
                <input type="tel" v-model="editForm.phone" class="form-input">
              </div>
              <div class="info-item">
                <label>邮箱：</label>
                <input type="email" v-model="editForm.email" class="form-input">
              </div>
              
              <div class="info-item">
                <label>注册时间：</label>
                <span>{{ userInfo.registerTime }}</span>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="action-buttons">
              <div v-if="!isEditing">
                <button class="btn btn-primary" @click="startEdit">编辑信息</button>
                <button class="btn btn-secondary" @click="changePassword">修改密码</button>
                <button class="btn btn-danger" @click="confirmDeleteUser">删除账号</button>
              </div>
              <div v-else>
                <button class="btn btn-primary" @click="saveEdit">保存</button>
                <button class="btn btn-secondary" @click="cancelEdit">取消</button>
              </div>
            </div>
          </div>

          <!-- 删除账号确认弹窗 -->
          <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
            <div class="modal-content" @click.stop>
              <div class="modal-header">
                <h3>删除账号</h3>
                <button class="modal-close" @click="closeDeleteModal">&times;</button>
              </div>
              <div class="modal-body">
                <p class="warning-text">
                  <i class="fas fa-exclamation-triangle"></i>
                  警告：此操作不可恢复！删除账号后，您的所有数据将被永久删除。
                </p>
                <p>请输入 "<strong>确认删除</strong>" 以继续：</p>
                <div class="form-group">
                  <input
                    type="text"
                    v-model="deleteConfirmText"
                    placeholder="请输入确认删除"
                  >
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" @click="closeDeleteModal">取消</button>
                <button class="btn btn-danger" @click="handleDeleteUser" :disabled="deleteConfirmText !== '确认删除'">确认删除</button>
              </div>
            </div>
          </div>

          <!-- 修改密码弹窗 -->
          <div v-if="showPasswordModal" class="modal-overlay" @click="closePasswordModal">
            <div class="modal-content" @click.stop>
              <div class="modal-header">
                <h3>修改密码</h3>
                <button class="modal-close" @click="closePasswordModal">&times;</button>
              </div>
              <div class="modal-body">
                <div class="form-group">
                  <label>旧密码</label>
                  <input
                    type="password"
                    v-model="passwordForm.oldPassword"
                    @input="clearPasswordError('oldPassword')"
                    placeholder="请输入旧密码"
                  >
                  <div v-if="passwordErrors.oldPassword" class="error-text">{{ passwordErrors.oldPassword }}</div>
                </div>
                <div class="form-group">
                  <label>新密码</label>
                  <input
                    type="password"
                    v-model="passwordForm.newPassword"
                    @input="clearPasswordError('newPassword')"
                    placeholder="请输入新密码（至少6位）"
                  >
                  <div v-if="passwordErrors.newPassword" class="error-text">{{ passwordErrors.newPassword }}</div>
                </div>
                <div class="form-group">
                  <label>确认新密码</label>
                  <input
                    type="password"
                    v-model="passwordForm.confirmPassword"
                    @input="clearPasswordError('confirmPassword')"
                    placeholder="请再次输入新密码"
                  >
                  <div v-if="passwordErrors.confirmPassword" class="error-text">{{ passwordErrors.confirmPassword }}</div>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" @click="closePasswordModal">取消</button>
                <button class="btn btn-primary" @click="submitPasswordChange">确认修改</button>
              </div>
            </div>
          </div>

          <!-- 评价弹窗 -->
          <div v-if="showEvaluationModal" class="modal-overlay" @click="closeEvaluationModal">
            <div class="modal-content" @click.stop>
              <div class="modal-header">
                <h3>发布评价</h3>
                <button class="modal-close" @click="closeEvaluationModal">&times;</button>
              </div>
              <div class="modal-body">
                <div class="form-group">
                  <label>物资：{{ currentEvaluationItem.materialName }}</label>
                </div>
                <div class="form-group">
                  <label>评分（1-5星）</label>
                  <div class="star-rating">
                    <span 
                      v-for="star in 5" 
                      :key="star"
                      :class="['star', { active: star <= evaluationForm.score }]"
                      @click="evaluationForm.score = star"
                    >★</span>
                  </div>
                </div>
                <div class="form-group">
                  <label>评价内容</label>
                  <textarea 
                    v-model="evaluationForm.content" 
                    placeholder="请输入评价内容"
                    rows="4"
                  ></textarea>
                </div>
                <div v-if="evaluationError" class="error-text">{{ evaluationError }}</div>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" @click="closeEvaluationModal">取消</button>
                <button class="btn btn-primary" @click="submitEvaluation" :disabled="!evaluationForm.score">提交评价</button>
              </div>
            </div>
          </div>

          <div class="tabs-section">
            <div class="tabs">
              <button 
                v-for="tab in tabs" 
                :key="tab.value" 
                :class="['tab-button', { active: activeTab === tab.value }]"
                @click="activeTab = tab.value"
              >
                {{ tab.label }}
              </button>
            </div>

            <div class="tab-content">
              <!-- 我的捐赠记录 -->
              <div v-if="activeTab === 'donations'" class="tab-panel">
                <h3>我的捐赠记录</h3>
                <div class="table-container">
                  <table class="record-table">
                    <thead>
                      <tr>
                        <th>捐赠ID</th>
                        <th>物资名称</th>
                        <th>数量</th>
                        <th>状态</th>
                        <th>发布时间</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="donation in userDonations" :key="donation.id">
                        <td>{{ donation.id }}</td>
                        <td>{{ donation.materialName }}</td>
                        <td>{{ donation.quantity }} {{ donation.unit }}</td>
                        <td>
                          <span :class="['status-badge', donation.status]">
                            {{ statusMap[donation.status] }}
                          </span>
                        </td>
                        <td>{{ donation.createTime }}</td>
                        <td>
                          <router-link :to="'/donation/' + donation.id" class="btn btn-sm btn-info">查看详情</router-link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-if="userDonations.length === 0" class="no-records">
                  暂无捐赠记录
                </div>
              </div>

              <!-- 我的需求记录 -->
              <div v-if="activeTab === 'demands'" class="tab-panel">
                <h3>我的需求记录</h3>
                <div class="table-container">
                  <table class="record-table">
                    <thead>
                      <tr>
                        <th>需求ID</th>
                        <th>灾区名称</th>
                        <th>物资名称</th>
                        <th>数量</th>
                        <th>紧急度</th>
                        <th>状态</th>
                        <th>发布时间</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="demand in userDemands" :key="demand.id">
                        <td>{{ demand.id }}</td>
                        <td>{{ demand.disasterArea }}</td>
                        <td>{{ demand.materialName }}</td>
                        <td>{{ demand.quantity }} {{ demand.unit }}</td>
                        <td>
                          <span :class="['urgency-badge', demand.urgency]">
                            {{ urgencyMap[demand.urgency] }}
                          </span>
                        </td>
                        <td>
                          <span :class="['status-badge', demand.status]">
                            {{ statusMap[demand.status] }}
                          </span>
                        </td>
                        <td>{{ demand.createTime }}</td>
                        <td>
                          <router-link :to="'/demand/' + demand.id" class="btn btn-sm btn-info">查看详情</router-link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-if="userDemands.length === 0" class="no-records">
                  暂无需求记录
                </div>
              </div>

              <!-- 我的匹配记录 -->
              <div v-if="activeTab === 'matchings'" class="tab-panel">
                <h3>我的匹配记录</h3>
                <div class="table-container">
                  <table class="record-table">
                    <thead>
                      <tr>
                        <th>匹配ID</th>
                        <th>捐赠物资</th>
                        <th>需求灾区</th>
                        <th>匹配度</th>
                        <th>状态</th>
                        <th>匹配时间</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="matching in userMatchings" :key="matching.id">
                        <td>{{ matching.id }}</td>
                        <td>{{ matching.donationMaterial }}</td>
                        <td>{{ matching.demandArea }}</td>
                        <td>
                          <span :class="['match-degree', getMatchDegreeClass(matching.matchDegree)]">
                            {{ matching.matchDegree }}%
                          </span>
                        </td>
                        <td>
                          <span :class="['status-badge', matching.status]">
                            {{ matchingStatusMap[matching.status] }}
                          </span>
                        </td>
                        <td>{{ matching.matchingTime }}</td>
                        <td>
                          <router-link :to="'/matching/' + matching.id" class="btn btn-sm btn-info">查看详情</router-link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-if="userMatchings.length === 0" class="no-records">
                  暂无匹配记录
                </div>
              </div>

              <!-- 待评价 -->
              <div v-if="activeTab === 'evaluations'" class="tab-panel">
                <h3>待评价</h3>
                <div v-if="loadingEvaluations" class="no-records">
                  加载中...
                </div>
                <div v-else class="table-container">
                  <table class="record-table">
                    <thead>
                      <tr>
                        <th>物流ID</th>
                        <th>物资名称</th>
                        <th>数量</th>
                        <th>到达时间</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in pendingEvaluations" :key="item.id">
                        <td>{{ item.id }}</td>
                        <td>{{ item.materialName }}</td>
                        <td>{{ item.quantity }} {{ item.unit }}</td>
                        <td>{{ item.arrivalTime }}</td>
                        <td>
                          <button class="btn btn-sm btn-primary" @click="openEvaluationModal(item)">去评价</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-if="!loadingEvaluations && pendingEvaluations.length === 0" class="no-records">
                  暂无待评价
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUserInfo, updateUserInfo, updatePassword, deleteUser, getLogisticsList, getEvaluationByMatchId, createEvaluation, createDefaultEvaluation } from '../services/api.js'

export default {
  name: 'UserCenterPage',
  data() {
    return {
      userInfo: {
        username: '',
        realName: '',
        phone: '',
        email: '',
        registerTime: ''
      },
      // 编辑信息相关
      isEditing: false,
      editForm: {},
      originalUserInfo: {},
      userDonations: [
        {
          id: 1001,
          materialName: '矿泉水',
          quantity: 1000,
          unit: '箱',
          status: 'delivered',
          createTime: '2024-05-20 14:30'
        },
        {
          id: 1002,
          materialName: '方便面',
          quantity: 500,
          unit: '箱',
          status: 'matched',
          createTime: '2024-05-22 09:15'
        }
      ],
      userDemands: [
        {
          id: 2001,
          disasterArea: '四川地震灾区',
          materialName: '帐篷',
          quantity: 200,
          unit: '顶',
          urgency: 'urgent',
          status: 'matched',
          createTime: '2024-05-21 16:45'
        }
      ],
      userMatchings: [
        {
          id: 3001,
          donationMaterial: '矿泉水',
          demandArea: '四川地震灾区',
          matchDegree: 95,
          status: 'confirmed',
          matchingTime: '2024-05-21 10:30'
        }
      ],
      activeTab: 'donations',
      tabs: [
        { label: '我的捐赠', value: 'donations' },
        { label: '我的需求', value: 'demands' },
        { label: '我的匹配', value: 'matchings' },
        { label: '待评价', value: 'evaluations' }
      ],
      // 待评价列表
      pendingEvaluations: [],
      loadingEvaluations: false,

      statusMap: {
        pending: '待审核',
        approved: '已审核',
        matched: '已匹配',
        delivering: '运输中',
        delivered: '已送达',
        completed: '已完成',
        cancelled: '已取消'
      },
      urgencyMap: {
        normal: '一般',
        urgent: '紧急',
        veryUrgent: '非常紧急'
      },
      matchingStatusMap: {
        pending: '待确认',
        confirmed: '已确认',
        cancelled: '已取消'
      },
      // 修改密码弹窗
      showPasswordModal: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordErrors: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      // 删除账号弹窗
      showDeleteModal: false,
      deleteConfirmText: '',
      // 评价弹窗
      showEvaluationModal: false,
      currentEvaluationItem: {},
      evaluationForm: {
        score: 0,
        content: ''
      },
      evaluationError: ''
    }
  },
  mounted() {
    this.loadUserInfo();
    this.loadPendingEvaluations();
  },
  methods: {
    getMatchDegreeClass(degree) {
      if (degree >= 90) return 'high';
      if (degree >= 70) return 'medium';
      return 'low';
    },
    // 加载用户信息
    async loadUserInfo() {
      try {
        const res = await getUserInfo();
        if (res.success) {
          const data = res.data;
          this.userInfo = {
            username: data.uname,
            realName: data.uname,
            phone: data.phone,
            email: data.email,
            registerTime: data.createTime
          };
        }
      } catch (error) {
        alert('获取用户信息失败：' + error.message);
      }
    },
    // 编辑信息相关方法
    startEdit() {
      this.isEditing = true;
      // 复制当前用户信息到编辑表单
      this.editForm = JSON.parse(JSON.stringify(this.userInfo));
      // 保存原始信息以便取消编辑时恢复
      this.originalUserInfo = JSON.parse(JSON.stringify(this.userInfo));
    },
    async saveEdit() {
      // 验证表单数据
      if (!this.editForm.username || !this.editForm.phone) {
        alert('用户名和手机号不能为空');
        return;
      }
      
      // 简单的邮箱格式验证（如果填写了）
      if (this.editForm.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.editForm.email)) {
          alert('请输入有效的邮箱地址');
          return;
        }
      }
      
      // 简单的手机号格式验证
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(this.editForm.phone)) {
        alert('请输入有效的手机号码');
        return;
      }
      
      try {
        const res = await updateUserInfo(
          this.editForm.username,
          this.editForm.phone,
          this.editForm.email
        );
        
        if (res.success) {
          // 保存编辑后的信息
          this.userInfo = JSON.parse(JSON.stringify(this.editForm));
          this.isEditing = false;
          alert('信息编辑成功');
        }
      } catch (error) {
        alert('保存失败：' + error.message);
      }
    },
    cancelEdit() {
      // 恢复原始信息并退出编辑模式
      this.userInfo = JSON.parse(JSON.stringify(this.originalUserInfo));
      this.isEditing = false;
    },
    // 修改密码相关方法
    changePassword() {
      this.showPasswordModal = true;
      this.passwordForm = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      this.passwordErrors = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    },
    closePasswordModal() {
      this.showPasswordModal = false;
    },
    clearPasswordError(field) {
      if (this.passwordErrors[field]) {
        this.passwordErrors[field] = '';
      }
    },
    validatePasswordForm() {
      let isValid = true;
      Object.keys(this.passwordErrors).forEach(key => this.passwordErrors[key] = '');

      if (!this.passwordForm.oldPassword) {
        this.passwordErrors.oldPassword = '请输入旧密码';
        isValid = false;
      }

      if (!this.passwordForm.newPassword) {
        this.passwordErrors.newPassword = '请输入新密码';
        isValid = false;
      } else if (this.passwordForm.newPassword.length < 6) {
        this.passwordErrors.newPassword = '密码至少6个字符';
        isValid = false;
      }

      if (!this.passwordForm.confirmPassword) {
        this.passwordErrors.confirmPassword = '请确认新密码';
        isValid = false;
      } else if (this.passwordForm.confirmPassword !== this.passwordForm.newPassword) {
        this.passwordErrors.confirmPassword = '两次输入的密码不一致';
        isValid = false;
      }

      return isValid;
    },
    async submitPasswordChange() {
      if (!this.validatePasswordForm()) return;

      try {
        const res = await updatePassword(
          this.passwordForm.oldPassword,
          this.passwordForm.newPassword
        );

        if (res.success) {
          alert('密码修改成功！请使用新密码重新登录');
          this.showPasswordModal = false;
          // 可选：退出登录
          // localStorage.removeItem('accessToken');
          // localStorage.removeItem('refreshToken');
          // this.$router.push('/login');
        }
      } catch (error) {
        alert(error.message || '修改密码失败');
      }
    },
    // 删除账号相关方法
    confirmDeleteUser() {
      this.showDeleteModal = true;
      this.deleteConfirmText = '';
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.deleteConfirmText = '';
    },
    async handleDeleteUser() {
      if (this.deleteConfirmText !== '确认删除') {
        alert('请输入正确的确认文字');
        return;
      }

      if (!confirm('确定要永久删除您的账号吗？此操作不可恢复！')) {
        return;
      }

      try {
        const res = await deleteUser();
        if (res.success) {
          alert('账号删除成功');
          // 清除本地存储的token
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('rememberLogin');
          // 跳转到登录页
          this.$router.push('/login');
        }
      } catch (error) {
        alert(error.message || '删除账号失败');
      }
    },
    // 评价相关方法
    async loadPendingEvaluations() {
      this.loadingEvaluations = true;
      try {
        // 获取已到达的物流列表
        const res = await getLogisticsList('arrived', 1, 100);
        if (res.success && res.data && res.data.list) {
          const arrivedLogistics = res.data.list;
          
          // 过滤出未评价的物流
          const pendingList = [];
          for (const item of arrivedLogistics) {
            try {
              // 查询该物流是否已有评价
              const evalRes = await getEvaluationByMatchId(item.match_id);
              if (!evalRes.success || !evalRes.data) {
                // 没有评价，加入待评价列表
                pendingList.push({
                  id: item.id,
                  matchId: item.match_id,
                  materialName: item.material_name || '-',
                  quantity: item.quantity || 0,
                  unit: item.unit || '件',
                  arrivalTime: item.eta ? new Date(item.eta).toLocaleString() : '-',
                  disasterAreaId: item.disaster_area_id
                });
              }
            } catch (e) {
              // 查询失败，假设没有评价
              pendingList.push({
                id: item.id,
                matchId: item.match_id,
                materialName: item.material_name || '-',
                quantity: item.quantity || 0,
                unit: item.unit || '件',
                arrivalTime: item.eta ? new Date(item.eta).toLocaleString() : '-',
                disasterAreaId: item.disaster_area_id
              });
            }
          }
          this.pendingEvaluations = pendingList;
        }
      } catch (error) {
        console.error('加载待评价列表失败:', error);
      } finally {
        this.loadingEvaluations = false;
      }
    },
    openEvaluationModal(item) {
      // 检查是否超过7天
      const arrivalTime = new Date(item.arrivalTime);
      const now = new Date();
      const daysDiff = (now - arrivalTime) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 7) {
        // 超过7天，创建默认评价
        if (confirm('该物资已到达超过7天，将使用系统默认评价，是否继续？')) {
          this.createDefaultEval(item);
        }
        return;
      }
      
      this.currentEvaluationItem = item;
      this.evaluationForm = { score: 0, content: '' };
      this.evaluationError = '';
      this.showEvaluationModal = true;
    },
    closeEvaluationModal() {
      this.showEvaluationModal = false;
      this.currentEvaluationItem = {};
      this.evaluationForm = { score: 0, content: '' };
      this.evaluationError = '';
    },
    async submitEvaluation() {
      if (!this.evaluationForm.score) {
        this.evaluationError = '请选择评分';
        return;
      }
      
      try {
        const res = await createEvaluation({
          match_id: this.currentEvaluationItem.matchId,
          disaster_area_id: this.currentEvaluationItem.disasterAreaId,
          score: this.evaluationForm.score,
          content: this.evaluationForm.content || '用户未填写评价内容',
          tags: [],
          evaluator_id: localStorage.getItem('userId') || '1',
          evaluator_name: this.userInfo.realName || this.userInfo.username
        });
        
        if (res.success) {
          alert('评价提交成功！');
          this.closeEvaluationModal();
          this.loadPendingEvaluations(); // 刷新列表
        }
      } catch (error) {
        this.evaluationError = error.message || '提交评价失败';
      }
    },
    async createDefaultEval(item) {
      try {
        const res = await createDefaultEvaluation(item.matchId, item.disasterAreaId);
        if (res.success) {
          alert('已生成默认评价');
          this.loadPendingEvaluations(); // 刷新列表
        }
      } catch (error) {
        alert('生成默认评价失败: ' + error.message);
      }
    }
  }
}
</script>

<style scoped>
.user-center-page {
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.card-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.card-body {
  padding: 20px;
}

.user-info-section {
  margin-bottom: 30px;
}

.user-info-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #555;
  font-size: 18px;
}

.user-info {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item label {
  width: 120px;
  font-weight: 600;
  color: #666;
}

.info-item span {
  color: #333;
  font-size: 16px;
}

.form-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  width: 250px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.edit-form {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  margin-bottom: 15px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.tabs-section {
  border: 1px solid #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.tabs {
  display: flex;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.tab-button {
  padding: 12px 20px;
  background: none;
  border: none;
  border-right: 1px solid #e9ecef;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: all 0.3s;
}

.tab-button:last-child {
  border-right: none;
}

.tab-button:hover {
  background-color: #e9ecef;
}

.tab-button.active {
  background-color: #fff;
  color: #007bff;
  border-bottom: 2px solid #007bff;
}

.tab-content {
  padding: 20px;
}

.tab-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #555;
  font-size: 18px;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.record-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
}

.record-table th,
.record-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.record-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #666;
}

.record-table tr:hover {
  background-color: #f5f5f5;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.status-badge.pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-badge.matched {
  background-color: #cce7ff;
  color: #0056b3;
}

.status-badge.delivering {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-badge.delivered {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.completed {
  background-color: #c3e6cb;
  color: #0b2e13;
}

.status-badge.cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.urgency-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.urgency-badge.normal {
  background-color: #d4edda;
  color: #155724;
}

.urgency-badge.urgent {
  background-color: #fff3cd;
  color: #856404;
}

.urgency-badge.veryUrgent {
  background-color: #f8d7da;
  color: #721c24;
}



.match-degree {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.match-degree.high {
  background-color: #d4edda;
  color: #155724;
}

.match-degree.medium {
  background-color: #fff3cd;
  color: #856404;
}

.match-degree.low {
  background-color: #f8d7da;
  color: #721c24;
}

.no-records {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
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

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover {
  background-color: #138496;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  line-height: 1;
}

.modal-close:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.modal-body .form-group {
  margin-bottom: 16px;
}

.modal-body .form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.modal-body .form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.modal-body .form-group input:focus {
  outline: none;
  border-color: #007bff;
}

.error-text {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
}

/* 删除按钮样式 */
.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 警告文本样式 */
.warning-text {
  color: #dc3545;
  font-weight: 500;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-text i {
  font-size: 18px;
}

/* 星级评分样式 */
.star-rating {
  display: flex;
  gap: 8px;
  font-size: 28px;
}

.star {
  cursor: pointer;
  color: #ddd;
  transition: color 0.2s;
}

.star.active {
  color: #ffc107;
}

.star:hover {
  color: #ffc107;
}

.modal-body textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  resize: vertical;
}

.modal-body textarea:focus {
  outline: none;
  border-color: #007bff;
}
</style>