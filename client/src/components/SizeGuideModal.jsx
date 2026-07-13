import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler, Loader2 } from 'lucide-react';
import api from '../utils/api';

export default function SizeGuideModal({ open, onClose, brand, selectedSize }) {
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError('');
    setGuide(null);

    const path = brand
      ? `/size-guides/for-brand/${encodeURIComponent(brand)}`
      : '/size-guides/for-brand/default';

    api.get(path)
      .then(r => setGuide(r.data))
      .catch(err => setError(err?.response?.data?.message || 'Could not load size guide'))
      .finally(() => setLoading(false));
  }, [open, brand]);

  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const isHighlighted = (us) => {
    if (selectedSize == null) return false;
    return String(us) === String(selectedSize);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            className="relative glass rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden z-10 flex flex-col"
          >
            <div className="flex items-start justify-between p-6 border-b border-white/10 shrink-0">
              <div>
                <div className="flex items-center gap-2 text-gold mb-1">
                  <Ruler size={16} />
                  <span className="text-xs tracking-[0.2em] uppercase">Size Guide</span>
                </div>
                <h2 className="font-display text-xl">
                  {guide?.name || (brand ? `${brand} Sizing` : 'Size Chart')}
                </h2>
                {guide?.brand && (
                  <p className="text-xs text-zinc-500 mt-1">Brand-specific chart for {guide.brand}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 flex-1">
              {loading && (
                <div className="flex items-center justify-center gap-2 py-12 text-zinc-400 text-sm">
                  <Loader2 size={18} className="animate-spin" /> Loading size chart…
                </div>
              )}

              {error && (
                <p className="text-red-400 text-sm text-center py-8">{error}</p>
              )}

              {guide && !loading && (
                <>
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white/5 text-zinc-400 text-left">
                          <th className="px-4 py-3 font-medium">US</th>
                          <th className="px-4 py-3 font-medium">UK</th>
                          <th className="px-4 py-3 font-medium">EU</th>
                          <th className="px-4 py-3 font-medium">CM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {guide.rows.map((row, idx) => {
                          const active = isHighlighted(row.us);
                          return (
                            <tr
                              key={idx}
                              className={`border-t border-white/5 transition ${
                                active ? 'bg-gold/15 text-gold' : 'text-zinc-300 hover:bg-white/[0.02]'
                              }`}
                            >
                              <td className="px-4 py-2.5 font-medium">
                                {row.us}
                                {active && (
                                  <span className="ml-2 text-[10px] uppercase tracking-wider text-gold/80">
                                    selected
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2.5">{row.uk || '—'}</td>
                              <td className="px-4 py-2.5">{row.eu || '—'}</td>
                              <td className="px-4 py-2.5">{row.cm || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {guide.fitTips && (
                    <div className="mt-5 p-4 rounded-xl bg-gold/5 border border-gold/20">
                      <p className="text-xs text-gold uppercase tracking-wider mb-1.5">Fit Tips</p>
                      <p className="text-sm text-zinc-400 leading-relaxed">{guide.fitTips}</p>
                    </div>
                  )}

                  <p className="text-[11px] text-zinc-600 mt-4 text-center">
                    Measurements are approximate. If between sizes, we recommend sizing up.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
