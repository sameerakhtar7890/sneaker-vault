import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const REASONS = [
  { value: 'wrong_size', label: 'Wrong size' },
  { value: 'defective', label: 'Defective or damaged' },
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'other', label: 'Other' }
];

export default function ReturnRequestModal({ open, onClose, order, onSuccess }) {
  const [reason, setReason] = useState('wrong_size');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/returns', {
        orderId: order._id,
        reason,
        description
      });
      onSuccess?.();
      onClose();
      setDescription('');
      setReason('wrong_size');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 12 }}
          className="relative glass rounded-2xl w-full max-w-md p-6 z-10"
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 text-gold mb-1">
                <RotateCcw size={16} />
                <span className="text-xs tracking-[0.2em] uppercase">Return Request</span>
              </div>
              <h2 className="font-display text-xl">Request a Return</h2>
              <p className="text-zinc-500 text-sm mt-1">
                Order #{order?._id?.slice(-8).toUpperCase()} · ${order?.total_price?.toFixed(2)}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </div>
            )}

            <div>
              <label className="block text-xs text-zinc-400 tracking-widest uppercase mb-2">Reason</label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50"
              >
                {REASONS.map(r => (
                  <option key={r.value} value={r.value} className="bg-zinc-900">{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 tracking-widest uppercase mb-2">
                Details (optional)
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Tell us more about the issue…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold/50 resize-none placeholder-zinc-600"
              />
            </div>

            <p className="text-[11px] text-zinc-500">
              Returns must be requested within 30 days of delivery. Our team will review your request within 2–3 business days.
            </p>

            <button type="submit" disabled={submitting} className="btn-gold w-full py-3 disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Submit Return Request'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export const REASON_LABELS = Object.fromEntries(REASONS.map(r => [r.value, r.label]));

export const RETURN_STATUS_STYLE = {
  pending:  'text-orange-400 bg-orange-400/10',
  approved: 'text-blue-400 bg-blue-400/10',
  rejected: 'text-red-400 bg-red-400/10',
  refunded: 'text-green-400 bg-green-400/10'
};
