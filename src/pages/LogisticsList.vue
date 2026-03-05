<template>
  <div class="logistics-list">
    <h2>物流列表</h2>
    <div class="filter-section">
      <div class="filter-row">
        <div class="filter-group">
          <label for="search">搜索：</label>
          <input type="text" id="search" v-model="searchQuery" placeholder="输入物流单号或物资名称">
        </div>
        <div class="filter-group">
          <label for="status">物流状态：</label>
          <select id="status" v-model="filterStatus">
            <option value="">全部</option>
            <option value="pending">待发货</option>
            <option value="transporting">运输中</option>
            <option value="delivered">已送达</option>
            <option value="received">已签收</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>
        <div class="filter-group">
          <button class="btn btn-primary" @click="applyFilters">应用筛选</button>
          <button class="btn btn-secondary" @click="resetFilters">重置</button>
        </div>
      </div>
    </div>
    
    <div class="logistics-table-container">
      <table class="logistics-table">
        <thead>
          <tr>
            <th>物流ID</th>
            <th>物流单号</th>
            <th>物资名称</th>
            <th>数量</th>
            <th>物流公司</th>
            <th>当前状态</th>
            <th>当前位置</th>
            <th>预计送达</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="logistics in filteredLogistics" :key="logistics.id">
            <td>{{ logistics.id }}</td>
            <td>{{ logistics.trackingNumber }}</td>
            <td>{{ logistics.materialName }}</td>
            <td>{{ logistics.quantity }} {{ logistics.unit }}</td>
            <td>{{ logistics.carrier }}</td>
            <td>
              <span :class="['status-badge', logistics.status]">
                {{ statusMap[logistics.status] }}
              </span>
            </td>
            <td>{{ logistics.currentLocation }}</td>
            <td>{{ logistics.estimatedDelivery }}</td>
            <td>
              <router-link :to="'/logistics/' + logistics.id" class="btn btn-sm btn-info">查看详情</router-link>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="loading" class="no-results">
        加载中...
      </div>
      <div v-else-if="filteredLogistics.length === 0" class="no-results">
        暂无物流信息
      </div>
    </div>
    
    <div class="pagination">
      <button class="btn btn-sm" @click="currentPage = 1" :disabled="currentPage === 1">首页</button>
      <button class="btn btn-sm" @click="currentPage--" :disabled="currentPage === 1">上一页</button>
      <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
      <button class="btn btn-sm" @click="currentPage++" :disabled="currentPage === totalPages">下一页</button>
      <button class="btn btn-sm" @click="currentPage = totalPages" :disabled="currentPage === totalPages">末页</button>
    </div>
  </div>
</template>

<script>
import { getLogisticsList } from '../services/api.js'

export default {
  name: 'LogisticsList',
  data() {
    return {
      logisticsList: [],
      searchQuery: '',
      filterStatus: '',
      currentPage: 1,
      itemsPerPage: 10,
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
    this.loadLogisticsList()
  },
  computed: {
    filteredLogistics() {
      let results = [...this.logisticsList];
      
      // 搜索筛选
      if (this.searchQuery) {
        const searchLower = this.searchQuery.toLowerCase();
        results = results.filter(logistics => 
          logistics.trackingNumber.toLowerCase().includes(searchLower) ||
          logistics.materialName.toLowerCase().includes(searchLower)
        );
      }
      
      // 状态筛选
      if (this.filterStatus) {
        results = results.filter(logistics => logistics.status === this.filterStatus);
      }
      
      // 分页
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      return results.slice(startIndex, startIndex + this.itemsPerPage);
    },
    totalPages() {
      let results = [...this.logisticsList];
      
      // 应用筛选逻辑
      if (this.searchQuery) {
        const searchLower = this.searchQuery.toLowerCase();
        results = results.filter(logistics => 
          logistics.trackingNumber.toLowerCase().includes(searchLower) ||
          logistics.materialName.toLowerCase().includes(searchLower)
        );
      }
      
      if (this.filterStatus) {
        results = results.filter(logistics => logistics.status === this.filterStatus);
      }
      
      return Math.ceil(results.length / this.itemsPerPage);
    }
  },
  methods: {
    async loadLogisticsList() {
      this.loading = true
      try {
        const res = await getLogisticsList(this.filterStatus, this.currentPage, this.itemsPerPage)
        console.log('获取物流列表:', res)
        
        if (res.success && res.data && res.data.list) {
          // 映射后端数据到前端格式
          this.logisticsList = res.data.list.map(item => ({
            id: item.id,
            trackingNumber: item.tracking_number || '-',
            materialName: item.material_name || '-',
            quantity: item.quantity || 0,
            unit: item.unit || '件',
            carrier: item.logistics_company || '-',
            status: item.status || 'pending',
            currentLocation: item.current_location || '-',
            estimatedDelivery: item.eta ? new Date(item.eta).toLocaleString() : '-',
            startLocation: item.start_location || '-',
            destination: item.destination || '-',
            donationId: item.donation_id,
            demandId: item.demand_id
          }))
          console.log('物流列表加载成功:', this.logisticsList.length, '条')
        } else {
          console.log('获取物流列表失败:', res.message)
          this.logisticsList = []
        }
      } catch (error) {
        console.error('获取物流列表出错:', error)
        this.logisticsList = []
      } finally {
        this.loading = false
      }
    },
    applyFilters() {
      this.currentPage = 1
      this.loadLogisticsList()
    },
    resetFilters() {
      this.searchQuery = ''
      this.filterStatus = ''
      this.currentPage = 1
      this.loadLogisticsList()
    }
  }
}
</script>

<style scoped>
.logistics-list {
  padding: 20px;
}

.filter-section {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: 600;
  color: #666;
}

.filter-group input,
.filter-group select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.filter-group input {
  width: 250px;
}

.logistics-table-container {
  overflow-x: auto;
}

.logistics-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.logistics-table th,
.logistics-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.logistics-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.logistics-table tr:hover {
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

.no-results {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.page-info {
  color: #666;
  font-size: 14px;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #545b62;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background-color: #138496;
}
</style>