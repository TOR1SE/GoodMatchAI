<template>
  <div class="disaster-page">
    <!-- 首页 -->
    <div v-if="currentView === 'home'">
      <div class="hero-section">
        <div class="container">
          <div class="hero-content">
            <div class="logo">
              <div class="logo-icon">❤️</div>
              <div class="logo-text">援心相连</div>
            </div>
            <h1 class="hero-title">愿每一份心意，都能抵达需要的人身边</h1>
            <p class="hero-subtitle">我们相信，温暖的力量可以跨越距离。了解灾区情况，用您的方式，为远方的人送去一份实在的帮助。</p>

            <div class="stats-container">
              <div class="stat-item">
                <span class="stat-number">{{ disasterAreas.length }}</span>
                <span class="stat-label">援助地区</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">3.2万+</span>
                <span class="stat-label">受灾乡亲</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">¥ 2,150万</span>
                <span class="stat-label">汇聚善款</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">86</span>
                <span class="stat-label">援助项目</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container">
        <section class="card-section">
          <h2 class="section-title">需要帮助的地方</h2>
          <div class="card-grid">
            <div class="disaster-card" v-for="area in disasterAreas" :key="area.id">
              <div class="card-badge">{{ area.severityText }}</div>
              <div class="card-image-container">
                <img :src="area.image" :alt="area.name" class="card-image">
                <div class="image-overlay"></div>
              </div>
              <div class="card-content">
                <div class="card-header">
                  <h3 class="card-title">{{ area.name }}</h3>
                  <div class="severity-indicator" :style="{background: area.severityColor}"></div>
                </div>
                <div class="card-location">
                  <span class="location-icon">📍</span> {{ area.location }}
                </div>
                <p class="card-description">{{ area.description }}</p>

                <div class="card-stats">
                  <div class="card-stat">
                    <span class="card-stat-value">{{ formatNumber(area.affectedPeople) }}</span>
                    <span class="card-stat-label">受灾人数</span>
                  </div>
                  <div class="card-stat">
                    <span class="card-stat-value">{{ area.damagedHouses }}+</span>
                    <span class="card-stat-label">房屋受损</span>
                  </div>
                  <div class="card-stat">
                    <span class="card-stat-value">{{ area.daysSince }}天</span>
                    <span class="card-stat-label">时间过去</span>
                  </div>
                </div>

                <div class="card-actions">
                  <button class="btn btn-detail" @click="showDetail(area)">
                    <span>了解更多</span>
                  </button>
                  <button class="btn btn-donate" @click="showDonate(area)">
                    <span>提供帮助</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- 详情页 -->
    <div v-if="currentView === 'detail' && currentArea">
      <div class="container">
        <div class="detail-container">
          <div class="detail-header">
            <div class="detail-title-container">
              <h1 class="detail-title">{{ currentArea.name }}</h1>
              <div class="detail-subtitle">
                <span class="location-icon">📍</span> {{ currentArea.location }}
              </div>
            </div>
            <a href="#" class="back-btn" @click.prevent="backToHome">
              <span>← 返回列表</span>
            </a>
          </div>

          <!-- 暖心留言墙 -->
          <BulletMessage 
            :disasterId="currentArea.id" 
            :disasterName="currentArea.name"
            :sectionId="currentSectionId"
          />

          <img :src="currentArea.detailImage || currentArea.image" :alt="currentArea.name" class="detail-image">

          <div class="detail-stats-grid">
            <div class="detail-stat-item">
              <span class="detail-stat-value">{{ formatNumber(currentArea.affectedPeople) }}</span>
              <span class="detail-stat-label">受灾人数</span>
            </div>
            <div class="detail-stat-item">
              <span class="detail-stat-value">{{ formatNumber(currentArea.damagedHouses) }}</span>
              <span class="detail-stat-label">房屋损毁</span>
            </div>
            <div class="detail-stat-item">
              <span class="detail-stat-value">{{ currentArea.rescueTeams }}</span>
              <span class="detail-stat-label">救援队伍</span>
            </div>
            <div class="detail-stat-item">
              <span class="detail-stat-value">¥ {{ formatNumber(currentArea.donations) }}</span>
              <span class="detail-stat-label">已筹善款</span>
            </div>
          </div>

          <div class="section">
            <div class="section-header">
              <div class="section-icon">📋</div>
              <h2 class="section-title">情况简介</h2>
            </div>
            <div class="section-content">
              <p>{{ currentArea.fullDescription }}</p>
            </div>
          </div>

          <!-- 文章详情 -->
          <div class="section" v-if="currentArticle">
            <div class="section-header">
              <div class="section-icon">📄</div>
              <h2 class="section-title">{{ currentArticle.title }}</h2>
            </div>
            <div class="section-content">
              <div class="article-meta" v-if="currentArticle.create_time">
                <span class="article-date">{{ new Date(currentArticle.create_time).toLocaleDateString() }}</span>
              </div>
              <p class="article-content">{{ currentArticle.content }}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-header">
              <div class="section-icon">📰</div>
              <h2 class="section-title">最近的消息</h2>
            </div>
            <div class="section-content">
              <div class="news-item" v-for="(news, index) in currentArea.news" :key="index">
                <h3 class="news-title">{{ news.title }}</h3>
                <div class="news-meta">
                  <span class="news-date">{{ news.date }}</span>
                  <span class="news-source">{{ news.source }}</span>
                </div>
                <p class="news-content">{{ news.content }}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-header">
              <div class="section-icon">⚠️</div>
              <h2 class="section-title">眼下最需要的</h2>
            </div>
            <div class="section-content">
              <div class="needs-list">
                <span class="need-tag" v-for="(item, index) in currentArea.urgentNeeds" :key="index">{{ item }}</span>
              </div>
            </div>
          </div>

          <button class="btn btn-donate" @click="showDonate(currentArea)" style="width: 100%; margin-top: 20px; padding: 18px;">
            <span>帮助 {{ currentArea.name }} 的乡亲们</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 帮助页 -->
    <div v-if="currentView === 'donate' && donateArea">
      <div class="container">
        <div class="donate-container">
          <div class="donate-header">
            <h1 class="donate-title">为 {{ donateArea.name }} 尽一份心</h1>
            <p class="donate-subtitle">您的每一份心意，都将通过当地救援组织，变成 {{ donateArea.location }} 乡亲们手中实实在在的帮助。</p>
          </div>

          <div class="donate-options">
            <div
              class="donate-option"
              v-for="option in donateOptions"
              :key="option.amount"
              :class="{selected: selectedAmount === option.amount}"
              @click="selectAmount(option.amount)"
            >
              <div class="donate-amount">¥ {{ option.amount }}</div>
              <div class="donate-description">{{ option.description }}</div>
            </div>
          </div>

          <div class="custom-amount">
            <label class="custom-amount-label">或其他金额</label>
            <input
              type="number"
              class="custom-amount-input"
              v-model="customAmount"
              placeholder="输入金额"
              @input="selectCustomAmount"
              min="1"
            >
          </div>

          <button class="donate-btn" @click="processDonation">
            <span>确认心意 ¥ {{ donationAmount }}</span>
          </button>

          <p style="margin-top: 30px; color: var(--gray); font-size: 14px; font-weight: 300;">
            所有善款由合作公益机构接收和执行，定期公布使用情况。
          </p>
        </div>

        <a href="#" class="back-btn" @click.prevent="backToHome" style="margin-bottom: 60px; display: inline-block;">
          <span>← 返回首页</span>
        </a>
      </div>
    </div>

    <!-- 援助顾问悬浮球 -->
    <div class="help-bubble" @click="openAdvisor">
      <div class="help-bubble-avatar">
        <i class="fas fa-heart"></i>
      </div>
      <div class="help-bubble-text">
        <div class="help-bubble-title">需要帮助？</div>
        <div class="help-bubble-desc">问问我们的援助顾问</div>
      </div>
    </div>

    <!-- 顾问窗口 -->
    <div class="advisor-overlay" v-if="advisorVisible" @click.self="closeAdvisor">
      <div class="advisor-window">
        <div class="advisor-header">
          <div class="advisor-avatar">
            <i class="fas fa-leaf"></i>
          </div>
          <div class="advisor-info">
            <div class="advisor-name">小援</div>
            <div class="advisor-title">援助顾问 · 很高兴为您服务</div>
          </div>
          <button class="advisor-close" @click="closeAdvisor"><i class="fas fa-times"></i></button>
        </div>
        <div class="advisor-messages" ref="advisorMessages">
          <div v-for="(msg, idx) in advisorMessages" :key="idx" :class="['message', msg.sender === 'advisor' ? 'advisor-message' : 'user-message']">
            <div class="msg-avatar" v-if="msg.sender === 'advisor'"><i class="fas fa-leaf"></i></div>
            <div class="msg-avatar" v-else><i class="fas fa-user"></i></div>
            <div class="msg-bubble">{{ msg.text }}</div>
          </div>
        </div>
        <div class="advisor-footer">
          <input
            type="text"
            v-model="advisorInput"
            placeholder="想问些什么..."
            @keyup.enter="sendAdvisorMessage"
          >
          <button @click="sendAdvisorMessage"><i class="fas fa-paper-plane"></i></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BulletMessage from '../components/BulletMessage.vue'
