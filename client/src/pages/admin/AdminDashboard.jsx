import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, DollarSign, Users } from 'lucide-react';
import api from '../../utils/api';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs text-zinc-500 tracking-widest uppercase">{label}</p>
        <p className="font-display text-2xl mt-0.5">{value}</p>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/orders'),
      api.get('/products'),
      api.get('/auth/users')
    ]).then(res => {
      const orders = res[0].data;
      const products = res[1].data.products || res[1].data;
      const users = res[2].data;
      
      const rev = orders.filter(o => o.payment_status === 'paid').reduce((acc, o) => acc + o.total_price, 0);
      
      setStats({
        revenue: rev,
        orders: orders.length,
        products: products.length
      });
      setRecentOrders(orders.slice(0, 5));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColor = s => ({
    created:    'text-zinc-400 bg-zinc-400/10',
    processing: 'text-blue-400 bg-blue-400/10',
    shipped:    'text-purple-400 bg-purple-400/10',
    delivered:  'text-green-400 bg-green-400/10',
    cancelled:  'text-red-400 bg-red-400/10',
  }[s] || 'text-zinc-400 bg-zinc-400/10');

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard icon={Package}     label="Products" value={stats.products} color="bg-gold/10 text-gold" />
        <StatCard icon={ShoppingBag} label="Orders"   value={stats.orders}   color="bg-blue-400/10 text-blue-400" />
        <StatCard icon={DollarSign}  label="Revenue"  value={`$${stats.revenue.toLocaleString()}`} color="bg-green-400/10 text-green-400" />
      </div>

      {/* Recent Orders */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
