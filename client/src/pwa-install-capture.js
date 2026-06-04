/** Capture beforeinstallprompt before React mounts (browser fires it early). */
if (typeof window !== 'undefined') {
  window.__deferredPWAInstall = null;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    window.__deferredPWAInstall = e;
    window.dispatchEvent(new Event('pwa-install-available'));
  });

  window.addEventListener('appinstalled', () => {
    window.__deferredPWAInstall = null;
    window.dispatchEvent(new Event('pwa-installed'));
  });
}