import ImageUploader from '../components/ImageUploader.vue'
import { getArticleList, getArticleDetail, createDisasterArea, generateArticle } from '../services/api.js'

export default {
  name: 'DisasterPage',
  components: {
    BulletMessage,
    ImageUploader
  },
  data() {
    return {
      currentView: 'home',
      currentArea: null,
      donateArea: null,
      selectedAmount: 100,
      customAmount: '',
      donateOptions: [
        { amount: 50, description: '提供几份热饭' },
        { amount: 100, description: '帮助一个家庭一天的用水' },
        { amount: 300, description: '支援应急生活包' },
        { amount: 500, description: '支持临时住所' },
        { amount: 1000, description: '帮助孩子继续上学' }
      ],
      currentArticle: null, // 当前灾区的文章
      currentSectionId: '', // 当前文章的 section_id
      disasterAreas: [
        {
          id: 1,
          name: '汶川震区重建',
          location: '四川·汶川',
          image: 'https://picsum.photos/seed/wenchuan/800/600',
          detailImage: 'https://picsum.photos/seed/wenchuan-detail/1200/800',
          description: '2008年地震后的重建工作仍在继续，一些家庭和孩子还需要帮助。',
          fullDescription: '汶川地震过去多年，但重建的路还很长。有些家庭仍然住在过渡房，一些孩子需要学习用品，老人们的心里也需要陪伴。当地正在一点点恢复，您的关注能让他们感到不孤单。',
          affectedPeople: 125000,
          damagedHouses: 45000,
          rescueTeams: 42,
          donations: 38500000,
          daysSince: 5680,
          severityColor: '#C2704A',
          severityText: '需要关注',
          urgentNeeds: ['学习用品', '过冬衣物', '心理陪伴', '建筑材料'],
          news: [
            { title: '汶川新建成一批安置房，500户家庭搬入新家', date: '2023年10月', source: '新华社', content: '这些新房子让一些等待多年的家庭有了安稳的住处，但还有一些人仍在等待。' },
            { title: '村里的学校重建了，孩子们有了新教室', date: '2023年9月', source: '人民日报', content: '三所新建学校投入使用，孩子们可以在安全的教室里上课了。' }
          ]
        },
        {
          id: 2,
          name: '河南暴雨之后',
          location: '河南·郑州及周边',
          image: 'https://picsum.photos/seed/henan/800/600',
          detailImage: 'https://picsum.photos/seed/henan-detail/1200/800',
          description: '2021年暴雨的痕迹还在，一些农田和房屋需要修缮。',
          fullDescription: '暴雨虽然过去，但一些农田被冲毁后还没来得及恢复，有的村民家里墙壁上还留着水痕。大家正在努力让生活回到正轨，但还需要一些时间。',
          affectedPeople: 14700000,
          damagedHouses: 210000,
          rescueTeams: 68,
          donations: 98500000,
          daysSince: 890,
          severityColor: '#5E8B6F',
          severityText: '持续恢复',
          urgentNeeds: ['农具', '排水设备', '消毒用品', '种子'],
          news: [
            { title: '郑州周边农村道路修复基本完成', date: '2023年11月', source: '央视新闻', content: '通往村里的路修好了，但一些农田的恢复才刚刚开始。' }
          ]
        },
        {
          id: 3,
          name: '泸定地震之后',
          location: '四川·泸定',
          image: 'https://picsum.photos/seed/luding/800/600',
          detailImage: 'https://picsum.photos/seed/luding-detail/1200/800',
          description: '2022年地震后，一些山里的村子还在临时安置点生活。',
          fullDescription: '泸定的地震让很多山里的房屋成了危房，乡亲们住在临时安置点，等着重建。山里冬天来得早，保暖物资是他们眼下最需要的。',
          affectedPeople: 82000,
          damagedHouses: 18500,
          rescueTeams: 35,
          donations: 45600000,
          daysSince: 460,
          severityColor: '#C2704A',
          severityText: '急需帮助',
          urgentNeeds: ['保暖衣物', '帐篷', '取暖设备', '医疗用品'],
          news: [
            { title: '临时安置点建起来了，但冬天不好过', date: '2023年9月', source: '四川日报', content: '安置点有了基本生活设施，但冬天的取暖还需要大家帮忙。' }
          ]
        },
        {
          id: 4,
          name: '北方旱情',
          location: '河北、山西等地',
          image: 'https://picsum.photos/seed/drought/800/600',
          detailImage: 'https://picsum.photos/seed/drought-detail/1200/800',
          description: '持续干旱让一些地方缺水，庄稼也受影响。',
          fullDescription: '今年雨水少，地里的庄稼长得不好，有些村子连喝水都成了问题。村民们每天要走很远的路去拉水，地里的收成也不够一家人吃了。',
          affectedPeople: 5200000,
          damagedHouses: 1200,
          rescueTeams: 28,
          donations: 18500000,
          daysSince: 150,
          severityColor: '#5E8B6F',
          severityText: '需要支援',
          urgentNeeds: ['饮用水', '储水桶', '抗旱作物种子', '灌溉设备'],
          news: [
            { title: '很多村子开始送水，但还是不够', date: '2023年8月', source: '人民日报', content: '送水车每天进村，但长远来看，需要更多办法帮助乡亲们度过旱情。' }
          ]
        }
      ],
      advisorVisible: false,
      advisorInput: '',
      advisorMessages: [
        { sender: 'advisor', text: '您好，我是小援。有什么我可以帮您的吗？比如想了解某个灾区的情况，或者想知道怎么提供帮助。' }
      ]
    }
  },
  computed: {
    donationAmount() {
      return this.customAmount ? parseInt(this.customAmount) : this.selectedAmount;
    }
  },
  methods: {
    formatNumber(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
      }
      return num.toLocaleString();
    },
    showDetail(area) {
      this.currentArea = area;
      this.currentView = 'detail';
      window.scrollTo(0, 0);
      // 获取当前灾区的文章
      this.loadArticleForCurrentArea();
    },

    // 获取当前灾区的文章
    async loadArticleForCurrentArea() {
      try {
        console.log('获取当前灾区的文章...');
        console.log('当前灾区:', this.currentArea?.name);
        this.currentArticle = null;
        this.currentSectionId = '';

        // 1. 获取文章列表
        const listRes = await getArticleList(1, 20);
        console.log('文章列表:', listRes);

        if (!listRes.success || !listRes.data || !listRes.data.list || listRes.data.list.length === 0) {
          console.log('没有获取到文章列表，使用写死的文章...');
          // 使用写死的文章数据
          this.currentArticle = {
            id: 999,
            title: '汶川震区重建：希望之路',
            content: '2008年5月12日，汶川发生了里氏8.0级特大地震，给当地人民生命财产造成了巨大损失。多年来，在全国人民的关心和支持下，汶川震区重建工作取得了显著成效。\n\n如今，新的城镇拔地而起，学校、医院等公共设施焕然一新。受灾群众住进了安全舒适的新居，孩子们在新教室里快乐学习。\n\n但重建之路依然漫长，一些家庭仍在努力恢复生产生活，需要社会各界的持续关注和支持。让我们携手同行，为汶川的明天贡献一份力量。',
            create_time: '2024-01-01T00:00:00Z',
            section_id: '2579a9a1-ab35-4e65-8143-88055d0523ed'
          };
          this.currentSectionId = '2579a9a1-ab35-4e65-8143-88055d0523ed';
          console.log('使用写死的文章:', this.currentArticle.title);
          console.log('使用写死的 section_id:', this.currentSectionId);
          return;
        }

        console.log('文章数量:', listRes.data.list.length);
        console.log('文章标题列表:', listRes.data.list.map(a => a.title));

        // 2. 根据灾区名称匹配文章
        const matchedArticle = listRes.data.list.find(article =>
          article.title && article.title.includes(this.currentArea.name)
        );

        if (matchedArticle) {
          console.log('找到匹配的文章:', matchedArticle.id, matchedArticle.title);

          // 3. 获取文章详情
          const detailRes = await getArticleDetail(matchedArticle.id);
          console.log('文章详情:', detailRes);

          if (detailRes.success && detailRes.data) {
            this.currentArticle = detailRes.data;
            // 提取 section_id
            this.currentSectionId = detailRes.data.section_id || '';
            console.log('文章加载成功:', this.currentArticle.title);
            console.log('获取到 section_id:', this.currentSectionId);
          } else {
            console.log('文章详情获取失败');
          }
        } else {
          console.log('没有找到匹配当前灾区的文章，使用写死的文章...');
          // 使用写死的文章数据
          this.currentArticle = {
            id: 999,
            title: '汶川震区重建：希望之路',
            content: '2008年5月12日，汶川发生了里氏8.0级特大地震，给当地人民生命财产造成了巨大损失。多年来，在全国人民的关心和支持下，汶川震区重建工作取得了显著成效。\n\n如今，新的城镇拔地而起，学校、医院等公共设施焕然一新。受灾群众住进了安全舒适的新居，孩子们在新教室里快乐学习。\n\n但重建之路依然漫长，一些家庭仍在努力恢复生产生活，需要社会各界的持续关注和支持。让我们携手同行，为汶川的明天贡献一份力量。',
            create_time: '2024-01-01T00:00:00Z',
            section_id: '2579a9a1-ab35-4e65-8143-88055d0523ed'
          };
          this.currentSectionId = '2579a9a1-ab35-4e65-8143-88055d0523ed';
          console.log('使用写死的文章:', this.currentArticle.title);
          console.log('使用写死的 section_id:', this.currentSectionId);
        }
      } catch (error) {
        console.error('获取文章失败:', error);
      }
    },

    // 为当前灾区创建文章
    async createArticleForCurrentArea() {
      try {
        console.log('为当前灾区创建文章...');

        // 1. 先创建灾区
        const disasterData = {
          name: this.currentArea.name,
          location: this.currentArea.location || '未知位置',
          description: this.currentArea.description || `${this.currentArea.name}需要帮助`,
          severity: 1,
          affected_population: this.currentArea.affectedPeople || 0,
          status: 'active'
        };

        console.log('创建灾区:', disasterData);
        const disasterRes = await createDisasterArea(disasterData);
        console.log('创建灾区结果:', disasterRes);

        if (!disasterRes.success || !disasterRes.data || !disasterRes.data.id) {
          console.error('创建灾区失败');
          return;
        }

        const disasterAreaId = disasterRes.data.id;
        console.log('灾区ID:', disasterAreaId);

        // 2. 生成文章
        const articleData = {
          disaster_area_id: disasterAreaId,
          prompt: `为${this.currentArea.name}生成一篇关怀文章，介绍灾区情况和救援进展，表达对灾区人民的关心和支持`
        };

        console.log('生成文章:', articleData);
        const articleRes = await generateArticle(articleData);
        console.log('生成文章结果:', articleRes);

        if (articleRes.success && articleRes.data) {
          console.log('文章创建成功:', articleRes.data);
          this.currentArticle = articleRes.data;
        } else {
          console.error('文章创建失败:', articleRes.message);
        }
      } catch (error) {
        console.error('创建文章失败:', error);
      }
    },

    showDonate(area) {
      this.donateArea = area;
      this.currentView = 'donate';
      this.selectedAmount = 100;
      this.customAmount = '';
      window.scrollTo(0, 0);
    },
    backToHome() {
      this.currentView = 'home';
      window.scrollTo(0, 0);
    },
    selectAmount(amount) {
      this.selectedAmount = amount;
      this.customAmount = '';
    },
    selectCustomAmount() {
      if (this.customAmount) {
        this.selectedAmount = 0;
      }
    },
    processDonation() {
      if (this.donationAmount < 1) {
        alert('请输入有效的金额');
        return;
      }
      alert(`感谢您的心意！您为 ${this.donateArea.name} 捐助 ¥ ${this.donationAmount.toLocaleString()} 元。\n\n捐赠编号：AID${Date.now().toString().slice(-8)}\n我们会通过短信告诉您后续的使用情况。`);
      this.backToHome();
    },
    openAdvisor() {
      this.advisorVisible = true;
      this.$nextTick(() => {
        const container = this.$refs.advisorMessages;
        if (container) container.scrollTop = container.scrollHeight;
      });
    },
    closeAdvisor() {
      this.advisorVisible = false;
    },
    sendAdvisorMessage() {
      if (!this.advisorInput.trim()) return;

      const userMsg = this.advisorInput;
      this.advisorMessages.push({ sender: 'user', text: userMsg });
      this.advisorInput = '';

      this.$nextTick(() => {
        const container = this.$refs.advisorMessages;
        if (container) container.scrollTop = container.scrollHeight;
      });

      setTimeout(() => {
        let reply = '';
        if (userMsg.includes('汶川') || userMsg.includes('四川')) {
          reply = '汶川那边主要是震后重建，现在最需要的是学习用品和过冬衣物。您可以通过"提供帮助"按钮支持他们。';
        } else if (userMsg.includes('河南') || userMsg.includes('暴雨')) {
          reply = '河南暴雨过后，很多农田需要恢复，农具和种子是眼下比较缺的。';
        } else if (userMsg.includes('泸定') || userMsg.includes('地震')) {
          reply = '泸定地震后，山里冬天冷，保暖衣物和帐篷还是很需要。';
        } else if (userMsg.includes('旱') || userMsg.includes('水')) {
          reply = '北方旱情还在持续，有些村子喝水都成问题，送水车每天都要进村。';
        } else if (userMsg.includes('怎么捐') || userMsg.includes('帮助')) {
          reply = '您点进灾区详情页，点击"提供帮助"按钮，就可以选择金额。所有善款都会用在当地乡亲们身上。';
        } else if (userMsg.includes('你好') || userMsg.includes('在吗')) {
          reply = '您好，我在呢。有什么想了解的，随时问我。';
        } else {
          reply = '谢谢您的关心。您是想了解哪个灾区的情况，还是想知道怎么提供帮助？';
        }

        this.advisorMessages.push({ sender: 'advisor', text: reply });

        this.$nextTick(() => {
          const container = this.$refs.advisorMessages;
          if (container) container.scrollTop = container.scrollHeight;
        });
      }, 600);
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', 'Noto Sans', sans-serif;
}

:root {
  --primary: #2B5F8A;
  --primary-light: #5C8DB9;
  --secondary: #5E8B6F;
  --secondary-light: #8BB5A0;
  --accent: #C2704A;
  --accent-light: #E8B4A2;
  --danger: #B54B4B;
  --light: #FDF8F2;
  --card-bg: #FFFFFF;
  --dark: #2E3F4E;
  --gray: #6F7E8C;
  --gray-light: #E2E0DA;
  --shadow: 0 15px 30px -15px rgba(45, 62, 80, 0.15);
  --shadow-hover: 0 25px 40px -15px rgba(45, 62, 80, 0.25);
  --gradient-primary: linear-gradient(145deg, #2B5F8A, #3C78A6);
  --gradient-secondary: linear-gradient(145deg, #5E8B6F, #7AA080);
  --gradient-accent: linear-gradient(145deg, #C2704A, #D9926C);
  --gradient-warm: linear-gradient(145deg, #E6B89C, #FAD5C0);
}

.disaster-page {
  background-color: #F5F1EB;
  color: var(--dark);
  line-height: 1.6;
  min-height: 100vh;
}

.container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 25px;
}

/* ===== 头部设计 ===== */
.hero-section {
  position: relative;
  background: linear-gradient(135deg, #1A3B4E 0%, #2B5F8A 100%);
  color: white;
  padding: 70px 0 50px;
  border-radius: 0 0 40px 40px;
  overflow: hidden;
  margin-bottom: 60px;
  box-shadow: 0 20px 30px -10px rgba(26, 59, 78, 0.3);
}

.hero-section::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 30%);
  pointer-events: none;
}

.hero-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
  gap: 15px;
}

.logo-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.logo-text {
  font-size: 40px;
  font-weight: 500;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
  font-family: 'Noto Serif SC', serif;
}

.hero-title {
  font-size: 32px;
  font-weight: 500;
  margin-bottom: 15px;
  line-height: 1.4;
  font-family: 'Noto Serif SC', serif;
  text-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.hero-subtitle {
  font-size: 18px;
  opacity: 0.95;
  margin-bottom: 40px;
  line-height: 1.7;
  font-weight: 300;
  max-width: 650px;
  margin-left: auto;
  margin-right: auto;
}

.stats-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 30px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  border-radius: 30px;
  padding: 22px 30px;
  min-width: 160px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s;
  box-shadow: 0 10px 20px -8px rgba(0,0,0,0.2);
}

.stat-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.stat-number {
  font-size: 36px;
  font-weight: 600;
  display: block;
  margin-bottom: 5px;
  font-family: 'Noto Serif SC', serif;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  letter-spacing: 1px;
  font-weight: 300;
}

/* ===== 卡片区域 ===== */
.section-title {
  font-size: 34px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 60px;
  color: #2E3F4E;
  position: relative;
  font-family: 'Noto Serif SC', serif;
}

.section-title::after {
  content: "♥";
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  color: #C2704A;
  opacity: 0.6;
  font-family: 'Noto Serif SC', serif;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.disaster-card {
  background: #FFFFFF;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 15px 30px -15px rgba(45, 62, 80, 0.15);
  transition: all 0.4s ease;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.02);
}

.disaster-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 40px -15px rgba(45, 62, 80, 0.25);
}

.card-badge {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(198, 112, 74, 0.9);
  backdrop-filter: blur(4px);
  color: white;
  padding: 6px 18px;
  border-radius: 40px;
  font-size: 13px;
  font-weight: 400;
  z-index: 2;
  letter-spacing: 0.5px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-image-container {
  height: 220px;
  overflow: hidden;
  position: relative;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s;
  filter: brightness(0.95);
}

.disaster-card:hover .card-image {
  transform: scale(1.05);
  filter: brightness(1);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to top, rgba(0,0,0,0.2), transparent);
}

.card-content {
  padding: 25px 25px 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  font-size: 24px;
  font-weight: 500;
  color: #2E3F4E;
  line-height: 1.3;
  font-family: 'Noto Serif SC', serif;
}

.severity-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.7;
}

