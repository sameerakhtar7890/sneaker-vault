import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-28 grid md:grid-cols-2 gap-10 items-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="text-gold tracking-[0.3em] text-xs mb-4">SS25 · LIMITED RELEASE</p>
          <h1 className="font-display text-5xl md:text-7xl leading-[1.05]">
            Step Into <br/> <span className="text-gold">Quiet Luxury.</span>
          </h1>
          <p className="mt-6 text-zinc-400 max-w-md">
            A curated vault of rare, hand-finished sneakers from the world's most uncompromising houses.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/shop" className="btn-gold">Explore the Vault</Link>
            <Link to="/shop?featured=true" className="btn-ghost">Featured</Link>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
          className="relative">
          <div className="absolute inset-0 -z-10 blur-3xl bg-gold/20 rounded-full"/>
          <img className="rounded-3xl shadow-2xl shadow-black/50"
               src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80"
               alt="Featured sneaker"/>
        </motion.div>
      </div>
    </section>
  );
}
