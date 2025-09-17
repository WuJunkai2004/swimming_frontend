<script setup>
// 404页面无需复杂逻辑
</script>

<template>
    <MobileMenuBar />
    <ComputerMenuBar />
    <div class="notfound-bg flex align-items-center justify-content-center" style="min-height:100vh;">
        <Card class="notfound-card">
            <template #title>
                <span class="notfound-title">404</span>
            </template>
            <template #content>
                <div class="notfound-content">
                    <strong>页面未找到</strong>
                    <p>您访问的页面不存在或已被移除。</p>
                </div>
            </template>
        </Card>
    </div>
</template>

<style scoped>
.notfound-bg {
    background: linear-gradient(135deg, #f1f1f1 0%, #e3e3e3 100%);
}
.notfound-card {
    max-width: 400px;
    margin: 0 auto;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    border-radius: 16px;
}
.notfound-title {
    font-size: 4rem;
    font-weight: 700;
    color: #ff5252;
    letter-spacing: 2px;
    text-shadow: 0 2px 8px #fff;
}
.notfound-content {
    text-align: center;
    color: #666;
    font-size: 1.2rem;
}
</style>