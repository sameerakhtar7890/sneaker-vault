import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, AlertCircle, Ruler, GitCompare } from 'lucide-react';
import api from '../utils/api';
import { findProductBySlug, loadOfflineCatalog } from '../utils/offlineCatalog';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import ImageGallery from '../components/ImageGallery';
import ProductCard from '../components/ProductCard';
import SizeGuideModal from '../components/SizeGuideModal';
import SeoMeta from '../components/SeoMeta';
import { useSeo } from '../context/SeoContext';
import { productSeoFromProduct } from '../utils/seo';

import SneakerLoader from '../components/SneakerLoader';

function Rating({ value, text }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex text-gold">
        {[1,2,3,4,5].map(i => (
          <Star key={i} size={14} className={value >= i ? 'fill-gold' : 'fill-transparent text-white/20'} />
        ))}
      </div>
      {text && <span className="text-xs text-zinc-500 font-medium">{text}</span>}
    </div>
  );
}

export default function Detail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  
  const [size, setSize] = useState(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const { add } = useCart();
  const { isInCompare, toggleCompare, count: compareCount } = useCompare();
  const { user } = useAuth();
  const { trackView } = useRecentlyViewed();
  const { fetchProductMeta, settings } = useSeo();
  const [productMeta, setProductMeta] = useState(null);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [offlineView, setOfflineView] = useState(false);

  const fetchProduct = () => {
    setLoading(true);
    api.get(`/products/${slug}`)
       .then(r => {
         setOfflineView(false);
         setProduct(r.data);
         return api.get('/products', { params: { brand: r.data.brand, limit: 10 } });
       })
       .then(r => {
         if (r && r.data) {
           const allRelated = r.data.products || r.data;
           setRelated(allRelated.filter(p => p.slug !== slug).slice(0, 4));
         }
       })
       .catch(() => {
         const cached = findProductBySlug(slug);
         if (cached) {
           setOfflineView(true);
           setProduct({ ...cached, reviews: cached.reviews || [] });
           const catalog = loadOfflineCatalog();
           const relatedFromCache = (catalog?.products || [])
             .filter(p => p.slug !== slug && p.brand === cached.brand)
             .slice(0, 4);
           setRelated(relatedFromCache);
         } else {
           setProduct(null);
         }
       })
       .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProduct(); }, [slug]);

  useEffect(() => {
    if (product?._id) trackView(product);
  }, [product?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!product?.slug) {
      setProductMeta(null);
      return;
    }
    fetchProductMeta(product.slug)
      .then(meta => setProductMeta(meta || productSeoFromProduct(product, settings)))
      .catch(() => setProductMeta(productSeoFromProduct(product, settings)));
  }, [product, settings, fetchProductMeta]);

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);
    setSubmitting(true);
    try {
      await api.post(`/products/${product._id}/reviews`, { rating, comment });
      setReviewSuccess(true);
      setComment('');
      setRating(5);
      fetchProduct(); // refresh reviews
    } catch (err) {
      setReviewError(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-32">
      <SneakerLoader size={64} />
    </div>
  );

  if (!product) return <div className="p-20 text-center text-zinc-500">Product not found.</div>;

  const myReview = user && product.reviews?.find(r => r.user === user._id);
  const alreadyReviewed = !!myReview;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {productMeta && <SeoMeta {...productMeta} siteName={settings.siteName} twitterCard={settings.twitterCard} siteUrl={settings.siteUrl} />}
      {offlineView && (
        <p className="mb-6 text-sm text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          Offline view — some details may be outdated. Connect to place orders or leave reviews.
        </p>
      )}
      {/* Product Details Section */}
      <div className="grid md:grid-cols-2 gap-12 mb-20">
        <div>
          <ImageGallery images={product.images} name={product.name} />
        </div>
        <div>
          <p className="text-gold tracking-[0.3em] text-xs uppercase">{product.brand}</p>
          <h1 className="font-display text-5xl mt-2">{product.name}</h1>
          
          <div className="mt-4">
            <Rating value={product.rating} text={`${product.numReviews || 0} review${product.numReviews !== 1 ? 's' : ''}`} />
          </div>

          <p className="text-3xl text-gold mt-6 font-semibold">${product.price}</p>
          
          {/* Stock Status */}
          <div className="mt-3">
            {product.stock === 0 ? (
              <span className="inline-block bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                Out of Stock
              </span>
            ) : product.stock <= 5 ? (
              <span className="inline-block bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                Hurry! Only {product.stock} left
              </span>
            ) : (
              <span className="inline-block bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                In Stock
              </span>
            )}
          </div>

          <p className="text-zinc-400 mt-6 leading-relaxed">{product.description}</p>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm uppercase tracking-wider text-zinc-400">Select Size (US)</h3>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="flex items-center gap-1.5 text-xs text-gold hover:text-gold/80 transition underline-offset-2 hover:underline"
              >
                <Ruler size={13} />
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes?.map(s => (
                <button key={s} onClick={() => setSize(s)}
                  className={`w-14 h-14 rounded-xl border text-sm transition
                    ${size === s ? 'bg-gold text-ink-950 border-gold font-bold' : 'border-white/15 hover:border-gold text-zinc-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <SizeGuideModal
            open={sizeGuideOpen}
            onClose={() => setSizeGuideOpen(false)}
            brand={product.brand}
            selectedSize={size}
          />

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              disabled={!size || product.stock === 0}
              onClick={() => add({ ...product, size })}
              className="btn-gold flex-1 md:flex-none disabled:opacity-40">
              {product.stock === 0 ? 'Out of Stock' : size ? 'Add to Vault' : 'Select a size'}
            </button>
            <button
              type="button"
              onClick={() => toggleCompare(product._id)}
              className={`btn-ghost flex items-center gap-2 ${
                isInCompare(product._id) ? 'border-gold/40 text-gold bg-gold/10' : ''
              }`}
            >
              <GitCompare size={16} />
              {isInCompare(product._id) ? 'In compare' : 'Compare'}
            </button>
            {compareCount > 0 && (
              <Link to="/compare" className="btn-ghost text-sm py-3">
                View compare ({compareCount})
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-white/5 pt-16 grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="font-display text-3xl mb-8">Customer Reviews</h2>
          
          {!product.reviews?.filter(r => r.approved).length ? (
            <p className="text-zinc-500">No reviews yet. Be the first to review this pair!</p>
          ) : (
            <div className="space-y-6">
              {product.reviews?.filter(r => r.approved).map(r => (
                <div key={r._id} className="glass rounded-2xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-medium text-zinc-200">{r.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Rating value={r.rating} />
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-display text-2xl mb-6">Write a Review</h3>

          {offlineView ? (
            <div className="glass rounded-2xl p-8 text-center text-zinc-500 text-sm">
              Reviews are unavailable offline.
            </div>
          ) : !user ? (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-zinc-400 mb-4">You must be logged in to write a review.</p>
              <Link to="/login" className="btn-gold px-8 py-2 text-sm">Sign In</Link>
            </div>
          ) : alreadyReviewed ? (
            <div className="glass rounded-2xl p-6 border-l-4 border-l-gold">
              <p className="text-zinc-300">
                {myReview.approved 
                  ? "You have already reviewed this product. Thank you for your feedback!" 
                  : "Your review has been submitted and is currently pending administrator approval."}
              </p>
            </div>
          ) : (
            <form onSubmit={submitReview} className="glass rounded-2xl p-8">
              {reviewError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  {reviewError}
                </div>
              )}
              {reviewSuccess && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl px-4 py-3 mb-6 text-sm">
                  Review submitted successfully!
                </div>
              )}

              <div className="mb-6">
                <label className="block text-xs text-zinc-400 tracking-widest uppercase mb-2">Rating</label>
                <select 
                  value={rating} 
                  onChange={e => setRating(Number(e.target.value))}
                  className="w-full bg-ink-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/30">
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-xs text-zinc-400 tracking-widest uppercase mb-2">Review</label>
                <textarea 
                  value={comment} 
                  onChange={e => setComment(e.target.value)}
                  required
                  rows="4"
                  placeholder="What do you think about this pair?"
                  className="w-full bg-ink-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/30 resize-none"
                />
              </div>

              <button type="submit" disabled={submitting} className="btn-gold w-full disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="border-t border-white/5 pt-16 mt-16">
          <h2 className="font-display text-3xl mb-8">More from {product.brand}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p._id} p={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
