<script setup>
</script>

<template>
  <div class="footer-bar">
    <p>© 2025-2026 本站
      未经许可，禁止转载本站图片与文章。</p>
    <p>
      <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          style="text-decoration: none; color: inherit;">
        闽ICP备2026003845号-1
      </a>
    </p>
  </div>
</template>

<style scoped>
.footer-bar {
  width: 90svw;
  margin: 0 auto;
  text-align: center;
  padding: 0.75rem 1rem;
  color: var(--p-text-color-secondary);
  font-size: 0.75rem;
  background-color: var(--p-surface-ground);
}

@media (min-width: 768px) {
  .footer-bar {
    padding: 1rem;
    font-size: 0.85rem;
  }
}
</style>
