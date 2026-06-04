import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, GitCompare } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';

export default function ProductCard({ p, index = 0 }) {
  const { wishlist, toggleWish } = useCart();
  const { isInCompare, toggleCompare } = useCompare();
  const liked = wishlist.includes(p._id);
  const comparing = isInCompare(p._id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="card card-hover group"
    >
      <Link to={`/product/${p.slug}`} className="block relative overflow-hidden">
        <div className="aspect-square bg-ink-900 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <motion.img
            src={p.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'}
            alt={p.name}
            loading="lazy"
            onError={e => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80';
            }}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.preventDefault(); toggleCompare(p._id); }}
            className={`glass-strong rounded-full p-2.5 transition-colors duration-300 ${
              comparing ? 'bg-gold/20 text-gold' : 'hover:bg-gold/10 text-zinc-300'
            }`}
            aria-label={comparing ? 'Remove from compare' : 'Add to compare'}
          >
            <GitCompare size={16} className={comparing ? 'scale-110' : ''} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.preventDefault(); toggleWish(p._id); }}
            className="glass-strong rounded-full p-2.5 hover:bg-gold/10 transition-colors duration-300"
          >
            <Heart
              size={16}
              className={`transition-all duration-300 ${liked ? 'fill-gold text-gold scale-110' : 'text-zinc-300'}`}
            />
          </motion.button>
        </div>

        {p.stock === 0 ? (
          <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold z-10">
            Out of Stock
          </div>
        ) : p.stock <= 5 ? (
          <div className="absolute top-3 left-3 bg-orange-500/90 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold z-10">
            Only {p.stock} left!
          </div>
        ) : null}
      </Link>
      <div className="p-5 flex items-end justify-between border-t border-white/5">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-zinc-500 uppercase">{p.brand}</p>
          <h3 className="font-display text-lg text-zinc-100 group-hover:text-gold transition-colors duration-300">
            {p.name}
          </h3>
        </div>
        <p className="text-gold font-semibold text-lg">${p.price}</p>
      </div>
    </motion.article>
  );
}
