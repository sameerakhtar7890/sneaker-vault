import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Package, Mail, Hash, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../utils/api';

export default function TrackOrder() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ orderId: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');

    const orderId = form.orderId.trim();
    const email   = form.email.trim().toLowerCase();

    if (!orderId || !email) {
      setError('Please enter both your Order ID and email address.');
      return;
    }

    setLoading(true);
    try {
      // Attempt to fetch the order — backend validates email ownership
      await api.get(`/orders/${orderId}`, { params: { email } });
      // Success: redirect to the order tracking page
      navigate(`/order/${orderId}?email=${encodeURIComponent(email)}`);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setError('No order found with that Order ID. Please double-check and try again.');
      } else if (status === 403) {
        setError('The email address does not match the one used to place this order.');
      } else {
        setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 text-gold mb-6">
            <Package size={32} className="stroke-[1.5]" />
          </div>
          <p className="section-eyebrow mb-2">GUEST TRACKING</p>
          <h1 className="font-display text-4xl mb-3">Track Your Order</h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto">
            Enter the Order ID from your confirmation email and the email address you used at checkout.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong rounded-2xl p-8 shadow-card"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={submit} className="space-y-5">
            {/* Order ID */}
            <div>
              <label className="block text-xs text-zinc-400 tracking-widest uppercase mb-2">
                Order ID
              </label>
              <div className="relative">
                <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                <input
                  id="track-order-id"
                  type="text"
                  name="orderId"
                  value={form.orderId}
                  onChange={handle}
                  required
                  disabled={loading}
                  placeholder="e.g. 6842f3a1c5d..."
                  className="input-premium pl-11 pr-4 py-3 font-mono text-sm disabled:opacity-50"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
              <p className="mt-1.5 text-xs text-zinc-600">
                Find this in your order confirmation email (e.g. #A1B2C3D4…)
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs text-zinc-400 tracking-widest uppercase mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                <input
                  id="track-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handle}
                  required
                  disabled={loading}
                  placeholder="Email used at checkout"
                  className="input-premium pl-11 pr-4 py-3 disabled:opacity-50"
                />
              </div>
            </div>

            <button
              id="track-submit"
              type="submit"
              disabled={loading}
              className="btn-gold w-full mt-2 gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-ink-950/40 border-t-ink-950 rounded-full animate-spin" />
                  <span>Looking up order…</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Track Order</span>
                </>
              )}
            </button>
          </form>

          {/* Divider + Login prompt */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center space-y-2">
            <p className="text-xs text-zinc-500">Have an account?</p>
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-gold hover:text-gold-soft transition-colors"
            >
              Sign in to see all your orders <ArrowRight size={14} />
            </a>
          </div>
        </motion.div>

        {/* Help note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-zinc-600 mt-6"
        >
          Can't find your Order ID?{' '}
          <a href="/contact" className="text-zinc-500 hover:text-gold transition-colors">
            Contact our support team
          </a>
        </motion.p>
      </div>
    </div>
  );
}
