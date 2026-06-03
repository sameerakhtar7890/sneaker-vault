import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import { sampleProducts } from '../utils/sampleProducts';
import { motion } from 'framer-motion';

export default function Home() {
  const [products, setProducts] = useState(sampleProducts);
  useEffect(() => {
    api.get('/products?featured=true').then(r => r.data?.length && setProducts(r.data)).catch(() => {});
  }, []);
  return (
    <>
      <Hero />
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="flex items-end justify-between mb-8">
          <div>
            <p className="text-gold tracking-[0.3em] text-xs">THE COLLECTION</p>
            <h2 className="font-display text-3xl md:text-4xl">Featured Pairs</h2>
          </div>
        </motion.div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 6).map((p, i) => <ProductCard key={p._id} p={p} index={i} />)}
        </div>
      </section>
    </>
  );
}
