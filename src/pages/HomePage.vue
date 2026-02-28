<template>
  <div class="home-page">
    <!-- 英雄区域 -->
    <section class="hero">
      <div class="container">
        <h1>AI智能物资分配系统</h1>
        <p>利用人工智能技术，高效匹配捐赠物资与灾区需求，让每一份爱心都能及时送达</p>
        <div class="hero-buttons">
          <router-link to="/donation/create" class="btn btn-primary">发布捐赠</router-link>
          <router-link to="/demand/create" class="btn btn-secondary">发布需求</router-link>
          <router-link to="/disaster" class="btn btn-disaster">灾区详情</router-link>
        </div>
      </div>
    </section>

    <!-- 数据统计 -->
    <section class="stats">
      <div class="container">
        <div class="stats-container">
          <div v-for="(stat, index) in stats" :key="index" class="stat-item">
            <div class="stat-number">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 最新匹配成功案例 -->
    <section class="matching-cases">
      <div class="container">
        <h2>最新匹配成功案例</h2>
        <div class="cases-container">
          <div v-for="caseItem in matchingCases" :key="caseItem.id" class="case-item card">
            <div class="case-donor">捐赠方：{{ caseItem.donor }}</div>
            <div class="case-recipient">接收方：{{ caseItem.recipient }}</div>
            <div class="case-material">物资：{{ caseItem.material }}</div>
            <div class="case-quantity">数量：{{ caseItem.quantity }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 如何使用 -->
    <section class="how-it-works">
      <div class="container">
        <h2>如何使用</h2>
        <div class="steps-container">
          <div v-for="step in steps" :key="step.number" class="step-item">
            <div class="step-number">{{ step.number }}</div>
            <div class="step-title">{{ step.title }}</div>
            <div class="step-description">{{ step.description }}</div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      // 模拟数据
      stats: [
        { label: '总捐赠物资数', value: '12,345' },
        { label: '总匹配成功数', value: '8,901' },
        { label: '总帮助灾区数', value: '123' },
        { label: '受益人数', value: '45,678' }
      ],
      matchingCases: [
        { id: 1, donor: '爱心企业', recipient: '某地震灾区', material: '食品、水', quantity: '500箱' },
        { id: 2, donor: '志愿者团队', recipient: '某洪水灾区', material: '帐篷、衣物', quantity: '200件' },
        { id: 3, donor: '社会捐赠', recipient: '某台风灾区', material: '药品、医疗设备', quantity: '100套' },
        { id: 4, donor: '基金会', recipient: '某干旱灾区', material: '饮用水、食品', quantity: '800箱' },
        { id: 5, donor: '企业联盟', recipient: '某冰雪灾区', material: '取暖设备、衣物', quantity: '300套' },
        { id: 6, donor: '爱心人士', recipient: '某泥石流灾区', material: '帐篷、食品', quantity: '150箱' }
      ],
      steps: [
        { number: 1, title: '发布信息', description: '捐赠者发布捐赠物资信息或灾区发布需求信息' },
        { number: 2, title: 'AI智能匹配', description: '系统自动匹配最合适的捐赠物资和灾区需求' },
        { number: 3, title: '确认匹配', description: '双方确认匹配结果，准备物资运输' },
        { number: 4, title: '物流跟踪', description: '实时跟踪物资运输状态，确保及时送达' }
      ]
    }
  }
}
</script>

<style scoped>
.hero-buttons {
  margin-top: 30px;
}

/* 确保按钮样式正确应用 */
.hero-buttons .btn {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s ease;
  margin: 0 10px;
  display: inline-block;
}

.hero-buttons .btn-primary {
  background-color: #007bff;
  color: white;
}

.hero-buttons .btn-primary:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.hero-buttons .btn-secondary {
  background-color: #6c757d;
  color: white;
}

.hero-buttons .btn-secondary:hover {
  background-color: #545b62;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3);
}

.hero-buttons .btn-disaster {
  background-color: #C2704A;
  color: white;
}

.hero-buttons .btn-disaster:hover {
  background-color: #A85D3A;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(194, 112, 74, 0.3);
}
</style>