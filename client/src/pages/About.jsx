import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="font-display text-5xl md:text-6xl mb-6">Redefining Sneaker Culture</h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-6">
            Sneaker Vault started with a simple mission: to provide a curated, premium destination for sneaker enthusiasts to find exclusive drops, timeless classics, and hard-to-find grails.
          </p>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            We believe that sneakers are more than just footwear—they are a form of expression, a piece of art, and a reflection of culture. Every pair in our vault is carefully authenticated and selected to ensure you only get the best.
          </p>
          <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8 mt-8">
            <div>
              <h4 className="font-display text-4xl text-gold mb-2">10K+</h4>
              <p className="text-zinc-500 text-sm uppercase tracking-wider">Pairs Sold</p>
            </div>
            <div>
              <h4 className="font-display text-4xl text-gold mb-2">100%</h4>
              <p className="text-zinc-500 text-sm uppercase tracking-wider">Authentic</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="relative">
          <div className="absolute inset-0 bg-gold/20 blur-[100px] rounded-full" />
          <img 
            src="https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80" 
            alt="Sneaker Culture" 
            className="relative z-10 w-full h-[600px] object-cover rounded-3xl"
          />
        </motion.div>
      </div>
    </div>
  );
}
