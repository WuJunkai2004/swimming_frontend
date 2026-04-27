<script setup>
import { useMenu } from '#/useMenu';
const { menuItems } = useMenu();
</script>

<template>
  <Menubar :model="menuItems" class="md:hidden border-noround" />
</template>

<style scoped></style>