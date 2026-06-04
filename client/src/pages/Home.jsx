import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import RecentlyViewedSection from '../components/RecentlyViewedSection';
import api from '../utils/api';
import { loadOfflineCatalog, filterOfflineProducts } from '../utils/offlineCatalog';
import { motion } from 'framer-motion';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products?featured=true')
      .then(r => {
        if (r.data?.products?.length) setProducts(r.data.products);
      })
      .catch(() => {
        const catalog = loadOfflineCatalog();
        if (catalog?.products?.length) {
          const featured = filterOfflineProducts(catalog.products, {
            featured: true,
            brand: 'all',
            size: 'all',
            maxPrice: '1000',
            sort: 'newest',
            q: ''
          });
          setProducts(featured.slice(0, 6));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Hero />
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <p className="section-eyebrow">THE COLLECTION</p>
            <h2 className="font-display text-3xl md:text-4xl mt-1">Featured Pairs</h2>
          </div>
        </motion.div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            [...Array(3)].map((_, i) => <ProductSkeleton key={i} />)
          ) : (
            products.slice(0, 6).map((p, i) => <ProductCard key={p._id} p={p} index={i} />)
          )}
        </div>
      </section>

      <RecentlyViewedSection className="pb-16" />
    </>
  );
}
