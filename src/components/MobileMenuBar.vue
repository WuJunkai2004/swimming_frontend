<script setup>
import { useMenu } from '@/composables/useMenu';
const { menuItems } = useMenu();
</script>

<template>
  <Menubar :model="menuItems" class="md:hidden border-noround" />
</template>

<style scoped></style>