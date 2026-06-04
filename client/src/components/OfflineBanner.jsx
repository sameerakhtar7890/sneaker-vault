import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { usePWA } from '../context/PWAContext';

export default function OfflineBanner() {
  const { isOnline } = usePWA();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-amber-500/15 border-b border-amber-500/25 text-amber-200/90 overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm">
            <WifiOff size={14} className="shrink-0" />
            <span>
              Offline mode — browsing saved catalog. Cart & wishlist work locally; checkout needs internet.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
