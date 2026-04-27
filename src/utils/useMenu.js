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
      label: '联系我们',
      icon: 'pi pi-info-circle',
      command: () => router.push('/#introduction')
    },
    {
      label: '资讯',
      icon: 'pi pi-globe',
      command: () => router.push('/activity')
    },
    {
      label: '比赛',
      icon: 'pi pi-trophy',
      command: () => router.push('/competition')
    },
    {
      label: '教练团队',
      icon: 'pi pi-users',
      command: () => router.push('/leaders')
    },
    {
      label: '校友墙',
      icon: 'pi pi-star',
      command: () => router.push('/alumnus')
    },
    {
      label: '等级查询',
      icon: 'pi pi-search',
      command: () => router.push('/swimlevel')
    },
  ]);
  return {
    menuItems
  }
}
