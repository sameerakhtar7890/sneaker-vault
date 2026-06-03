import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ p, index = 0 }) {
  const { wishlist, toggleWish } = useCart();
  const liked = wishlist.includes(p._id);
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: index * 0.05 }}
      className="card group">
      <Link to={`/product/${p.slug}`} className="block relative overflow-hidden">
        <div className="aspect-square bg-ink-900 overflow-hidden">
          <motion.img
            src={p.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'}
            alt={p.name}
            loading="lazy"
            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'; }}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.08 }} transition={{ duration: 0.5 }} />
        </div>
        <button
          onClick={(e) => { e.preventDefault(); toggleWish(p._id); }}
          className="absolute top-3 right-3 glass rounded-full p-2 hover:bg-white/10 z-10">
          <Heart size={16} className={liked ? 'fill-gold text-gold' : 'text-zinc-300'} />
        </button>
        
        {/* Stock Badges */}
        {p.stock === 0 ? (
          <div className="absolute top-3 left-3 bg-red-500/90 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold shadow-lg">
            Out of Stock
          </div>
        ) : p.stock <= 5 ? (
          <div className="absolute top-3 left-3 bg-orange-500/90 text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold shadow-lg">
            Only {p.stock} left!
          </div>
        ) : null}
      </Link>
      <div className="p-5 flex items-end justify-between">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-zinc-500 uppercase">{p.brand}</p>
          <h3 className="font-display text-lg text-zinc-100">{p.name}</h3>
        </div>
        <p className="text-gold font-semibold">${p.price}</p>
      </div>
    </motion.article>
  );
}
