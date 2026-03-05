<template>
  <div class="logistics-detail">
    <div class="card">
      <div class="card-header">
        <h2>物流详情</h2>
        <div class="header-actions">
          <button class="btn btn-secondary" @click="goBack">返回列表</button>
        </div>
      </div>
      <div class="card-body">
        <div class="detail-section">
          <h3>物流基本信息</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>物流ID：</label>
              <span>{{ logisticsDetail.id }}</span>
            </div>
            <div class="detail-item">
              <label>物流单号：</label>
              <span class="tracking-number">{{ logisticsDetail.trackingNumber }}</span>
            </div>
            <div class="detail-item">
              <label>物流公司：</label>
              <span>{{ logisticsDetail.carrier }}</span>
            </div>
            <div class="detail-item">
              <label>物流状态：</label>
              <span :class="['status-badge', logisticsDetail.status]">
                {{ statusMap[logisticsDetail.status] }}
              </span>
            </div>
            <div class="detail-item">
              <label>当前位置：</label>
              <span>{{ logisticsDetail.currentLocation }}</span>
            </div>
            <div class="detail-item">
              <label>预计送达：</label>
              <span>{{ logisticsDetail.estimatedDelivery }}</span>
            </div>
            <div class="detail-item">
              <label>发货地点：</label>
              <span>{{ logisticsDetail.startLocation }}</span>
            </div>
            <div class="detail-item">
              <label>目的地：</label>
              <span>{{ logisticsDetail.destination }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>物资信息</h3>
          <div class="info-card">
            <div class="detail-grid">
              <div class="detail-item">
                <label>物资名称：</label>
                <span>{{ logisticsDetail.materialName }}</span>
              </div>
              <div class="detail-item">
                <label>数量：</label>
                <span>{{ logisticsDetail.quantity }} {{ logisticsDetail.unit }}</span>
              </div>
              <div class="detail-item">
                <label>捐赠ID：</label>
                <span>{{ logisticsDetail.donationId }}</span>
              </div>
              <div class="detail-item">
                <label>需求ID：</label>
                <span>{{ logisticsDetail.demandId }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>捐赠方信息</h3>
          <div class="info-card">
            <div class="detail-grid">
              <div class="detail-item">
                <label>捐赠方名称：</label>
                <span>{{ logisticsDetail.donorInfo.donorName }}</span>
              </div>
              <div class="detail-item">
                <label>联系人：</label>
                <span>{{ logisticsDetail.donorInfo.contactName }}</span>
              </div>
              <div class="detail-item">
                <label>联系电话：</label>
                <span>{{ logisticsDetail.donorInfo.contactPhone }}</span>
              </div>
              <div class="detail-item">
                <label>捐赠地址：</label>
                <span>{{ logisticsDetail.donorInfo.address }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>需求方信息</h3>
          <div class="info-card">
            <div class="detail-grid">
              <div class="detail-item">
                <label>需求方名称：</label>
                <span>{{ logisticsDetail.demandInfo.demandName }}</span>
              </div>
              <div class="detail-item">
                <label>联系人：</label>
                <span>{{ logisticsDetail.demandInfo.contactName }}</span>
              </div>
              <div class="detail-item">
                <label>联系电话：</label>
                <span>{{ logisticsDetail.demandInfo.contactPhone }}</span>
              </div>
              <div class="detail-item">
                <label>需求地址：</label>
                <span>{{ logisticsDetail.demandInfo.address }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h3>物流跟踪记录</h3>
          <div class="tracking-record">
            <div v-for="(record, index) in logisticsDetail.trackingRecords" :key="index" class="record-item">
              <div class="record-time">{{ record.time }}</div>
              <div class="record-content">{{ record.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getLogisticsDetail } from '../services/api.js'

export default {
  name: 'LogisticsDetail',
  data() {
    return {
      logisticsDetail: {
        id: '',
        trackingNumber: '-',
        materialName: '-',
        quantity: 0,
        unit: '件',
        carrier: '-',
        status: 'pending',
        currentLocation: '-',
        estimatedDelivery: '-',
        startLocation: '-',
        destination: '-',
        donationId: '',
        demandId: '',
        donorInfo: {
          donorName: '-',
          contactName: '-',
          contactPhone: '-',
          address: '-'
        },
        demandInfo: {
          demandName: '-',
          contactName: '-',
          contactPhone: '-',
          address: '-'
        },
        trackingRecords: []
      },
      loading: false,
      statusMap: {
        pending: '待发货',
        transporting: '运输中',
        delivered: '已送达',
        received: '已签收',
        arrived: '已到达',
        cancelled: '已取消'
      }
    }
  },
  mounted() {
    this.loadLogisticsDetail()
  },
  methods: {
    async loadLogisticsDetail() {
      const logisticsId = this.$route.params.id
      console.log('获取物流详情，ID:', logisticsId)
      
      if (!logisticsId) {
        console.error('物流ID为空')
        return
      }
      
      this.loading = true
      try {
        const res = await getLogisticsDetail(logisticsId)
        console.log('物流详情返回:', res)
        
        if (res.success && res.data) {
          const data = res.data
          this.logisticsDetail = {
            id: data.id,
            trackingNumber: data.tracking_number || '-',
            materialName: data.material_name || '-',
            quantity: data.quantity || 0,
            unit: data.unit || '件',
            carrier: data.logistics_company || '-',
            status: data.status || 'pending',
            currentLocation: data.current_location || '-',
            estimatedDelivery: data.eta ? new Date(data.eta).toLocaleString() : '-',
            startLocation: data.start_location || '-',
            destination: data.destination || '-',
            donationId: data.donation_id,
            demandId: data.demand_id,
            donorInfo: {
              donorName: data.donor_name || '-',
              contactName: data.donor_contact_name || '-',
              contactPhone: data.donor_contact_phone || '-',
              address: data.donor_address || '-'
            },
            demandInfo: {
              demandName: data.demand_name || '-',
              contactName: data.demand_contact_name || '-',
              contactPhone: data.demand_contact_phone || '-',
              address: data.demand_address || '-'
            },
            trackingRecords: data.tracking_records || []
          }
          console.log('物流详情加载成功')
        } else {
          console.error('获取物流详情失败:', res.message)
        }
      } catch (error) {
        console.error('获取物流详情出错:', error)
      } finally {
        this.loading = false
      }
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
.logistics-detail {
  padding: 20px;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.card-body {
  padding: 20px;
}

.detail-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.detail-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.detail-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #555;
  font-size: 18px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item label {
  font-weight: 600;
  color: #666;
  font-size: 14px;
}

.detail-item span {
  color: #333;
  font-size: 16px;
}

.tracking-number {
  font-weight: bold;
  color: #007bff;
}

.info-card {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
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

.status-badge.transporting {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-badge.delivered {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.received {
  background-color: #c3e6cb;
  color: #0b2e13;
}

.status-badge.cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.status-badge.arrived {
  background-color: #e2d4f0;
  color: #6b2c91;
}

.tracking-record {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.record-item {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.record-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.record-time {
  font-weight: 600;
  color: #666;
  margin-bottom: 5px;
  font-size: 14px;
}

.record-content {
  color: #333;
  font-size: 16px;
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

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}
</style>