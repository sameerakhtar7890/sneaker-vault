import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
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

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState('');

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

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Orders</h1>
        <span className="text-sm text-zinc-400">{orders.length} total orders</span>
      </div>

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
                    <p className="text-zinc-100">{o.user_id?.name || '—'}</p>
                    <p className="text-zinc-500 text-xs">{o.user_id?.email || ''}</p>
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
