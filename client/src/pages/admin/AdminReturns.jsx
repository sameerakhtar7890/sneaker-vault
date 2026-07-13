import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Check, X, Filter } from 'lucide-react';
import api from '../../utils/api';
import { RETURN_STATUS_STYLE, REASON_LABELS } from '../../components/ReturnRequestModal';

const STATUSES = ['all', 'pending', 'approved', 'rejected', 'refunded'];

export default function AdminReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState('');
  const [updating, setUpdating] = useState(null);
  const [noteModal, setNoteModal] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  const load = () => {
    setLoading(true);
    const params = filter !== 'all' ? { status: filter } : {};
    api.get('/returns/admin/all', { params })
      .then(r => setReturns(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const updateStatus = async (id, status, note = '', refund = null) => {
    setUpdating(id);
    try {
      const payload = { status };
      if (note) payload.admin_note = note;
      if (refund != null) payload.refund_amount = Number(refund);
      await api.patch(`/returns/${id}`, payload);
      showToast(`Return ${status}!`);
      setNoteModal(null);
      load();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const openAction = (item, status) => {
    if (status === 'rejected' || status === 'approved') {
      setNoteModal({ item, status });
      setAdminNote(item.admin_note || '');
      setRefundAmount('');
    } else if (status === 'refunded') {
      setNoteModal({ item, status });
      setAdminNote(item.admin_note || '');
      setRefundAmount(String(item.order?.total_price || item.refund_amount || ''));
    } else {
      updateStatus(item._id, status);
    }
  };

  const confirmAction = () => {
    if (!noteModal) return;
    updateStatus(
      noteModal.item._id,
      noteModal.status,
      adminNote,
      noteModal.status === 'refunded' ? refundAmount : null
    );
  };

  if (loading && returns.length === 0) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div>
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 right-6 z-50 bg-green-500/10 border border-green-500/20 text-green-400
                       px-4 py-3 rounded-xl flex items-center gap-2 text-sm shadow-xl">
            <Check size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl">Return Requests</h1>
          <p className="text-zinc-400 text-sm mt-1">Review and process customer returns</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-zinc-500" />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/50"
          >
            {STATUSES.map(s => (
              <option key={s} value={s} className="bg-zinc-900 capitalize">
                {s === 'all' ? 'All Statuses' : s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 text-left">
                <th className="px-5 py-4 font-medium">Return ID</th>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Order</th>
                <th className="px-5 py-4 font-medium">Reason</th>
                <th className="px-5 py-4 font-medium">Amount</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Date</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-zinc-500">
                    <RotateCcw size={24} className="mx-auto mb-2 opacity-40" />
                    No return requests found.
                  </td>
                </tr>
              ) : returns.map(r => (
                <tr key={r._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-mono text-xs text-zinc-400">{r._id.slice(-8)}</td>
                  <td className="px-5 py-4">
                    <p className="text-zinc-200">{r.user?.name}</p>
                    <p className="text-xs text-zinc-500">{r.user?.email}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-gold">
                    #{r.order?._id?.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-5 py-4 text-zinc-400">{REASON_LABELS[r.reason]}</td>
                  <td className="px-5 py-4 text-zinc-300">${r.order?.total_price?.toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${RETURN_STATUS_STYLE[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-zinc-500 text-xs">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    {r.status === 'pending' && (
                      <div className="flex gap-1">
                        <button
                          disabled={updating === r._id}
                          onClick={() => openAction(r, 'approved')}
                          className="px-2 py-1 text-xs rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                        >
                          Approve
                        </button>
                        <button
                          disabled={updating === r._id}
                          onClick={() => openAction(r, 'rejected')}
                          className="px-2 py-1 text-xs rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {r.status === 'approved' && (
                      <button
                        disabled={updating === r._id}
                        onClick={() => openAction(r, 'refunded')}
                        className="px-2 py-1 text-xs rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20"
                      >
                        Mark Refunded
                      </button>
                    )}
                    {(r.status === 'rejected' || r.status === 'refunded') && (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setNoteModal(null)} />
          <div className="relative glass rounded-2xl p-6 w-full max-w-md z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg capitalize">{noteModal.status} Return</h2>
              <button onClick={() => setNoteModal(null)} className="text-zinc-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            {noteModal.status === 'refunded' && (
              <div className="mb-4">
                <label className="block text-xs text-zinc-400 uppercase mb-1.5">Refund Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={refundAmount}
                  onChange={e => setRefundAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-xs text-zinc-400 uppercase mb-1.5">Admin Note</label>
              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                rows={3}
                placeholder="Optional message to customer…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 resize-none"
              />
            </div>
            <button
              onClick={confirmAction}
              disabled={updating}
              className="btn-gold w-full py-3 disabled:opacity-60 capitalize"
            >
              Confirm {noteModal.status}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
