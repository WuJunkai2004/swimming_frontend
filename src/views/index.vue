<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute(); // 获取当前路由信息
let firstView = true;

const handleScrollToAnchor = () => {
  let hash = route.hash;
  if(!hash){
    hash = '#first';
  }
  if(firstView && hash === '#first'){
    firstView = false;
    return;
  }
  const id = hash.replace('#', '');
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};
onMounted(() => {
  nextTick(() => {
    handleScrollToAnchor();
  });
});
watch(
  () => route.hash,
  () => {
    nextTick(() => {
      handleScrollToAnchor();
    });
  }
);

// 需求：从文章中提取历史奖项，并格式化为 PrimeVue Timeline 组件所需的数据结构
const awards = ref([
  {
    date: '2022年11月',
    title: '福建省第十七届运动会“体育道德风尚奖”',
    icon: 'pi pi-trophy',
    color: '#FFD700' // 金色
  },
  {
    date: '2022年11月',
    title: '福建省第十七届运动会男子4×50米自由泳接力第六名',
    icon: 'pi pi-thumbs-up',
    color: '#28a745' // 绿色
  },
  {
    date: '2023年3月',
    title: '第四届中国大学生阳光体育锦标赛“体育道德风尚奖”',
    icon: 'pi pi-trophy',
    color: '#FFD700'
  },
  {
    date: '2023年3月',
    title: '第四届中国大学生阳光体育锦标赛男子甲组4×100自由泳接力第24名',
    icon: 'pi pi-verified',
    color: '#28a745'
  },
  {
    date: '2024年6月',
    title: '福建省大学生游泳锦标赛团体第三名',
    icon: 'pi pi-sitemap',
    color: '#CD7F32' // 铜色
  },
]);

const activities = ref([
  {
    icon: 'pi pi-trophy',
    title: '“振奋杯”学生游泳比赛',
    content: '每年10月份左右举办的“振奋杯”学生比赛，为本校的在校学生提供了展现自我游泳技能、体验体育竞赛氛围的平台。此外，泳协还将根据同学们的比赛成绩，从新生中选拔泳队成员参加校游泳队，为队伍注入新鲜活力。'
  },
  {
    icon: 'pi pi-sitemap',
    title: '省级、国家级比赛',
    content: '截至目前，校游泳队共参加了三次省运会，多次全国大学生游泳锦标赛，取得了优异的成绩，是福建省各类游泳赛事领奖台的常驻嘉宾。'
  },
  {
    icon: 'pi pi-calendar-plus',
    title: '系统性日常训练',
    content: '自2022年成立以来，校游泳队保持着一周六训的备战传统。队员们在专职教师的指导下，由高水平校友带领进行系统性训练，其内容涵盖技术分解、包干冲刺、划频调控、有氧耐力等核心环节，同时兼顾出发转身等技术细节，力求全面提升运动表现。'
  }
]);
</script>

<template>
  <div style="overflow-x: hidden;">
    <MobileMenuBar />
    <ComputerMenuBar />
    <!--
      需求 3: 实现上下翻页效果的核心容器。
      我们使用 CSS Scroll Snapping 技术。
    -->
    <div class="scroll-container">
      <!--简单介绍-->
      <section class="scroll-section hero-section" id="first">
        <div class="hero-overlay"></div>
        <div class="hero-content text-center">
          <h1 class="text-6xl font-light mb-4">学生游泳协会</h1>
          <p class="text-2xl font-light motto">「安全第一、快乐游泳、共同进步」</p>
          <p class="mt-4 max-w-30rem line-height-3">
            {{"　　"}}学生游泳协会成立于2022年，是由校团委指导、校学生会监督的校级体育类社团。自成立以来，我们始终秉持“安全第一、快乐游泳、共同进步”的宗旨，致力于推广游泳运动、普及游泳知识、搭建交流平台。
            <br>
            {{"　　"}}从最初的几十人小团体，到如今拥有注册会员五百余人、年均组织活动十余场的“五星社团”，无论您是零基础的“旱鸭子”，还是追求速度的“游泳达人”，在这里都能找到属于自己的“泳”者天地！
          </p>
        </div>
        <div class="scroll-indicator">
          <i class="pi pi-angle-down"></i>
        </div>
      </section>

      <!-- 第二部分：主要活动 -->
      <section class="scroll-section activities-section">
        <div class="grid align-items-center h-full">
          <div class="col-12 p-4 md:p-6 lg:p-8">
            <h2 class="text-5xl font-light text-center mb-6">我们的足迹</h2>
            <!-- Mobile Carousel -->
            <Carousel :value="activities" :numVisible="1" :numScroll="1" :showNavigators="false" class="activities-carousel">
                <template #item="slotProps">
                    <div class="p-3">
                        <Card class="h-full feature-card">
                            <template #header><i :class="slotProps.data.icon" class="card-icon"></i></template>
                            <template #title>{{ slotProps.data.title }}</template>
                            <template #content>
                                <p>{{ slotProps.data.content }}</p>
                            </template>
                        </Card>
                    </div>
                </template>
            </Carousel>
            <!-- Desktop Grid -->
            <div class="grid activities-grid">
              <div v-for="activity in activities" :key="activity.title" class="col-12 md:col-4 p-3">
                <Card class="h-full feature-card">
                  <template #header><i :class="activity.icon" class="card-icon"></i></template>
                  <template #title>{{ activity.title }}</template>
                  <template #content>
                    <p>{{ activity.content }}</p>
                  </template>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 第三部分：荣誉殿堂 (历史奖项) -->
      <section class="scroll-section awards-section">
        <div class="grid align-items-center h-full">
          <div class="col-12 p-4 md:p-6 lg:p-8">
            <h2 class="text-5xl font-light text-center mb-6">荣誉殿堂</h2>
            <!-- 使用 PrimeVue 的 Timeline 组件来展示奖项 -->
            <Timeline :value="awards" align="alternate" class="customized-timeline">
              <template #marker="slotProps">
                <span class="custom-marker" :style="{ backgroundColor: slotProps.item.color }">
                  <i :class="slotProps.item.icon"></i>
                </span>
              </template>
              <template #content="slotProps">
                <div class="p-text-secondary">{{ slotProps.item.date }}</div>
                <div>{{ slotProps.item.title }}</div>
              </template>
            </Timeline>
          </div>
        </div>
      </section>

      <!-- 第四部分：关注我们 -->
      <section class="scroll-section contact-section" id="introduction">
        <div class="grid align-items-center h-full w-full justify-content-center">
          <div class="col-12 md:col-8 flex flex-column md:flex-row align-items-center justify-content-center gap-5">

            <div class="text-content text-center md:text-right order-2 md:order-1">
              <h2 class="text-3xl md:text-5xl font-light mb-2">欢迎关注公众号</h2>
              <p class="text-sm md:text-xl text-color-secondary">获取最新赛事资讯与活动动态</p>
            </div>

            <div class="qr-code-container order-1 md:order-2">
              <img src="/QRcode.webp" alt="公众号二维码" class="qr-code-img shadow-4" />
            </div>

          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
