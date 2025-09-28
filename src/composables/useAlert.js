import { useConfirm } from 'primevue/useconfirm';

export function useAlert() {
  const confirm = useConfirm();

  const alerts = (title, msg, accept = 'hidden', reject = 'hidden', icon = 'pi pi-info-circle') => {
    confirm.require({
      header: title,
      message: msg,
      icon: icon,
      acceptLabel: accept,
      rejectLabel: reject,
      acceptClass: accept === 'hidden' ? 'hidden' : 'p-button-primary',
      rejectClass: reject === 'hidden' ? 'hidden' : 'p-button-secondary',
    });
  };

  const asyncAlert = (title, msg, accept = 'hidden', reject = 'hidden', icon = 'pi pi-info-circle') => {
    return new Promise((resolve, rejectPromise) => {
      confirm.require({
        header: title,
        message: msg,
        icon: icon,
        acceptLabel: accept,
        rejectLabel: reject,
        acceptClass: accept === 'hidden' ? 'hidden' : 'p-button-primary',
        rejectClass: reject === 'hidden' ? 'hidden' : 'p-button-secondary',
        accept: () => resolve(true),
        reject: () => rejectPromise(false)
      });
    })
  }

  const awaitAlert = async (title, msg, accept = 'hidden', reject = 'hidden', icon = 'pi pi-info-circle') => {
    try {
      await asyncAlert(title, msg, accept, reject, icon);
      return true; // 用户点击了接受按钮
    } catch {
      return false; // 用户点击了拒绝按钮
    }
  }

  return { alerts, asyncAlert, awaitAlert };
}