import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }
  })
};

export default function CartDrawer() {
  const { open, setOpen, items, remove, setQty, total } = useCart();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-ink-900/95 backdrop-blur-2xl z-50
                       border-l border-white/10 flex flex-col shadow-2xl"
          >
            <div className="p-5 flex items-center justify-between border-b border-white/10">
              <h3 className="font-display text-xl">Your Vault</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-all duration-300 hover:rotate-90"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-zinc-500 text-sm text-center py-12"
                >
                  Your cart is empty.
                </motion.p>
              )}
              {items.map((i, idx) => (
                <motion.div
                  key={i.key}
                  custom={idx}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  layout
                  className="flex gap-3 glass rounded-xl p-3 hover:border-gold/20 transition-colors duration-300"
                >
                  <img src={i.images?.[0]} className="w-20 h-20 object-cover rounded-lg" alt={i.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{i.name}</p>
                    <p className="text-xs text-zinc-500">Size {i.size}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => setQty(i.key, i.qty - 1)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-gold/10 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm w-6 text-center">{i.qty}</span>
                      <button
                        onClick={() => setQty(i.key, i.qty + 1)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-gold/10 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => remove(i.key)}
                        className="ml-auto p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gold text-sm font-semibold">${(i.price * i.qty).toFixed(2)}</p>
                </motion.div>
              ))}
            </div>

            <div className="p-5 border-t border-white/10 bg-ink-950/50">
              <div className="flex justify-between mb-4">
                <span className="text-zinc-400">Subtotal</span>
                <span className="font-display text-2xl text-gold">${total.toFixed(2)}</span>
              </div>
              <Link to="/checkout" onClick={() => setOpen(false)} className="btn-gold w-full">
                Checkout
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
