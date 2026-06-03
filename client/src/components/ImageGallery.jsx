import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';

const FALLBACK = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80';

export default function ImageGallery({ images = [], name = '' }) {
  const imgs = images.length ? images : [FALLBACK];
  const [active, setActive]   = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = () => setActive(i => (i - 1 + imgs.length) % imgs.length);
  const next = () => setActive(i => (i + 1) % imgs.length);

  const handleKey = e => {
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape')     setLightbox(false);
  };

  return (
    <>
      {/* Main Image */}
      <div className="flex flex-col gap-3">
        <div className="relative glass rounded-3xl overflow-hidden aspect-square group">
          <AnimatePresence mode="wait">
            <motion.img
              key={active}
              src={imgs[active]}
              alt={`${name} - view ${active + 1}`}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK; }}
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => setLightbox(true)}
            />
          </AnimatePresence>

          {/* Arrow controls (only if > 1 image) */}
          {imgs.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 glass rounded-full p-2
                           opacity-0 group-hover:opacity-100 transition hover:bg-white/20"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 glass rounded-full p-2
                           opacity-0 group-hover:opacity-100 transition hover:bg-white/20"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Zoom hint */}
          <button
            onClick={() => setLightbox(true)}
            className="absolute bottom-3 right-3 glass rounded-full p-2
                       opacity-0 group-hover:opacity-100 transition hover:bg-white/20"
          >
            <ZoomIn size={16} />
          </button>

          {/* Image counter badge */}
          {imgs.length > 1 && (
            <span className="absolute top-3 left-3 glass text-xs px-2.5 py-1 rounded-full text-zinc-300">
              {active + 1} / {imgs.length}
            </span>
          )}
        </div>

        {/* Thumbnails */}
        {imgs.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {imgs.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition
                  ${i === active ? 'border-gold' : 'border-white/10 hover:border-white/30'}`}
              >
                <img
                  src={img}
                  alt={`${name} thumbnail ${i + 1}`}
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK; }}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
            onKeyDown={handleKey}
            tabIndex={0}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={imgs[active]}
                alt={name}
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK; }}
                className="w-full h-full object-contain max-h-[80vh] rounded-2xl"
              />

              {imgs.length > 1 && (
                <>
                  <button onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 glass rounded-full p-3 hover:bg-white/20">
                    <ChevronLeft size={22} />
                  </button>
                  <button onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 glass rounded-full p-3 hover:bg-white/20">
                    <ChevronRight size={22} />
                  </button>
                </>
              )}

              <button
                onClick={() => setLightbox(false)}
                className="absolute -top-4 -right-4 glass rounded-full p-2 hover:bg-white/20"
              >
                <X size={18} />
              </button>

              {/* Dot indicators */}
              {imgs.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-4">
                  {imgs.map((_, i) => (
                    <button key={i} onClick={() => setActive(i)}
                      className={`w-2 h-2 rounded-full transition ${i === active ? 'bg-gold' : 'bg-white/30'}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
