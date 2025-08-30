<script setup>
import { useMenu } from '@/composables/useMenu';
const { menuItems } = useMenu();
</script>

<template>
  <Menubar :model="menuItems" class="hidden md:block">
    <template #start>
      <div class="flex align-items-center mr-5">
        <img alt="logo" src="/favicon.ico" height="40" class="mr-2" />
        <span class="font-bold text-xl">Swimming</span>
      </div>
    </template>
    <template #end>
      <Button icon="pi pi-user" severity="secondary" text rounded aria-label="User Profile" />
    </template>
  </Menubar>
</template>

<style scoped>
:deep(.p-menubar) {
  border-radius: 0;
  border-left: 0;
  border-right: 0;
}
</style>