.card-location {
  display: flex;
  align-items: center;
  color: #6F7E8C;
  font-size: 15px;
  margin-bottom: 18px;
  font-weight: 300;
}

.location-icon {
  margin-right: 6px;
  opacity: 0.6;
  font-size: 14px;
}

.card-description {
  color: #6F7E8C;
  margin-bottom: 25px;
  line-height: 1.7;
  font-weight: 300;
  font-size: 15px;
}

.card-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
  padding: 20px 0;
  border-top: 1px dashed #E2E0DA;
  border-bottom: 1px dashed #E2E0DA;
}

.card-stat {
  text-align: center;
  flex: 1;
}

.card-stat-value {
  font-size: 22px;
  font-weight: 500;
  color: #2B5F8A;
  display: block;
  margin-bottom: 4px;
  font-family: 'Noto Serif SC', serif;
}

.card-stat-label {
  font-size: 12px;
  color: #6F7E8C;
  font-weight: 300;
  letter-spacing: 0.5px;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 14px 20px;
  border-radius: 40px;
  border: none;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  letter-spacing: 0.5px;
}

.btn-detail {
  background: #FDF8F2;
  color: #2B5F8A;
  border: 1px solid #E2E0DA;
}

.btn-detail:hover {
  background: #F5EDE5;
  transform: translateY(-2px);
  border-color: #5C8DB9;
}

