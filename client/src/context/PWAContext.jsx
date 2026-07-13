import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { syncOfflineCatalog } from '../utils/offlineCatalog';
import { useToast } from './ToastContext';

const PWACtx = createContext(null);
export const usePWA = () => useContext(PWACtx);

function checkInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

export function PWAProvider({ children }) {
  const { addToast } = useToast();
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [catalogSynced, setCatalogSynced] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(() => window.__deferredPWAInstall || null);
  const [isInstalled, setIsInstalled] = useState(checkInstalled);
  const [canInstall, setCanInstall] = useState(Boolean(window.__deferredPWAInstall));

  const syncCatalog = useCallback(async () => {
    if (!navigator.onLine) return null;
    const data = await syncOfflineCatalog();
    if (data?.products?.length) setCatalogSynced(true);
    return data;
  }, []);

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      addToast('Back online', 'success');
      syncCatalog();
    };
    const onOffline = () => {
      setIsOnline(false);
      addToast('You are offline — browsing cached catalog', 'error');
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [syncCatalog, addToast]);

  useEffect(() => {
    syncCatalog();
  }, [syncCatalog]);

  useEffect(() => {
    const capture = e => {
      e.preventDefault();
      window.__deferredPWAInstall = e;
      setInstallPrompt(e);
      setCanInstall(true);
    };

    const onAvailable = () => {
      if (window.__deferredPWAInstall) {
        setInstallPrompt(window.__deferredPWAInstall);
        setCanInstall(true);
      }
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setCanInstall(false);
      window.__deferredPWAInstall = null;
      addToast('Sneaker Vault installed!', 'success');
    };

    window.addEventListener('beforeinstallprompt', capture);
    window.addEventListener('pwa-install-available', onAvailable);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('pwa-installed', onInstalled);

    if (window.__deferredPWAInstall) {
      setInstallPrompt(window.__deferredPWAInstall);
      setCanInstall(true);
    }
    setIsInstalled(checkInstalled());

    return () => {
      window.removeEventListener('beforeinstallprompt', capture);
      window.removeEventListener('pwa-install-available', onAvailable);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('pwa-installed', onInstalled);
    };
  }, [addToast]);

  const promptInstall = useCallback(async () => {
    const prompt = installPrompt || window.__deferredPWAInstall;
    if (!prompt) return false;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setCanInstall(false);
      window.__deferredPWAInstall = null;
      return true;
    }
    return false;
  }, [installPrompt]);

  const dismissInstall = useCallback(() => {
    setInstallPrompt(null);
    setCanInstall(false);
  }, []);

  return (
    <PWACtx.Provider value={{
      isOnline,
      catalogSynced,
      installPrompt,
      isInstalled,
      canInstall,
      promptInstall,
      dismissInstall,
      syncCatalog
    }}>
      {children}
    </PWACtx.Provider>
  );
}
