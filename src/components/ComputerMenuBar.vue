<script setup>
import { useMenu } from '@/composables/useMenu';
const { menuItems } = useMenu();
</script>

<template>
  <Menubar :model="menuItems" class="hidden md:block">
    <template #start>
      <div class="flex align-items-center mr-5">
        <img alt="logo" src="/logo.webp" height="100" class="mr-2 logo-round"/>
        <div>
          <span class="font-bold text-xl block text-center">学生游泳协会</span>
          <span class="text-sm text-color-secondary block text-center">Fuzhou University Student Swimming Club</span>
        </div>
      </div>
    </template>
  </Menubar>
</template>

<style scoped>
:deep(.p-menubar) {
  border-radius: 0;
  border-left: 0;
  border-right: 0;
  border-bottom: 2px solid var(--p-primary-color);
}

.logo-round {
  border-radius: 80%;
  object-fit: cover;
}
</style>