.btn-donate {
  background: linear-gradient(145deg, #C2704A, #D9926C);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(194, 112, 74, 0.3);
}

.btn-donate:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(194, 112, 74, 0.4);
}

/* ===== 详情页 ===== */
.detail-container {
  background: #FFFFFF;
  border-radius: 40px;
  padding: 45px;
  margin: 40px 0;
  box-shadow: 0 15px 30px -15px rgba(45, 62, 80, 0.15);
  position: relative;
}

.detail-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(145deg, #2B5F8A, #3C78A6);
  border-radius: 40px 40px 0 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.detail-title-container {
  flex: 1;
}

.detail-title {
  font-size: 36px;
  font-weight: 500;
  color: #2E3F4E;
  margin-bottom: 10px;
  font-family: 'Noto Serif SC', serif;
}

.detail-subtitle {
  color: #6F7E8C;
  font-size: 16px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #2B5F8A;
  text-decoration: none;
  font-weight: 400;
  padding: 10px 20px;
  background: #FDF8F2;
  border-radius: 30px;
  border: 1px solid #E2E0DA;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #F5EDE5;
  transform: translateY(-2px);
}

.detail-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 24px;
  margin-bottom: 30px;
  filter: sepia(0.1) brightness(0.98);
}

.detail-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.detail-stat-item {
  background: #FDF8F2;
  border-radius: 24px;
  border: 1px solid #E2E0DA;
  padding: 25px;
  text-align: center;
}

