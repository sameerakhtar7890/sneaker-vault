import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HeartCrack } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

export default function Wishlist() {
  const { wishlist } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wishlist.length) {
      setProducts([]);
      setLoading(false);
      return;
    }

    api.get('/products?limit=100')
      .then(r => {
        const all = r.data.products || r.data;
        setProducts(all.filter(p => wishlist.includes(p._id)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [wishlist]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-gold tracking-[0.3em] text-xs mb-2">YOUR FAVORITES</p>
          <h1 className="font-display text-4xl">Wishlist</h1>
        </div>
        <span className="text-zinc-400 text-sm">{wishlist.length} items</span>
      </div>

      {products.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-16 text-center max-w-2xl mx-auto mt-12">
          <HeartCrack size={48} className="mx-auto text-zinc-600 mb-4" />
          <h3 className="font-display text-2xl mb-2">Your wishlist is empty</h3>
          <p className="text-zinc-400 mb-6">Explore our collection and find your next favorite pair.</p>
          <Link to="/shop" className="btn-gold">Explore the Vault</Link>
        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p._id} p={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
