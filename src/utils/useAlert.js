import { useConfirm } from 'primevue/useconfirm';

export function useAlert() {
  const confirm = useConfirm();

  const alerts = (title, msg, options = {}) => {
    const {
      accept = '确定',
      reject = 'hidden',
      icon = 'pi pi-info-circle'
    } = options;

    console.log('Alert:', title, msg);
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

  const asyncAlert = (title, msg, options = {}) => {
    const {
      accept = '确定',
      reject = 'hidden',
      icon = 'pi pi-info-circle'
    } = options;

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

  const awaitAlert = async (title, msg, options = {}) => {
    try {
      await asyncAlert(title, msg, options);
      return true; // 用户点击了接受按钮
    } catch {
      return false; // 用户点击了拒绝按钮
    }
  }

  return { alerts, asyncAlert, awaitAlert };
}