import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { open, setOpen, items, remove, setQty, total } = useCart();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)} />
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-ink-900 z-50
                       border-l border-white/10 flex flex-col">
            <div className="p-5 flex items-center justify-between border-b border-white/10">
              <h3 className="font-display text-xl">Your Vault</h3>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 && <p className="text-zinc-500 text-sm">Your cart is empty.</p>}
              {items.map(i => (
                <div key={i.key} className="flex gap-3 glass rounded-xl p-3">
                  <img src={i.images?.[0]} className="w-20 h-20 object-cover rounded-lg" alt={i.name}/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{i.name}</p>
                    <p className="text-xs text-zinc-500">Size {i.size}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => setQty(i.key, i.qty - 1)} className="p-1 rounded bg-white/5"><Minus size={12}/></button>
                      <span className="text-sm w-6 text-center">{i.qty}</span>
                      <button onClick={() => setQty(i.key, i.qty + 1)} className="p-1 rounded bg-white/5"><Plus size={12}/></button>
                      <button onClick={() => remove(i.key)} className="ml-auto p-1 text-zinc-500 hover:text-red-400"><Trash2 size={14}/></button>
                    </div>
                  </div>
                  <p className="text-gold text-sm font-semibold">${i.price * i.qty}</p>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-white/10">
              <div className="flex justify-between mb-4">
                <span className="text-zinc-400">Subtotal</span>
                <span className="font-display text-xl text-gold">${total.toFixed(2)}</span>
              </div>
              <Link to="/checkout" onClick={() => setOpen(false)}
                    className="btn-gold w-full">Checkout</Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
