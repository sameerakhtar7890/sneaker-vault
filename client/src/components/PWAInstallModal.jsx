import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { usePWA } from '../context/PWAContext';

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export default function PWAInstallModal({ open, onClose }) {
  const { installPrompt, isInstalled, promptInstall } = usePWA();
  const canNativeInstall = Boolean(installPrompt);

  const handleInstall = async () => {
    if (canNativeInstall) {
      const ok = await promptInstall();
      if (ok) onClose();
      return;
    }
    onClose();
  };

  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-md" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            onClick={e => e.stopPropagation()}
            className="relative glass-strong rounded-2xl p-6 w-full max-w-md shadow-card border border-gold/20"
          >
            <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-zinc-500">
              <X size={18} />
            </button>

            <p className="font-display text-xl pr-10">Install Sneaker Vault</p>
            <p className="text-sm text-zinc-500 mt-2 mb-5">
              Home screen par add karo — fast open + offline browsing.
            </p>

            {canNativeInstall ? (
              <button type="button" onClick={handleInstall} className="btn-gold w-full flex items-center justify-center gap-2">
                <Download size={18} /> Install now
              </button>
            ) : isIOS() ? (
              <div className="space-y-3 text-sm text-zinc-400">
                <p className="flex items-start gap-2"><Smartphone size={16} className="text-gold shrink-0 mt-0.5" /> Safari kholo (Chrome iOS par install limited hai)</p>
                <ol className="list-decimal list-inside space-y-2 pl-1">
                  <li>Neeche <strong className="text-zinc-300">Share</strong> button dabao</li>
                  <li><strong className="text-zinc-300">Add to Home Screen</strong> choose karo</li>
                  <li><strong className="text-zinc-300">Add</strong> confirm karo</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-zinc-400">
                <p className="flex items-start gap-2"><Monitor size={16} className="text-gold shrink-0 mt-0.5" /> Chrome ya Edge use karo (localhost ya HTTPS par)</p>
                <ol className="list-decimal list-inside space-y-2 pl-1">
                  <li>Address bar ke right side <strong className="text-zinc-300">install icon</strong> (⊕) dekho</li>
                  <li>Ya menu (⋮) → <strong className="text-zinc-300">Install Sneaker Vault</strong></li>
                  <li>Install prompt nahi aata? <code className="text-gold text-xs">npm run build</code> + <code className="text-gold text-xs">npm run preview</code> try karo</li>
                </ol>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
