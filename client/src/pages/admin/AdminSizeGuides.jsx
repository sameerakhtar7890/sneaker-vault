import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check, AlertCircle, Ruler } from 'lucide-react';
import api from '../../utils/api';

const EMPTY_ROW = { us: '', uk: '', eu: '', cm: '' };

const EMPTY = {
  name: '', brand: '', gender: 'unisex', fitTips: '',
  isDefault: false, isActive: true,
  rows: [
    { us: '8', uk: '7', eu: '41', cm: '26' },
    { us: '9', uk: '8', eu: '42.5', cm: '27' },
    { us: '10', uk: '9', eu: '44', cm: '28' },
    { us: '11', uk: '10', eu: '45', cm: '29' },
    { us: '12', uk: '11', eu: '46', cm: '30' }
  ]
};

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">
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

export default function AdminSizeGuides() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const load = () => api.get('/size-guides').then(r => setGuides(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setModal('add'); };
  const openEdit = g => {
    setForm({
      name: g.name,
      brand: g.brand || '',
      gender: g.gender || 'unisex',
      fitTips: g.fitTips || '',
      isDefault: g.isDefault || false,
      isActive: g.isActive !== false,
      rows: g.rows?.length ? g.rows.map(r => ({ ...r })) : [{ ...EMPTY_ROW }]
    });
    setEditing(g);
    setError('');
    setModal('edit');
  };

  const handle = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const updateRow = (idx, field, value) => {
    setForm(f => ({
      ...f,
      rows: f.rows.map((r, i) => i === idx ? { ...r, [field]: value } : r)
    }));
  };

  const addRow = () => setForm(f => ({ ...f, rows: [...f.rows, { ...EMPTY_ROW }] }));
  const removeRow = idx => setForm(f => ({ ...f, rows: f.rows.filter((_, i) => i !== idx) }));

  const payload = () => ({
    name: form.name,
    brand: form.brand || null,
    gender: form.gender,
    fitTips: form.fitTips,
    isDefault: form.isDefault,
    isActive: form.isActive,
    rows: form.rows.filter(r => r.us.trim())
  });

  const save = async () => {
    setError('');
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.rows.some(r => r.us.trim())) { setError('Add at least one size row.'); return; }
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/size-guides', payload());
        showToast('Size guide created!');
      } else {
        await api.put(`/size-guides/${editing._id}`, payload());
        showToast('Size guide updated!');
      }
      setModal(null);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error saving size guide.');
    } finally { setSaving(false); }
  };

  const remove = async id => {
    if (!window.confirm('Delete this size guide?')) return;
    try {
      await api.delete(`/size-guides/${id}`);
      showToast('Size guide deleted.');
      load();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not delete.');
    }
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
          <h1 className="font-display text-3xl">Size Guides</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage size charts shown during product selection</p>
        </div>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm">
          <Plus size={16} /> New Guide
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 text-left">
                <th className="px-5 py-4 font-medium">Name</th>
                <th className="px-5 py-4 font-medium">Brand</th>
                <th className="px-5 py-4 font-medium">Rows</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guides.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-zinc-500">
                    <Ruler size={24} className="mx-auto mb-2 opacity-40" />
                    No size guides yet.
                  </td>
                </tr>
              ) : guides.map(g => (
                <tr key={g._id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                  <td className="px-5 py-4">
                    <span className="text-zinc-200">{g.name}</span>
                    {g.isDefault && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-gold/10 text-gold uppercase">Default</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-zinc-400">{g.brand || 'All brands'}</td>
                  <td className="px-5 py-4 text-zinc-400">{g.rows?.length || 0} sizes</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      g.isActive ? 'bg-green-500/10 text-green-400' : 'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {g.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(g)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-gold transition">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => remove(g._id)}
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
        <Modal title={modal === 'add' ? 'Create Size Guide' : 'Edit Size Guide'} onClose={() => setModal(null)}>
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Guide Name">
                <input name="name" value={form.name} onChange={handle} placeholder="Men's Standard" className={inp} />
              </Field>
              <Field label="Brand (optional)">
                <input name="brand" value={form.brand} onChange={handle} placeholder="Nike — leave blank for default" className={inp} />
              </Field>
            </div>
            <Field label="Gender">
              <select name="gender" value={form.gender} onChange={handle} className={inp}>
                <option value="unisex">Unisex</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
              </select>
            </Field>
            <Field label="Fit Tips">
              <textarea name="fitTips" value={form.fitTips} onChange={handle} rows={2}
                placeholder="Nike sneakers tend to run half a size small…" className={`${inp} resize-none`} />
            </Field>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-zinc-400 tracking-widest uppercase">Size Rows</label>
                <button type="button" onClick={addRow}
                  className="text-xs text-gold hover:text-gold/80 flex items-center gap-1">
                  <Plus size={12} /> Add Row
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_32px] gap-2 text-[10px] text-zinc-500 uppercase px-1">
                  <span>US</span><span>UK</span><span>EU</span><span>CM</span><span />
                </div>
                {form.rows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_1fr_1fr_32px] gap-2">
                    <input value={row.us} onChange={e => updateRow(idx, 'us', e.target.value)}
                      placeholder="10" className={`${inp} py-2`} />
                    <input value={row.uk} onChange={e => updateRow(idx, 'uk', e.target.value)}
                      placeholder="9" className={`${inp} py-2`} />
                    <input value={row.eu} onChange={e => updateRow(idx, 'eu', e.target.value)}
                      placeholder="44" className={`${inp} py-2`} />
                    <input value={row.cm} onChange={e => updateRow(idx, 'cm', e.target.value)}
                      placeholder="28" className={`${inp} py-2`} />
                    <button type="button" onClick={() => removeRow(idx)}
                      disabled={form.rows.length <= 1}
                      className="flex items-center justify-center rounded-xl hover:bg-red-500/10 text-zinc-500 hover:text-red-400 disabled:opacity-30">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handle} />
                Default fallback guide
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handle} />
                Active
              </label>
            </div>

            <button onClick={save} disabled={saving} className="btn-gold w-full py-3 disabled:opacity-60">
              {saving ? 'Saving…' : modal === 'add' ? 'Create Guide' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
