import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { usePWA } from '../context/PWAContext';

const DISMISS_KEY = 'sv_pwa_install_dismissed';

export default function PWAInstallPrompt() {
  const { canInstall, isInstalled, promptInstall } = usePWA();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!canInstall || isInstalled) return;
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) return;

    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, [canInstall, isInstalled]);

  const handleInstall = async () => {
    const ok = await promptInstall();
    if (ok) setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && canInstall && !isInstalled && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[60]"
        >
          <div className="glass-strong rounded-2xl p-4 shadow-card border border-gold/20">
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 text-zinc-500"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
            <p className="font-display text-lg pr-8">Install Sneaker Vault</p>
            <p className="text-xs text-zinc-500 mt-1 mb-4">
              Add to your home screen for fast access and offline browsing.
            </p>
            <button type="button" onClick={handleInstall} className="btn-gold w-full text-sm py-2.5 flex items-center justify-center gap-2">
              <Download size={16} /> Install App
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
