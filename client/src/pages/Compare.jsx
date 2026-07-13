import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitCompare, X, Star, Trash2, ShoppingBag } from 'lucide-react';
import { useCompare, MAX_COMPARE } from '../context/CompareContext';
import { useCart } from '../context/CartContext';

function Stars({ value }) {
  return (
    <div className="flex text-gold justify-center">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} className={value >= i ? 'fill-gold' : 'fill-transparent text-white/20'} />
      ))}
    </div>
  );
}

const ROWS = [
  { key: 'image', label: '' },
  { key: 'name', label: 'Product' },
  { key: 'brand', label: 'Brand' },
  { key: 'price', label: 'Price' },
  { key: 'rating', label: 'Rating' },
  { key: 'stock', label: 'Availability' },
  { key: 'sizes', label: 'Sizes (US)' },
  { key: 'category', label: 'Category' },
  { key: 'description', label: 'Description' },
  { key: 'actions', label: '' }
];

function cellValue(product, key, { bestPrice, bestRating, multi }) {
  switch (key) {
    case 'image':
      return (
        <Link to={`/product/${product.slug}`} className="block aspect-square rounded-xl overflow-hidden bg-ink-900">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </Link>
      );
    case 'name':
      return (
        <Link to={`/product/${product.slug}`} className="font-display text-lg text-zinc-100 hover:text-gold transition">
          {product.name}
        </Link>
      );
    case 'brand':
      return <span className="text-zinc-300 uppercase tracking-wider text-sm">{product.brand}</span>;
    case 'price':
      return (
        <span className={`text-xl font-semibold ${product.price === bestPrice ? 'text-gold' : 'text-zinc-200'}`}>
          ${product.price}
          {product.price === bestPrice && multi && (
            <span className="block text-[10px] text-gold/80 uppercase mt-1">Lowest</span>
          )}
        </span>
      );
    case 'rating':
      return (
        <div className={product.rating === bestRating && bestRating > 0 ? 'ring-1 ring-gold/30 rounded-lg py-1' : ''}>
          <Stars value={product.rating || 0} />
          <p className="text-xs text-zinc-500 mt-1 text-center">{product.numReviews || 0} reviews</p>
        </div>
      );
    case 'stock':
      if (product.stock === 0) return <span className="text-red-400 text-sm">Out of stock</span>;
      if (product.stock <= 5) return <span className="text-orange-400 text-sm">{product.stock} left</span>;
      return <span className="text-green-400 text-sm">In stock</span>;
    case 'sizes':
      return (
        <span className="text-sm text-zinc-400">
          {product.sizes?.length ? product.sizes.join(', ') : '—'}
        </span>
      );
    case 'category':
      return <span className="text-sm text-zinc-400 capitalize">{product.category || 'sneakers'}</span>;
    case 'description':
      return (
        <p className="text-sm text-zinc-500 line-clamp-4 leading-relaxed">
          {product.description || '—'}
        </p>
      );
    default:
      return null;
  }
}

export default function Compare() {
  const { products, loading, count, removeFromCompare, clearCompare } = useCompare();
  const { add } = useCart();
  const [pickSize, setPickSize] = useState({});

  const bestPrice = products.length
    ? Math.min(...products.map(p => p.price))
    : null;
  const bestRating = products.length
    ? Math.max(...products.map(p => p.rating || 0))
    : null;

  const addProduct = (p) => {
    const size = pickSize[p._id] || p.sizes?.[0];
    if (!size) return;
    add({ ...p, size });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4 mb-8"
      >
        <div>
          <p className="section-eyebrow mb-2">SIDE BY SIDE</p>
          <h1 className="font-display text-4xl md:text-5xl flex items-center gap-3">
            <GitCompare className="text-gold" size={32} />
            Compare Products
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            Add up to {MAX_COMPARE} sneakers from the shop to compare specs and pricing.
          </p>
        </div>
        {count > 0 && (
          <button type="button" onClick={clearCompare} className="btn-ghost text-sm py-2 flex items-center gap-2">
            <Trash2 size={14} /> Clear all
          </button>
        )}
      </motion.div>

      {products.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center max-w-xl mx-auto">
          <GitCompare size={48} className="mx-auto text-zinc-600 mb-4" />
          <h2 className="font-display text-2xl mb-2">Nothing to compare yet</h2>
          <p className="text-zinc-500 text-sm mb-6">
            Use the compare icon on product cards to add up to {MAX_COMPARE} pairs.
          </p>
          <Link to="/shop" className="btn-gold">Browse the Shop</Link>
        </div>
      ) : (
        <>
          <p className="text-xs text-zinc-500 mb-4">
            {count} of {MAX_COMPARE} selected
            {count < MAX_COMPARE && ' — add more from the shop'}
          </p>

          <div className="overflow-x-auto -mx-6 px-6 pb-4">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <th className="w-36 p-3 text-left text-xs text-zinc-500 uppercase tracking-wider sticky left-0 bg-ink-950/95 z-10" />
                  {products.map(p => (
                    <th key={p._id} className="p-3 min-w-[200px] align-top">
                      <button
                        type="button"
                        onClick={() => removeFromCompare(p._id)}
                        className="ml-auto flex p-1.5 rounded-full hover:bg-white/10 text-zinc-500 hover:text-red-400 transition"
                        aria-label="Remove from compare"
                      >
                        <X size={14} />
                      </button>
                    </th>
                  ))}
                  {count < MAX_COMPARE && (
                    <th className="p-3 min-w-[160px] align-middle">
                      <Link
                        to="/shop"
                        className="flex flex-col items-center justify-center h-full min-h-[120px] rounded-2xl border border-dashed border-white/15 text-zinc-500 hover:border-gold/30 hover:text-gold transition text-sm"
                      >
                        + Add product
                      </Link>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {ROWS.map(row => (
                  <tr key={row.key} className="border-t border-white/10">
                    <td className="p-3 text-xs text-zinc-500 uppercase tracking-wider sticky left-0 bg-ink-950/95 z-10 font-medium">
                      {row.label}
                    </td>
                    {products.map(p => (
                      <td key={`${p._id}-${row.key}`} className="p-3 align-top text-center">
                        {row.key === 'actions' ? (
                          <div className="space-y-3">
                            {p.sizes?.length > 0 && (
                              <select
                                value={pickSize[p._id] || p.sizes[0]}
                                onChange={e => setPickSize(s => ({ ...s, [p._id]: Number(e.target.value) }))}
                                className="input-premium text-xs w-full"
                              >
                                {p.sizes.map(s => (
                                  <option key={s} value={s} className="bg-zinc-900">Size {s}</option>
                                ))}
                              </select>
                            )}
                            <button
                              type="button"
                              disabled={p.stock === 0 || !p.sizes?.length}
                              onClick={() => addProduct(p)}
                              className="btn-gold w-full text-xs py-2 flex items-center justify-center gap-1 disabled:opacity-40"
                            >
                              <ShoppingBag size={14} /> Add to cart
                            </button>
                            <Link
                              to={`/product/${p.slug}`}
                              className="block text-xs text-gold hover:underline"
                            >
                              View details
                            </Link>
                          </div>
                        ) : (
                          cellValue(p, row.key, { bestPrice, bestRating, multi: products.length > 1 })
                        )}
                      </td>
                    ))}
                    {count < MAX_COMPARE && <td />}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
