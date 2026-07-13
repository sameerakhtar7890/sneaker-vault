import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Trash2, Users, UserMinus, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const inp = 'input-premium max-w-xs';

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [counts, setCounts] = useState({ active: 0, unsubscribed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/newsletter/admin/subscribers', { params: { status: filter } })
      .then(r => {
        setSubscribers(r.data.subscribers);
        setCounts(r.data.counts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const remove = async id => {
    if (!confirm('Remove this subscriber from the database?')) return;
    setDeleting(id);
    try {
      await api.delete(`/newsletter/admin/subscribers/${id}`);
      load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="section-eyebrow mb-2">MARKETING</p>
          <h1 className="font-display text-3xl flex items-center gap-3">
            <Mail className="text-gold" size={28} />
            Newsletter
          </h1>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className={inp}>
          <option value="all">All statuses</option>
          <option value="active">Active only</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-2xl p-5">
          <Users size={20} className="text-gold mb-2" />
          <p className="text-2xl font-display text-zinc-100">{counts.total}</p>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Total signups</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <Mail size={20} className="text-green-400 mb-2" />
          <p className="text-2xl font-display text-zinc-100">{counts.active}</p>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Active</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <UserMinus size={20} className="text-zinc-500 mb-2" />
          <p className="text-2xl font-display text-zinc-100">{counts.unsubscribed}</p>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Unsubscribed</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gold" size={32} />
        </div>
      ) : subscribers.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-zinc-500">
          No subscribers yet. They will appear when users sign up from the footer.
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-zinc-500 uppercase tracking-wider">
                <th className="p-4">Email</th>
                <th className="p-4">Status</th>
                <th className="p-4">Source</th>
                <th className="p-4">Subscribed</th>
                <th className="p-4 w-16" />
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s, i) => (
                <motion.tr
                  key={s._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-white/5 hover:bg-white/[0.02]"
                >
                  <td className="p-4 text-zinc-200">{s.email}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                      s.status === 'active'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-500 capitalize">{s.source || '—'}</td>
                  <td className="p-4 text-zinc-500">
                    {new Date(s.subscribedAt || s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => remove(s._id)}
                      disabled={deleting === s._id}
                      className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition"
                    >
                      {deleting === s._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
