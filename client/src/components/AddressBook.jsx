import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Pencil, Trash2, Star, X, AlertCircle, Check } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { EMPTY_ADDRESS_FORM } from '../utils/addressUtils';

const inp = 'input-premium w-full';

export default function AddressBook() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_ADDRESS_FORM, fullName: user?.name || '' });
  const [deleteId, setDeleteId] = useState(null);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = () => {
    setLoading(true);
    api.get('/addresses')
      .then(r => setAddresses(r.data))
      .catch(() => setError('Could not load addresses'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_ADDRESS_FORM,
      fullName: user?.name || '',
      isDefault: addresses.length === 0
    });
    setError('');
    setFormOpen(true);
  };

  const openEdit = addr => {
    setEditingId(addr._id);
    setForm({
      label: addr.label,
      fullName: addr.fullName,
      address: addr.address,
      city: addr.city,
      postalCode: addr.postalCode,
      country: addr.country || 'US',
      isDefault: addr.isDefault
    });
    setError('');
    setFormOpen(true);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/addresses/${editingId}`, form);
        showToast('Address updated');
      } else {
        await api.post('/addresses', form);
        showToast('Address saved');
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const remove = async id => {
    try {
      await api.delete(`/addresses/${id}`);
      showToast('Address removed');
      setDeleteId(null);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not delete address');
      setDeleteId(null);
    }
  };

  const setDefault = async id => {
    try {
      await api.patch(`/addresses/${id}/default`);
      showToast('Default address updated');
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not set default');
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400
                       px-4 py-3 rounded-xl text-sm"
          >
            <Check size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400">Save multiple shipping addresses for faster checkout.</p>
          <p className="text-xs text-zinc-500 mt-1">{addresses.length} / 10 addresses</p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          disabled={addresses.length >= 10}
          className="btn-gold text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={16} /> Add Address
        </button>
      </div>

      {error && !formOpen && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <MapPin size={40} className="mx-auto text-zinc-600 mb-4" />
          <h3 className="font-display text-xl mb-2">No saved addresses</h3>
          <p className="text-zinc-500 text-sm mb-6">Add your first shipping address to speed up checkout.</p>
          <button type="button" onClick={openAdd} className="btn-gold">Add Address</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr, i) => (
            <motion.div
              key={addr._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass rounded-2xl p-5 relative ${addr.isDefault ? 'border-gold/30' : ''}`}
            >
              {addr.isDefault && (
                <span className="absolute top-4 right-4 text-[10px] uppercase tracking-wider px-2 py-0.5
                                 rounded-full bg-gold/15 text-gold border border-gold/25 font-semibold">
                  Default
                </span>
              )}
              <p className="font-medium text-zinc-100 flex items-center gap-2">
                <MapPin size={14} className="text-gold shrink-0" />
                {addr.label}
              </p>
              <p className="text-sm text-zinc-300 mt-2">{addr.fullName}</p>
              <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                {addr.address}<br />
                {addr.city}, {addr.postalCode}<br />
                {addr.country || 'US'}
              </p>
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => setDefault(addr._id)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-white/15 text-zinc-400
                               hover:border-gold/30 hover:text-gold transition flex items-center gap-1"
                  >
                    <Star size={12} /> Set default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openEdit(addr)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-white/15 text-zinc-400
                             hover:text-gold hover:border-gold/30 transition flex items-center gap-1"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(addr._id)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-white/15 text-zinc-400
                             hover:text-red-400 hover:border-red-500/30 transition flex items-center gap-1"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => !saving && setFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              onClick={e => e.stopPropagation()}
              className="glass-strong rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-card"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl">
                  {editingId ? 'Edit Address' : 'Add Address'}
                </h3>
                <button type="button" onClick={() => setFormOpen(false)} className="p-2 rounded-full hover:bg-white/10">
                  <X size={18} />
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-red-400 text-sm">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400 uppercase mb-1.5">Label</label>
                  <input name="label" value={form.label} onChange={handleChange} placeholder="Home, Work…" className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 uppercase mb-1.5">Full Name</label>
                  <input name="fullName" value={form.fullName} onChange={handleChange} required className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 uppercase mb-1.5">Street Address</label>
                  <input name="address" value={form.address} onChange={handleChange} required className={inp} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 uppercase mb-1.5">City</label>
                    <input name="city" value={form.city} onChange={handleChange} required className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 uppercase mb-1.5">Postal Code</label>
                    <input name="postalCode" value={form.postalCode} onChange={handleChange} required className={inp} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 uppercase mb-1.5">Country</label>
                  <input name="country" value={form.country} onChange={handleChange} required className={inp} />
                </div>
                <label className="flex items-center gap-3 cursor-pointer pt-2">
                  <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange} className="accent-gold" />
                  <span className="text-sm text-zinc-300">Set as default shipping address</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setFormOpen(false)} className="btn-ghost flex-1 py-2.5 text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="btn-gold flex-1 py-2.5 text-sm disabled:opacity-60">
                    {saving ? 'Saving…' : editingId ? 'Update' : 'Save Address'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="glass-strong rounded-2xl p-6 w-full max-w-sm text-center"
            >
              <Trash2 size={32} className="mx-auto text-red-400/80 mb-4" />
              <h3 className="font-display text-lg mb-2">Delete this address?</h3>
              <p className="text-sm text-zinc-500 mb-6">This cannot be undone.</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setDeleteId(null)} className="btn-ghost flex-1 py-2.5 text-sm">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => remove(deleteId)}
                  className="flex-1 py-2.5 text-sm rounded-full bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
