import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import { sampleProducts } from '../utils/sampleProducts';

export default function Shop() {
  const [all, setAll] = useState(sampleProducts);
  const [brand, setBrand] = useState('all');
  const [size, setSize] = useState('all');
  const [maxPrice, setMaxPrice] = useState(1000);

  useEffect(() => {
    api.get('/products').then(r => r.data?.length && setAll(r.data)).catch(() => {});
  }, []);

  const brands = useMemo(() => ['all', ...new Set(all.map(p => p.brand))], [all]);
  const filtered = all.filter(p =>
    (brand === 'all' || p.brand === brand) &&
    (size === 'all' || p.sizes?.includes(Number(size))) &&
    p.price <= maxPrice
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-[240px_1fr] gap-10">
      <aside className="glass rounded-2xl p-5 h-fit sticky top-20">
        <h3 className="font-display text-lg mb-4">Filters</h3>
        <div className="mb-5">
          <label className="text-xs text-zinc-400 uppercase tracking-wider">Brand</label>
          <select value={brand} onChange={e=>setBrand(e.target.value)}
            className="mt-2 w-full bg-ink-900 border border-white/10 rounded-lg px-3 py-2 text-sm">
            {brands.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="mb-5">
          <label className="text-xs text-zinc-400 uppercase tracking-wider">Size</label>
          <select value={size} onChange={e=>setSize(e.target.value)}
            className="mt-2 w-full bg-ink-900 border border-white/10 rounded-lg px-3 py-2 text-sm">
            <option>all</option>{[8,9,10,11,12,13].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-zinc-400 uppercase tracking-wider">Max price: ${maxPrice}</label>
          <input type="range" min="100" max="1000" value={maxPrice}
            onChange={e=>setMaxPrice(Number(e.target.value))} className="w-full mt-2 accent-gold"/>
        </div>
      </aside>
      <div>
        <h1 className="font-display text-4xl mb-6">The Shop</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => <ProductCard key={p._id} p={p} index={i} />)}
          {filtered.length === 0 && <p className="text-zinc-500">No pairs match these filters.</p>}
        </div>
      </div>
    </div>
  );
}
