<script setup>
import { ref } from 'vue';

const roles = [
  { label: '执行总裁', id: 'EXECUTIVE_PRESIDENT', path: '/executive_president' },
  { label: '发令员', id: 'STARTER', path: '/starter' },
  { label: '计时员', id: 'TIMER', path: '/timer' },
  { label: '游进技术检查', id: 'TECHNICAL_INSPECTION_OF_SWIMMING_IN', path: '/technical_inspection' },
  { label: '转身检查', id: 'REINTAKE_INSPECTION', path: '/reintake_inspection' },
  { label: '转身检查长', id: 'REBORN_INSPECTOR', path: '/reborn_inspector' },
];

const navigateTo = (path) => {
  window.location.hash = path;
};
</script>

<template>
  <div class="flex align-items-center justify-content-center h-full">
    <Card class="role-card w-full">
      <template #title>
        <h2 class="text-center text-3xl">请选择您的职务</h2>
      </template>
      <template #content>
        <div class="flex flex-column gap-3">
          <Button
            v-for="role in roles"
            :key="role.id"
            :label="role.label"
            class="p-button-outlined w-full role-button"
            @click="navigateTo(role.path)"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.role-card {
  max-width: 450px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.role-button {
  height: 3.5rem;
  font-size: 1.1rem;
}

/* 确保容器占满父元素高度以便居中 */
.h-full {
  height: 100%;
}
</style>
