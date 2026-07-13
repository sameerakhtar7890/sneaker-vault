import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToast } from '../context/ToastContext';

export default function PWAUpdateNotifier() {
  const { addToast } = useToast();

  const {
    needRefresh: [needRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegistered() {
      /* SW registered */
    },
    onOfflineReady() {
      addToast('App ready for offline use', 'success');
    },
    onRegisterError(err) {
      console.error('SW registration error', err);
    }
  });

  useEffect(() => {
    if (!needRefresh) return;
    addToast('Update available — tap to refresh', 'success');
    const t = setTimeout(() => {
      updateServiceWorker(true);
    }, 2500);
    return () => clearTimeout(t);
  }, [needRefresh, updateServiceWorker, addToast]);

  return null;
}
