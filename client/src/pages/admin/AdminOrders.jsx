import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Download, Filter, X } from 'lucide-react';
import api from '../../utils/api';

const ORDER_STATUSES   = ['created', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed'];

const statusColor = s => ({
  created:    'text-zinc-400 bg-zinc-400/10',
  processing: 'text-blue-400 bg-blue-400/10',
  shipped:    'text-purple-400 bg-purple-400/10',
  delivered:  'text-green-400 bg-green-400/10',
  cancelled:  'text-red-400 bg-red-400/10',
}[s] || 'text-zinc-400 bg-zinc-400/10');

const payColor = s => s === 'paid'
  ? 'text-green-400 bg-green-400/10'
  : s === 'failed'
    ? 'text-red-400 bg-red-400/10'
    : 'text-zinc-400 bg-zinc-400/10';

const inp = 'bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold/50 transition text-zinc-200';

export default function AdminOrders() {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [toast,       setToast]       = useState('');
  const [exporting,   setExporting]   = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Export filter state
  const [exportFilters, setExportFilters] = useState({
    from: '', to: '', status: '', payment_status: ''
  });

  const load = () =>
    api.get('/orders/admin/all')
       .then(r => setOrders(r.data))
       .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const updateStatus = async (id, field, value) => {
    await api.patch(`/orders/${id}/status`, { [field]: value });
    setOrders(prev => prev.map(o => o._id === id ? { ...o, [field]: value } : o));
    showToast('Order updated!');
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (exportFilters.from)           params.set('from',           exportFilters.from);
      if (exportFilters.to)             params.set('to',             exportFilters.to);
      if (exportFilters.status)         params.set('status',         exportFilters.status);
      if (exportFilters.payment_status) params.set('payment_status', exportFilters.payment_status);

      const qs = params.toString();
      const url = `/orders/admin/export${qs ? `?${qs}` : ''}`;

      const res = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const href = URL.createObjectURL(blob);
      const today = new Date().toISOString().slice(0, 10);
      const a = document.createElement('a');
      a.href = href;
      a.download = `sneaker-vault-orders-${today}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(href);
      showToast('CSV downloaded!');
    } catch (err) {
      showToast('Export failed — please try again');
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => setExportFilters({ from: '', to: '', status: '', payment_status: '' });
  const hasFilters = Object.values(exportFilters).some(Boolean);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 right-6 z-50 bg-green-500/10 border border-green-500/20 text-green-400
                       px-4 py-3 rounded-xl flex items-center gap-2 text-sm shadow-xl">
            <Check size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl">Orders</h1>
          <p className="text-sm text-zinc-400 mt-1">{orders.length} total orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition
              ${showFilters
                ? 'bg-gold/15 text-gold border-gold/30'
                : 'bg-white/5 text-zinc-300 border-white/10 hover:border-gold/30 hover:text-gold'
              }`}
          >
            <Filter size={15} />
            Filter Export
            {hasFilters && (
              <span className="bg-gold text-ink-950 text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ml-1">
                {Object.values(exportFilters).filter(Boolean).length}
              </span>
            )}
          </button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleExportCSV}
            disabled={exporting}
            className="btn-gold flex items-center gap-2 disabled:opacity-60"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-ink-950/40 border-t-ink-950 animate-spin" />
                Exporting…
              </>
            ) : (
              <>
                <Download size={15} />
                Export CSV
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Export Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-zinc-300 tracking-wide uppercase text-[11px] tracking-widest">Export Filters</p>
                {hasFilters && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition">
                    <X size={12} /> Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">From Date</label>
                  <input
                    type="date"
                    value={exportFilters.from}
                    onChange={e => setExportFilters(f => ({ ...f, from: e.target.value }))}
                    className={inp}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">To Date</label>
                  <input
                    type="date"
                    value={exportFilters.to}
                    onChange={e => setExportFilters(f => ({ ...f, to: e.target.value }))}
                    className={inp}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Order Status</label>
                  <select
                    value={exportFilters.status}
                    onChange={e => setExportFilters(f => ({ ...f, status: e.target.value }))}
                    className={`${inp} cursor-pointer`}
                  >
                    <option value="">All statuses</option>
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Payment Status</label>
                  <select
                    value={exportFilters.payment_status}
                    onChange={e => setExportFilters(f => ({ ...f, payment_status: e.target.value }))}
                    className={`${inp} cursor-pointer`}
                  >
                    <option value="">All payments</option>
                    {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-zinc-600 mt-3">
                Filters apply only to the exported CSV, not to the table below.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 text-left">
                <th className="px-5 py-4 font-medium">Order ID</th>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Items</th>
                <th className="px-5 py-4 font-medium">Total</th>
                <th className="px-5 py-4 font-medium">Payment</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map(o => (
                <tr key={o._id} className="hover:bg-white/3 transition">
                  <td className="px-5 py-4 font-mono text-xs text-zinc-400">{o._id.slice(-8)}</td>
                  <td className="px-5 py-4">
                    <p className="text-zinc-100">{o.user_id?.name || (o.is_guest ? 'Guest' : '—')}</p>
                    <p className="text-zinc-500 text-xs">{o.confirmation_email || o.user_id?.email || ''}</p>
                  </td>
                  <td className="px-5 py-4 text-zinc-300">{o.cart_items?.length || 0} item(s)</td>
                  <td className="px-5 py-4 text-gold font-semibold">${o.total_price?.toFixed(2)}</td>

                  {/* Payment status dropdown */}
                  <td className="px-5 py-4">
                    <select
                      value={o.payment_status}
                      onChange={e => updateStatus(o._id, 'payment_status', e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer
                                  bg-transparent focus:outline-none ${payColor(o.payment_status)}`}
                    >
                      {PAYMENT_STATUSES.map(s => <option key={s} value={s} className="bg-ink-950 text-zinc-100">{s}</option>)}
                    </select>
                  </td>

                  {/* Order status dropdown */}
                  <td className="px-5 py-4">
                    <select
                      value={o.status}
                      onChange={e => updateStatus(o._id, 'status', e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer
                                  bg-transparent focus:outline-none ${statusColor(o.status)}`}
                    >
                      {ORDER_STATUSES.map(s => <option key={s} value={s} className="bg-ink-950 text-zinc-100">{s}</option>)}
                    </select>
                  </td>

                  <td className="px-5 py-4 text-zinc-500 text-xs">
                    {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="text-center py-12 text-zinc-500">No orders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
