import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Home, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated Compass Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative inline-flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gold/10 blur-3xl rounded-full scale-150"></div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="relative bg-zinc-900/60 border border-white/10 p-6 rounded-full text-gold shadow-lg shadow-black/40"
          >
            <Compass size={64} className="stroke-[1.5]" />
          </motion.div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <p className="section-eyebrow">ERROR 404</p>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight text-zinc-100">
            Lost in the Vault
          </h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-sm mx-auto">
            The kicks or page you are looking for cannot be found. It may have been moved, deleted, or never existed in the vault.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/" className="btn-gold w-full sm:w-auto text-sm flex items-center justify-center gap-2">
            <Home size={16} />
            <span>Go Home</span>
          </Link>
          <Link to="/shop" className="btn-ghost w-full sm:w-auto text-sm flex items-center justify-center gap-2">
            <ShoppingBag size={16} />
            <span>Browse Shop</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
