import { useState, useEffect } from 'react';
import { Mail, Bell, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function StockAlertForm({ productId }) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/stock-alerts', { email, productId });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-xl p-4 mt-3 border border-white/5">
      <div className="flex items-center gap-2 mb-2 text-gold">
        <Bell size={14} className="animate-pulse" />
        <span className="text-xs uppercase tracking-wider font-semibold">Notify me when back in stock</span>
      </div>

      {success ? (
        <div className="flex items-center gap-2 text-green-400 text-xs py-1">
          <CheckCircle size={14} className="shrink-0" />
          <span>Alert registered! We will email you when it drops.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-ink-950/60 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-gold/30 placeholder-zinc-600"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-gold py-1.5 px-3 text-xs rounded-lg font-medium tracking-wide disabled:opacity-50"
          >
            {loading ? 'Subscribed' : 'Notify'}
          </button>
        </form>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-red-400 text-[10px] mt-2">
          <AlertCircle size={12} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
