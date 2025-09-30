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
      label: '优秀运动员',
      icon: 'pi pi-star',
      command: () => router.push('/excellence')
    },
    {
      label: '登录',
      icon: 'pi pi-user',
      command: () => router.push('/login')
    }
  ]);
  return {
    menuItems
  }
}