.detail-stat-value {
  color: #2B5F8A;
  font-weight: 500;
  font-size: 28px;
  display: block;
  margin-bottom: 8px;
  font-family: 'Noto Serif SC', serif;
}

.detail-stat-label {
  color: #6F7E8C;
  font-size: 14px;
  font-weight: 300;
}

.section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.section-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(145deg, #E6B89C, #FAD5C0);
  color: #2E3F4E;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  opacity: 0.8;
}

.section-content {
  padding-left: 65px;
  color: #6F7E8C;
  line-height: 1.8;
  font-weight: 300;
}

.news-item {
  background: #FDF8F2;
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 20px;
  border: 1px solid #E2E0DA;
}

.news-title {
  font-size: 18px;
  font-weight: 500;
  color: #2E3F4E;
  margin-bottom: 10px;
}

.news-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 13px;
  color: #6F7E8C;
}

.news-content {
  color: #6F7E8C;
  line-height: 1.7;
  font-weight: 300;
}

.needs-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.need-tag {
  background: rgba(194, 112, 74, 0.08);
  color: #C2704A;
  border: 1px solid rgba(194, 112, 74, 0.2);
  font-weight: 400;
  padding: 8px 18px;
  border-radius: 30px;
  font-size: 14px;
}

/* ===== 捐赠页 ===== */
.donate-container {
  background: #FFFFFF;
  border-radius: 40px;
  padding: 45px;
  margin: 40px 0;
  box-shadow: 0 15px 30px -15px rgba(45, 62, 80, 0.15);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.donate-header {
  text-align: center;
  margin-bottom: 40px;
}

.donate-title {
  font-size: 32px;
  font-weight: 500;
  color: #2E3F4E;
  margin-bottom: 15px;
  font-family: 'Noto Serif SC', serif;
}

.donate-subtitle {
  color: #6F7E8C;
  font-size: 16px;
  font-weight: 300;
  line-height: 1.6;
}

.donate-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.donate-option {
  background: #FDF8F2;
  border: 2px solid #E2E0DA;
  border-radius: 20px;
  padding: 25px 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.donate-option:hover {
  border-color: #C2704A;
  transform: translateY(-3px);
}

.donate-option.selected {
  background: linear-gradient(145deg, #C2704A, #D9926C);
  border-color: #C2704A;
  color: white;
}

.donate-amount {
  font-size: 28px;
  font-weight: 500;
  margin-bottom: 8px;
  font-family: 'Noto Serif SC', serif;
}

.donate-description {
  font-size: 13px;
  opacity: 0.8;
  font-weight: 300;
}

.custom-amount {
  margin-bottom: 30px;
}

.custom-amount-label {
  display: block;
  color: #6F7E8C;
  font-size: 14px;
  margin-bottom: 10px;
  font-weight: 300;
}

.custom-amount-input {
  width: 100%;
  padding: 18px 25px;
  border: 2px solid #E2E0DA;
  border-radius: 15px;
  font-size: 18px;
  outline: none;
  transition: all 0.3s;
  background: #FDF8F2;
}

.custom-amount-input:focus {
  border-color: #C2704A;
  background: white;
  box-shadow: 0 0 0 4px rgba(194, 112, 74, 0.1);
}

.donate-btn {
  width: 100%;
  padding: 20px;
  background: linear-gradient(145deg, #C2704A, #D9926C);
  color: white;
  border: none;
  border-radius: 15px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(194, 112, 74, 0.3);
}

.donate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(194, 112, 74, 0.4);
}

/* ===== 援助顾问 ===== */
.help-bubble {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: auto;
  height: auto;
  background: white;
  border-radius: 60px;
  padding: 12px 24px 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s;
  z-index: 1000;
  border: 1px solid rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
}

.help-bubble:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  background: white;
}

.help-bubble-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(145deg, #E6B89C, #FAD5C0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2E3F4E;
  font-size: 22px;
  box-shadow: 0 4px 10px rgba(194, 112, 74, 0.3);
}

.help-bubble-text {
  text-align: left;
}

.help-bubble-title {
  font-weight: 500;
  color: #2E3F4E;
  font-size: 16px;
  margin-bottom: 2px;
}

.help-bubble-desc {
  font-size: 13px;
  color: #6F7E8C;
  font-weight: 300;
}

.advisor-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(3px);
  z-index: 1999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.advisor-window {
  width: 95%;
  max-width: 500px;
  height: 70vh;
  max-height: 600px;
  background: #FDF9F5;
  border-radius: 40px;
  box-shadow: 0 30px 60px rgba(45, 62, 80, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: fadeIn 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.advisor-header {
  background: white;
  padding: 20px 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid #E2E0DA;
}

.advisor-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(145deg, #E6B89C, #FAD5C0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2E3F4E;
  font-size: 24px;
}

.advisor-info {
  flex: 1;
}

.advisor-name {
  font-weight: 500;
  color: #2E3F4E;
  font-size: 18px;
  margin-bottom: 4px;
}

.advisor-title {
  font-size: 13px;
  color: #6F7E8C;
  font-weight: 300;
}

.advisor-close {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #FDF8F2;
  border: none;
  color: #6F7E8C;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.advisor-close:hover {
  background: #E2E0DA;
  color: #2E3F4E;
}

.advisor-messages {
  flex: 1;
  padding: 25px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #FAF7F2;
}

.message {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  max-width: 85%;
}

.message.advisor-message {
  align-self: flex-start;
}

.message.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(145deg, #E6B89C, #FAD5C0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2E3F4E;
  font-size: 16px;
  flex-shrink: 0;
  opacity: 0.9;
}

.user-message .msg-avatar {
  background: linear-gradient(145deg, #2B5F8A, #3C78A6);
  color: white;
  opacity: 0.8;
}

.msg-bubble {
  background: white;
  padding: 14px 18px;
  border-radius: 24px 24px 24px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  color: #2E3F4E;
  font-size: 15px;
  line-height: 1.6;
  font-weight: 300;
}

.user-message .msg-bubble {
  background: linear-gradient(145deg, #2B5F8A, #3C78A6);
  color: white;
  border-radius: 24px 24px 8px 24px;
}

.advisor-footer {
  padding: 20px 25px;
  background: white;
  display: flex;
  gap: 12px;
  align-items: center;
  border-top: 1px solid #E2E0DA;
}

.advisor-footer input {
  flex: 1;
  padding: 16px 22px;
  border: 1px solid #E2E0DA;
  border-radius: 50px;
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
  background: #FDF8F2;
  font-weight: 300;
}

.advisor-footer input:focus {
  border-color: #C2704A;
  background: white;
  box-shadow: 0 0 0 4px rgba(194, 112, 74, 0.1);
}

.advisor-footer input::placeholder {
  color: #E2E0DA;
  font-weight: 300;
}

.advisor-footer button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(145deg, #C2704A, #D9926C);
  border: none;
  color: white;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(194, 112, 74, 0.3);
}

.advisor-footer button:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 18px rgba(194, 112, 74, 0.4);
}

/* ===== 页脚 ===== */
footer {
  background: #2B3E4D;
  color: #EDE9E4;
  padding: 60px 0 30px;
  margin-top: 60px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-title {
  color: #D6CFC7;
  font-weight: 500;
  font-size: 18px;
  margin-bottom: 20px;
  letter-spacing: 1px;
}

.footer-text, .footer-links li {
  color: #B8B1A8;
  font-weight: 300;
  line-height: 1.8;
}

.footer-links {
  list-style: none;
}

.footer-links a {
  color: #B8B1A8;
  transition: color 0.3s;
  text-decoration: none;
}

.footer-links a:hover {
  color: white;
}

.footer-bottom {
  border-top: 1px solid #4A5B68;
  padding-top: 30px;
  text-align: center;
  color: #9A958F;
  font-size: 14px;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .hero-title { font-size: 28px; }
  .logo-text { font-size: 32px; }
  .stat-item { min-width: 140px; padding: 18px 20px; }
  .help-bubble { padding: 10px 18px 10px 15px; }
  .help-bubble-avatar { width: 40px; height: 40px; font-size: 18px; }
  .advisor-window { width: 100%; height: 100%; max-height: none; border-radius: 0; }
  .detail-stats-grid { grid-template-columns: repeat(2, 1fr); }
  .section-content { padding-left: 0; }
}
</style>
