import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Star, AlertCircle, MessageSquare } from 'lucide-react';
import api from '../../utils/api';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const loadReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/products/reviews/pending');
      setReviews(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch pending reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleApprove = async (productId, reviewId) => {
    try {
      await api.put(`/products/${productId}/reviews/${reviewId}/approve`);
      showToast('Review approved successfully!');
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to approve review');
    }
  };

  const handleDelete = async (productId, reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/products/${productId}/reviews/${reviewId}`);
      showToast('Review deleted successfully!');
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-6 right-6 z-50 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm shadow-xl"
          >
            <Check size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Moderate Reviews</h1>
        <span className="text-zinc-400 text-sm font-medium">{reviews.length} pending reviews</span>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {reviews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-16 text-center max-w-2xl mx-auto mt-8"
        >
          <MessageSquare size={48} className="mx-auto text-zinc-600 mb-4" />
          <h3 className="font-display text-2xl mb-2">No reviews pending</h3>
          <p className="text-zinc-400">All submitted product reviews have been moderated.</p>
        </motion.div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 text-left">
                  <th className="px-5 py-4 font-medium">Product</th>
                  <th className="px-5 py-4 font-medium">User</th>
                  <th className="px-5 py-4 font-medium">Rating</th>
                  <th className="px-5 py-4 font-medium">Comment</th>
                  <th className="px-5 py-4 font-medium">Submitted</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reviews.map((r) => (
                  <tr key={r._id} className="hover:bg-white/3 transition">
                    <td className="px-5 py-4">
                      <a
                        href={`/product/${r.productSlug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-200 hover:text-gold transition font-medium"
                      >
                        {r.productName}
                      </a>
                    </td>
                    <td className="px-5 py-4 text-zinc-300 font-medium">{r.name}</td>
                    <td className="px-5 py-4">
                      <div className="flex text-gold">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={r.rating >= star ? 'fill-gold' : 'fill-transparent text-white/20'}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-zinc-400 max-w-xs truncate" title={r.comment}>
                      {r.comment}
                    </td>
                    <td className="px-5 py-4 text-zinc-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(r.productId, r._id)}
                          className="p-2 rounded-lg hover:bg-green-500/10 text-zinc-400 hover:text-green-400 transition"
                          title="Approve Review"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(r.productId, r._id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition"
                          title="Delete Review"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
