import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check, AlertCircle, Tag } from 'lucide-react';
import api from '../../utils/api';

const EMPTY = {
  code: '', description: '', discountType: 'percent', discountValue: '',
  minOrderAmount: '0', maxDiscount: '', expiresAt: '', usageLimit: '', isActive: true
};

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition">
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-zinc-400 tracking-widest uppercase mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inp = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition placeholder-zinc-600";

function formatDiscount(c) {
  return c.discountType === 'percent'
    ? `${c.discountValue}%`
    : `$${c.discountValue}`;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const load = () => api.get('/coupons').then(r => setCoupons(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setModal('add'); };
  const openEdit = c => {
    setForm({
      code: c.code,
      description: c.description || '',
      discountType: c.discountType,
      discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || 0,
      maxDiscount: c.maxDiscount ?? '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
      usageLimit: c.usageLimit ?? '',
      isActive: c.isActive !== false
    });
    setEditing(c);
    setError('');
    setModal('edit');
  };

  const handle = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const payload = () => ({
    code: form.code,
    description: form.description,
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    minOrderAmount: Number(form.minOrderAmount) || 0,
    maxDiscount: form.maxDiscount !== '' ? Number(form.maxDiscount) : null,
    expiresAt: form.expiresAt || null,
    usageLimit: form.usageLimit !== '' ? Number(form.usageLimit) : null,
    isActive: form.isActive
  });

  const save = async () => {
    setError('');
    if (!form.code || !form.discountValue) {
      setError('Code and discount value are required.');
      return;
    }
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/coupons', payload());
        showToast('Coupon created!');
      } else {
        await api.put(`/coupons/${editing._id}`, payload());
        showToast('Coupon updated!');
      }
      setModal(null);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error saving coupon.');
    } finally { setSaving(false); }
  };

  const remove = async id => {
    if (!window.confirm('Delete this coupon?')) return;
    await api.delete(`/coupons/${id}`);
    showToast('Coupon deleted.');
    load();
  };

  if (loading) return (
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

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl">Coupons</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage promo codes for checkout discounts</p>
        </div>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm">
          <Plus size={16} /> New Coupon
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 text-left">
                <th className="px-5 py-4 font-medium">Code</th>
                <th className="px-5 py-4 font-medium">Discount</th>
                <th className="px-5 py-4 font-medium">Min Order</th>
                <th className="px-5 py-4 font-medium">Usage</th>
                <th className="px-5 py-4 font-medium">Expires</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-zinc-500">
                    <Tag size={24} className="mx-auto mb-2 opacity-40" />
                    No coupons yet. Create your first promo code.
                  </td>
                </tr>
              ) : coupons.map(c => (
                <tr key={c._id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                  <td className="px-5 py-4">
                    <span className="font-mono text-gold">{c.code}</span>
                    {c.description && <p className="text-xs text-zinc-500 mt-0.5">{c.description}</p>}
                  </td>
                  <td className="px-5 py-4">
                    {formatDiscount(c)}
                    {c.maxDiscount != null && c.discountType === 'percent' && (
                      <span className="text-zinc-500 text-xs block">max ${c.maxDiscount}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-zinc-400">
                    {c.minOrderAmount > 0 ? `$${c.minOrderAmount}` : '—'}
                  </td>
                  <td className="px-5 py-4 text-zinc-400">
                    {c.usedCount}{c.usageLimit != null ? ` / ${c.usageLimit}` : ''}
                  </td>
                  <td className="px-5 py-4 text-zinc-400">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      c.isActive ? 'bg-green-500/10 text-green-400' : 'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-gold transition">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => remove(c._id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Create Coupon' : 'Edit Coupon'} onClose={() => setModal(null)}>
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <Field label="Promo Code">
              <input name="code" value={form.code} onChange={handle} placeholder="WELCOME10"
                className={`${inp} uppercase`} />
            </Field>
            <Field label="Description (optional)">
              <input name="description" value={form.description} onChange={handle}
                placeholder="10% off for new customers" className={inp} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Discount Type">
                <select name="discountType" value={form.discountType} onChange={handle} className={inp}>
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </Field>
              <Field label="Discount Value">
                <input name="discountValue" type="number" min="0" step="0.01"
                  value={form.discountValue} onChange={handle} placeholder="10" className={inp} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Min Order ($)">
                <input name="minOrderAmount" type="number" min="0" step="0.01"
                  value={form.minOrderAmount} onChange={handle} className={inp} />
              </Field>
              <Field label="Max Discount ($)">
                <input name="maxDiscount" type="number" min="0" step="0.01"
                  value={form.maxDiscount} onChange={handle}
                  placeholder="For % only" className={inp} disabled={form.discountType !== 'percent'} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Expires On">
                <input name="expiresAt" type="date" value={form.expiresAt} onChange={handle} className={inp} />
              </Field>
              <Field label="Usage Limit">
                <input name="usageLimit" type="number" min="1"
                  value={form.usageLimit} onChange={handle} placeholder="Unlimited" className={inp} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handle}
                className="rounded border-white/20" />
              Active (can be used at checkout)
            </label>
            <button onClick={save} disabled={saving}
              className="btn-gold w-full py-3 disabled:opacity-60">
              {saving ? 'Saving…' : modal === 'add' ? 'Create Coupon' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
