import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check, AlertCircle, Truck, Globe } from 'lucide-react';
import api from '../../utils/api';

const EMPTY = {
  name: '', countries: '', rateType: 'fixed', baseCost: '0',
  freeShippingThreshold: '0', isDefault: false, isActive: true
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

function formatRate(z) {
  if (z.rateType === 'free') return 'Free';
  if (z.rateType === 'conditional_free') {
    return `$${z.baseCost} (Free over $${z.freeShippingThreshold})`;
  }
  return `$${z.baseCost}`;
}

export default function AdminShippingZones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const load = () => api.get('/shipping-zones').then(r => setZones(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setModal('add'); };
  const openEdit = z => {
    setForm({
      name: z.name,
      countries: z.countries ? z.countries.join(', ') : '',
      rateType: z.rateType,
      baseCost: z.baseCost,
      freeShippingThreshold: z.freeShippingThreshold || 0,
      isDefault: z.isDefault === true,
      isActive: z.isActive !== false
    });
    setEditing(z);
    setError('');
    setModal('edit');
  };

  const handle = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const payload = () => {
    const countriesList = form.countries
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    return {
      name: form.name,
      countries: countriesList,
      rateType: form.rateType,
      baseCost: Number(form.baseCost) || 0,
      freeShippingThreshold: Number(form.freeShippingThreshold) || 0,
      isDefault: form.isDefault,
      isActive: form.isActive
    };
  };

  const save = async () => {
    setError('');
    if (!form.name) {
      setError('Shipping zone name is required.');
      return;
    }
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/shipping-zones', payload());
        showToast('Shipping zone created!');
      } else {
        await api.put(`/shipping-zones/${editing._id}`, payload());
        showToast('Shipping zone updated!');
      }
      setModal(null);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error saving shipping zone.');
    } finally { setSaving(false); }
  };

  const remove = async id => {
    if (!window.confirm('Delete this shipping zone?')) return;
    await api.delete(`/shipping-zones/${id}`);
    showToast('Shipping zone deleted.');
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
          <h1 className="font-display text-3xl">Shipping Zones</h1>
          <p className="text-zinc-400 text-sm mt-1">Configure shipping rates and fallback zones</p>
        </div>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm">
          <Plus size={16} /> New Shipping Zone
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 text-left">
                <th className="px-5 py-4 font-medium">Name</th>
                <th className="px-5 py-4 font-medium">Countries</th>
                <th className="px-5 py-4 font-medium">Rate Type</th>
                <th className="px-5 py-4 font-medium">Rate / Threshold</th>
                <th className="px-5 py-4 font-medium">Default</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-zinc-500">
                    <Truck size={24} className="mx-auto mb-2 opacity-40" />
                    No shipping zones configured yet.
                  </td>
                </tr>
              ) : zones.map(z => (
                <tr key={z._id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                  <td className="px-5 py-4">
                    <span className="font-medium text-zinc-100">{z.name}</span>
                  </td>
                  <td className="px-5 py-4 text-zinc-400 max-w-[200px] truncate" title={z.countries?.join(', ') || 'Rest of the World'}>
                    {z.countries?.length > 0 ? z.countries.join(', ') : <span className="text-zinc-500 italic">Rest of the World</span>}
                  </td>
                  <td className="px-5 py-4 text-zinc-400 capitalize">
                    {z.rateType.replace('_', ' ')}
                  </td>
                  <td className="px-5 py-4 text-zinc-200">
                    {formatRate(z)}
                  </td>
                  <td className="px-5 py-4">
                    {z.isDefault ? (
                      <span className="text-gold border border-gold/30 bg-gold/10 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">
                        Yes
                      </span>
                    ) : (
                      <span className="text-zinc-500 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      z.isActive ? 'bg-green-500/10 text-green-400' : 'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {z.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(z)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-gold transition">
                        <Pencil size={14} />
                      </button>
                      {!z.isDefault && (
                        <button onClick={() => remove(z._id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Create Shipping Zone' : 'Edit Shipping Zone'} onClose={() => setModal(null)}>
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <Field label="Zone Name">
              <input name="name" value={form.name} onChange={handle} placeholder="e.g. Domestic, Europe..."
                className={inp} />
            </Field>

            {!form.isDefault && (
              <Field label="Countries (comma-separated)">
                <input name="countries" value={form.countries} onChange={handle}
                  placeholder="e.g. US, United States, Canada, CA" className={inp} />
                <p className="text-[10px] text-zinc-500 mt-1">Country codes or names matching user input at checkout.</p>
              </Field>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Rate Type">
                <select name="rateType" value={form.rateType} onChange={handle} className={inp}>
                  <option value="fixed">Fixed Rate</option>
                  <option value="free">Free Shipping</option>
                  <option value="conditional_free">Free Above Threshold</option>
                </select>
              </Field>

              {form.rateType !== 'free' && (
                <Field label="Base Cost ($)">
                  <input name="baseCost" type="number" min="0" step="0.01"
                    value={form.baseCost} onChange={handle} className={inp} />
                </Field>
              )}
            </div>

            {form.rateType === 'conditional_free' && (
              <Field label="Free Shipping Threshold ($)">
                <input name="freeShippingThreshold" type="number" min="0" step="0.01"
                  value={form.freeShippingThreshold} onChange={handle} className={inp} />
              </Field>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handle}
                  disabled={editing?.isDefault}
                  className="rounded border-white/20 accent-gold" />
                Set as Default Fallback Zone (no countries list needed)
              </label>

              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handle}
                  className="rounded border-white/20 accent-gold" />
                Active (apply rates at checkout)
              </label>
            </div>

            <button onClick={save} disabled={saving}
              className="btn-gold w-full py-3 disabled:opacity-60">
              {saving ? 'Saving…' : modal === 'add' ? 'Create Zone' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
