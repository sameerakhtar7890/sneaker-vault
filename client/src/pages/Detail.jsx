import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { sampleProducts } from '../utils/sampleProducts';
import { useCart } from '../context/CartContext';

export default function Detail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(() => sampleProducts.find(p => p.slug === slug));
  const [size, setSize] = useState(null);
  const { add } = useCart();

  useEffect(() => {
    api.get(`/products/${slug}`).then(r => setProduct(r.data)).catch(() => {});
  }, [slug]);

  if (!product) return <div className="p-20 text-center text-zinc-500">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl overflow-hidden">
        <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-cover"/>
      </motion.div>
      <div>
        <p className="text-gold tracking-[0.3em] text-xs">{product.brand}</p>
        <h1 className="font-display text-5xl mt-2">{product.name}</h1>
        <p className="text-3xl text-gold mt-3 font-semibold">${product.price}</p>
        <p className="text-zinc-400 mt-6 leading-relaxed">{product.description}</p>

        <div className="mt-8">
          <h3 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">Select Size (US)</h3>
          <div className="flex flex-wrap gap-2">
            {product.sizes?.map(s => (
              <button key={s} onClick={() => setSize(s)}
                className={`w-14 h-14 rounded-xl border text-sm transition
                  ${size === s ? 'bg-gold text-ink-950 border-gold' : 'border-white/15 hover:border-gold'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          disabled={!size}
          onClick={() => add({ ...product, size })}
          className="btn-gold mt-8 w-full md:w-auto disabled:opacity-40">
          {size ? 'Add to Vault' : 'Select a size'}
        </button>
      </div>
    </div>
  );
}
