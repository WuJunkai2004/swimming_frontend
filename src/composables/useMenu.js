import { ref } from 'vue';
import { useRouter } from 'vue-router';

export function useMenu() {
  const router = useRouter();

  const menuItems = ref([
    {
      label: '主页',
      icon: 'pi pi-home',
      command: () => router.push('/')
    },
    {
      label: '关于',
      icon: 'pi pi-info-circle',
      command: () => router.push('/introduction')
    },
    {
      label: '资讯',
      icon: 'pi pi-globe',
      command: () => router.push('/activity')
    },
    {
      label: '登录',
      icon: 'pi pi-sign-in',
      command: () => router.push('/login')
    }
  ]);
  return {
    menuItems
  }
}