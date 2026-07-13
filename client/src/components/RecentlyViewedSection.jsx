import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';

export default function RecentlyViewedSection({ className = '' }) {
  const { products, loading } = useRecentlyViewed();

  if (!loading && products.length === 0) return null;

  return (
    <section className={`max-w-7xl mx-auto px-6 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-end justify-between mb-8"
      >
        <div>
          <p className="section-eyebrow flex items-center gap-2">
            <Clock size={12} /> PICK UP WHERE YOU LEFT OFF
          </p>
          <h2 className="font-display text-3xl md:text-4xl mt-1">You Recently Viewed</h2>
        </div>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
          : products.slice(0, 8).map((p, i) => <ProductCard key={p._id} p={p} index={i} />)
        }
      </div>
    </section>
  );
}
