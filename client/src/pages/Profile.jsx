import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Check, Package, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'orders'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  const [form, setForm] = useState({ name: user?.name || '', password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (activeTab === 'orders' && orders.length === 0) {
      setLoadingOrders(true);
      api.get('/orders/mine')
        .then(r => setOrders(r.data))
        .catch(console.error)
        .finally(() => setLoadingOrders(false));
    }
  }, [activeTab, orders.length]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const updateProfile = async e => {
    e.preventDefault();
    setError('');
    if (form.password && form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      const payload = { name: form.name };
      if (form.password) payload.password = form.password;
      
      const res = await api.put('/auth/profile', payload);
      // The context automatically updates based on localStorage token changes if needed, 
      // but we can just show success here.
      localStorage.setItem('sv_token', res.data.token);
      showToast('Profile updated successfully');
      setForm(f => ({ ...f, password: '', confirm: '' }));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const statusColor = s => ({
    created:    'text-zinc-400 bg-zinc-400/10',
    processing: 'text-blue-400 bg-blue-400/10',
    shipped:    'text-purple-400 bg-purple-400/10',
    delivered:  'text-green-400 bg-green-400/10',
    cancelled:  'text-red-400 bg-red-400/10',
  }[s] || 'text-zinc-400 bg-zinc-400/10');

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-20 right-6 z-50 bg-green-500/10 border border-green-500/20 text-green-400
                       px-4 py-3 rounded-xl flex items-center gap-2 text-sm shadow-xl">
            <Check size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-gold tracking-[0.3em] text-xs mb-2">YOUR ACCOUNT</p>
          <h1 className="font-display text-4xl">Hello, {user?.name}</h1>
        </div>
      </div>

      <div className="flex gap-4 mb-8 border-b border-white/10 pb-1">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`pb-2 text-sm font-medium tracking-wide transition border-b-2 ${
            activeTab === 'settings' ? 'border-gold text-gold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}>
          Profile Settings
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`pb-2 text-sm font-medium tracking-wide transition border-b-2 ${
            activeTab === 'orders' ? 'border-gold text-gold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}>
          Order History
        </button>
      </div>

      {activeTab === 'settings' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-8 max-w-lg">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={updateProfile} className="space-y-5">
            <div>
              <label className="block text-xs text-zinc-400 tracking-widest uppercase mb-2">Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input type="text" name="name" value={form.name} onChange={handle} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 tracking-widest uppercase mb-2">Email Address</label>
              <input type="email" value={user?.email || ''} disabled
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-500 cursor-not-allowed" />
              <p className="text-xs text-zinc-500 mt-1">Email cannot be changed.</p>
            </div>
            
            <div className="pt-4 border-t border-white/5">
              <h3 className="text-sm font-medium text-zinc-200 mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400 tracking-widest uppercase mb-2">New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input type="password" name="password" value={form.password} onChange={handle} placeholder="Leave blank to keep current"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition placeholder-zinc-600" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 tracking-widest uppercase mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input type="password" name="confirm" value={form.confirm} onChange={handle} placeholder="Leave blank to keep current"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition placeholder-zinc-600" />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-gold w-full mt-4 disabled:opacity-60">
              {saving ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </motion.div>
      )}

      {activeTab === 'orders' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {loadingOrders ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Package size={48} className="mx-auto text-zinc-600 mb-4" />
              <p className="text-zinc-400">You haven't placed any orders yet.</p>
              <Link to="/shop" className="text-gold hover:text-gold-soft transition mt-2 inline-block">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order._id} className="glass rounded-2xl p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">Order ID</p>
                      <p className="font-mono text-zinc-300 text-sm mt-1">{order._id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">Date</p>
                      <p className="text-zinc-300 text-sm mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Amount</p>
                      <p className="text-gold font-semibold mt-1">${order.total_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Status</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div>
                      <Link to={`/order/${order._id}`} className="btn-gold px-4 py-2 text-xs">
                        Track Order
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.cart_items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-ink-900 overflow-hidden shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-zinc-200">{item.name}</p>
                          <p className="text-sm text-zinc-500">Size: {item.size} | Qty: {item.qty}</p>
                        </div>
                        <p className="font-medium text-zinc-300">${(item.price * item.qty).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