/* 滚动吸附容器 */
.scroll-container {
  /* 高度减去菜单栏的大致高度，确保滚动区域不被遮挡 */
  height: calc(100vh - 80px);
  overflow-y: scroll;
  scroll-snap-type: y mandatory; /* 核心：在Y轴上强制吸附 */
}

/* 每个吸附部分 */
.scroll-section {
  height: calc(100vh - 80px);
  scroll-snap-align: start; /* 核心：将此元素的顶部作为吸附点 */
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
}

/* 第一部分：Hero Section */
.hero-section {
  background: url('https://images.unsplash.com/photo-1575415124111-a89a5e8f6916?q=80&w=1974&auto=format&fit=crop') no-repeat center center;
  background-size: cover;
  color: white;
}
.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 30, 60, 0.6); /* 深蓝色半透明遮罩 */
}
.hero-content {
  position: relative;
  z-index: 1;
}
.motto {
  opacity: 0.8;
  letter-spacing: 2px;
}

/* 向下滚动提示箭头 */
.scroll-indicator {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  animation: bounce 2s infinite;
}
.scroll-indicator i {
  font-size: 2.5rem;
  color: rgba(255, 255, 255, 0.7);
}
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}


/* 第二部分：Activities Section */
.activities-grid {
    display: none; /* Hidden by default */
}
.feature-card {
  text-align: center;
  border: 1px solid var(--p-card-shadow);
  transition: all 0.3s ease;
}
.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
}
.card-icon {
  font-size: 3rem;
  color: var(--p-primary-color);
  margin-top: 1rem;
}

/* 第三部分：Awards Section */
.awards-section {
  background-color: var(--p-surface-100);
}
.custom-marker {
  display: flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  border-radius: 50%;
  z-index: 1;
}
:deep(.p-timeline-event-opposite) {
  flex-grow: 0;
  padding: 0 !important;
}

/* 第四部分：Contact Section */
.contact-section {
  background-color: var(--p-surface-0);
}
.qr-code-img {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  /* 如果二维码是白底，加个边框会让它在浅色背景上更清晰 */
  border: 1px solid var(--p-card-color);
}

/* 响应式调整 */
@media (min-width: 768px) {
  .activities-carousel {
    display: none;
  }
  .activities-grid {
    display: flex;
  }
}

@media (max-width: 767px) {
  .hero-section h1 {
    font-size: 2.5rem;
  }
  .hero-section .motto {
    font-size: 1.2rem;
  }
  .activities-section h2, .awards-section h2 {
    font-size: 2.5rem;
  }

  /* 在移动端，让Timeline内容都在右侧，更易读 */
  :deep(.p-timeline-event:nth-child(even)) {
    flex-direction: row !important;
  }
  :deep(.p-timeline-event-content) {
    text-align: left !important;
  }
  /* 并适当缩小二维码 */
  .qr-code-img {
    width: 150px;
    height: 150px;
  }
}
</style>