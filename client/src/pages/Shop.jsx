import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ArrowUpDown, Ruler } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import SizeGuideModal from '../components/SizeGuideModal';
import RecentlyViewedSection from '../components/RecentlyViewedSection';
import api from '../utils/api';

const BRANDS = ['all', 'Nike', 'Adidas', 'Jordan', 'New Balance', 'Puma'];
const SIZES = ['all', '8', '9', '10', '11', '12', '13'];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pageData, setPageData] = useState({ page: 1, pages: 1, total: 0 });
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Parse filters from URL
  const q        = searchParams.get('q') || '';
  const brand    = searchParams.get('brand') || 'all';
  const size     = searchParams.get('size') || 'all';
  const maxPrice = searchParams.get('maxPrice') || '1000';
  const sort     = searchParams.get('sort') || 'newest';

  const updateParams = (updates) => {
    const current = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...current, ...updates });
  };

  const fetchProducts = (page = 1) => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    const params = { page, limit: 6, sort };
    if (q) params.q = q;
    if (brand !== 'all') params.brand = brand;
    if (size !== 'all') params.size = size;
    if (maxPrice !== '1000') params.maxPrice = maxPrice;

    api.get('/products', { params })
      .then(r => {
        if (page === 1) setProducts(r.data.products);
        else setProducts(prev => [...prev, ...r.data.products]);
        setPageData({ page: r.data.page, pages: r.data.pages, total: r.data.total });
      })
      .catch(console.error)
      .finally(() => { setLoading(false); setLoadingMore(false); });
  };

  useEffect(() => {
    fetchProducts(1);
  }, [q, brand, size, maxPrice, sort]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4"
      >
        <div>
          <p className="section-eyebrow mb-2">CURATED SELECTION</p>
          <h1 className="font-display text-4xl md:text-5xl">The Shop</h1>
          <p className="text-zinc-400 mt-2 text-sm">{pageData.total || products.length} pairs found</p>
        </div>

        {/* Search Bar, Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search sneakers..."
              value={q}
              onChange={(e) => updateParams({ q: e.target.value })}
              className="input-premium rounded-full pl-11 pr-10"
            />
            {q && (
              <button onClick={() => updateParams({ q: '' })}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <select
              value={sort}
              onChange={e => updateParams({ sort: e.target.value })}
              className="input-premium appearance-none rounded-full pl-8 pr-8 cursor-pointer text-zinc-300"
            >
              <option value="newest" className="bg-zinc-900">Newest</option>
              <option value="popular" className="bg-zinc-900">Most Popular</option>
              <option value="price_asc" className="bg-zinc-900">Price: Low → High</option>
              <option value="price_desc" className="bg-zinc-900">Price: High → Low</option>
            </select>
          </div>

          <button 
            onClick={() => setShowFilters(f => !f)}
            className="md:hidden p-3 rounded-full glass hover:bg-gold/10 transition-all duration-300 hover:scale-105 active:scale-95">
            <SlidersHorizontal size={16} className="text-zinc-300" />
          </button>
        </div>
      </motion.div>

      <RecentlyViewedSection className="mb-12" />

      <div className="grid md:grid-cols-[240px_1fr] gap-10">
        {/* Filters Sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} md:block glass rounded-2xl p-6 h-fit sticky top-24`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg">Filters</h3>
            {(brand !== 'all' || size !== 'all' || maxPrice !== '1000') && (
              <button 
                onClick={() => setSearchParams(q ? { q } : {})}
                className="text-xs text-gold hover:text-gold-soft">
                Reset
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-wider mb-3 block">Brand</label>
              <div className="space-y-2">
                {BRANDS.map(b => (
                  <label key={b} className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="brand" value={b} checked={brand === b}
                      onChange={() => updateParams({ brand: b })}
                      className="accent-gold w-4 h-4" />
                    <span className="text-sm text-zinc-300 group-hover:text-gold transition capitalize">
                      {b}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs text-zinc-400 uppercase tracking-wider">Size (US)</label>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="flex items-center gap-1 text-[11px] text-gold hover:text-gold/80 transition"
                >
                  <Ruler size={11} /> Size Guide
                </button>
              </div>
              <select value={size} onChange={e => updateParams({ size: e.target.value })}
                className="input-premium">
                {SIZES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Sizes' : s}</option>)}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs text-zinc-400 uppercase tracking-wider block">Max Price</label>
                <span className="text-xs font-semibold text-gold">${maxPrice}</span>
              </div>
              <input type="range" min="100" max="1000" step="50" value={maxPrice}
                onChange={e => updateParams({ maxPrice: e.target.value })} 
                className="w-full accent-gold" />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-2">
                <span>$100</span>
                <span>$1000+</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center text-zinc-500">
              <p>No pairs match your current filters.</p>
              <button onClick={() => setSearchParams({})} className="text-gold hover:underline mt-2">Clear all filters</button>
            </div>
          ) : (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p, i) => (
                  <ProductCard key={p._id} p={p} index={i} />
                ))}
              </motion.div>
              {pageData.page < pageData.pages && (
                <div className="mt-12 flex justify-center">
                  <button 
                    onClick={() => fetchProducts(pageData.page + 1)}
                    disabled={loadingMore}
                    className="btn-gold px-8 py-3 bg-transparent border-gold text-gold hover:bg-gold hover:text-ink-950 disabled:opacity-50">
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        brand={brand !== 'all' ? brand : null}
        selectedSize={size !== 'all' ? size : null}
      />
    </div>
  );
}
