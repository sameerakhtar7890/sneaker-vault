import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, DollarSign, Users, TrendingUp, AlertTriangle, Check, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import AdminSalesCharts from './AdminSalesCharts';
import SneakerLoader from '../../components/SneakerLoader';

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs text-zinc-500 tracking-widest uppercase">{label}</p>
        <p className="font-display text-2xl mt-0.5">{value}</p>
        {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restockValues, setRestockValues] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    api.get('/analytics/overview')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRestock = async (productId, currentProduct, newStock) => {
    if (newStock === undefined || newStock === '') return;
    setUpdatingId(productId);
    try {
      await api.put(`/products/${productId}`, {
        ...currentProduct,
        stock: Number(newStock)
      });
      const r = await api.get('/analytics/overview');
      setData(r.data);
      // Clear input state for this product
      setRestockValues(prev => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
    } catch (err) {
      console.error(err);
      alert('Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusColor = s => ({
    created:    'text-zinc-400 bg-zinc-400/10',
    processing: 'text-blue-400 bg-blue-400/10',
    shipped:    'text-purple-400 bg-purple-400/10',
    delivered:  'text-green-400 bg-green-400/10',
    cancelled:  'text-red-400 bg-red-400/10',
  }[s] || 'text-zinc-400 bg-zinc-400/10');

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <SneakerLoader size={64} />
    </div>
  );

  const { stats, statusBreakdown, paymentBreakdown, topProducts, recentOrders, lowStockProducts } = data || {};

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Dashboard</h1>

      {/* Low Stock Alert Banner */}
      {stats?.lowStockCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-200 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="font-semibold text-sm">Low Stock Alert</p>
              <p className="text-xs text-amber-300/80">There are {stats.lowStockCount} products with stock levels at or below 5.</p>
            </div>
          </div>
          <button
            onClick={() => {
              document.getElementById('low-stock-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 transition text-amber-200"
          >
            Review & Restock
          </button>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`$${(stats?.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={`$${(stats?.monthRevenue || 0).toFixed(2)} this month`}
          color="bg-green-400/10 text-green-400"
        />
        <StatCard
          icon={ShoppingBag}
          label="Orders"
          value={stats?.orders || 0}
          sub={`${stats?.paidOrders || 0} paid`}
          color="bg-blue-400/10 text-blue-400"
        />
        <StatCard icon={Package} label="Products" value={stats?.products || 0} color="bg-gold/10 text-gold" />
        <StatCard icon={Users} label="Customers" value={stats?.users || 0} color="bg-purple-400/10 text-purple-400" />
      </div>

      <AdminSalesCharts
        statusBreakdown={statusBreakdown}
        paymentBreakdown={paymentBreakdown}
        topProducts={topProducts}
      />

      <div className="grid lg:grid-cols-2 gap-6 mt-10">
        {/* Recent Orders */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-gold" />
            <h2 className="font-display text-xl">Recent Orders</h2>
          </div>
          {!recentOrders?.length ? (
            <p className="text-zinc-500 text-sm">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 text-left">
                    <th className="pb-3 font-medium">Order ID</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Payment</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentOrders.map(o => (
                    <tr key={o._id}>
                      <td className="py-3 text-zinc-400 font-mono text-xs">{o._id.slice(-8)}</td>
                      <td className="py-3 text-zinc-200">{o.user_id?.name || '—'}</td>
                      <td className="py-3 text-gold font-semibold">${o.total_price?.toFixed(2)}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          o.payment_status === 'paid' ? 'text-green-400 bg-green-400/10' : 'text-zinc-400 bg-zinc-400/10'
                        }`}>
                          {o.payment_status}
                        </span>
                      </td>
                      <td className="py-3 text-zinc-500 text-xs">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div id="low-stock-section" className="glass rounded-2xl p-6 scroll-mt-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="font-display text-xl">Low Stock Alerts (Stock ≤ 5)</h2>
          </div>
          {!lowStockProducts?.length ? (
            <p className="text-zinc-500 text-sm">All products are sufficiently stocked.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 text-left">
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium text-center">Stock</th>
                    <th className="pb-3 font-medium text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {lowStockProducts.map(p => {
                    const currentVal = restockValues[p._id] !== undefined ? restockValues[p._id] : p.stock;
                    const isChanged = Number(currentVal) !== p.stock;
                    return (
                      <tr key={p._id}>
                        <td className="py-3 flex items-center gap-3">
                          <img src={p.images?.[0]} alt={p.name} className="w-8 h-8 rounded-lg object-cover bg-ink-900" />
                          <div>
                            <p className="text-zinc-200 font-medium leading-tight">{p.name}</p>
                            <p className="text-[10px] text-zinc-500 leading-none mt-0.5">{p.brand}</p>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            p.stock === 0
                              ? 'text-red-400 bg-red-400/10 border border-red-500/20'
                              : 'text-amber-400 bg-amber-400/10 border border-amber-500/20'
                          }`}>
                            {p.stock} left
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center text-xs focus:outline-none focus:border-gold/50 text-zinc-100"
                              value={currentVal}
                              onChange={e => setRestockValues({ ...restockValues, [p._id]: e.target.value })}
                              disabled={updatingId === p._id}
                            />
                            <button
                              onClick={() => handleRestock(p._id, p, currentVal)}
                              disabled={!isChanged || updatingId === p._id}
                              className={`p-1.5 rounded-lg border text-xs transition flex items-center justify-center ${
                                isChanged
                                  ? 'bg-gold/20 text-gold border-gold/30 hover:bg-gold/30'
                                  : 'bg-white/5 text-zinc-500 border-white/5 cursor-not-allowed'
                              }`}
                              title="Update stock level"
                            >
                              {updatingId === p._id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Check size={12} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

