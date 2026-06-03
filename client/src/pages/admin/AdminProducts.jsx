import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const EMPTY = {
  name: '', brand: '', price: '', description: '',
  images: '', sizes: '', stock: '', featured: false
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

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null); // null | 'add' | 'edit'
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [toast,    setToast]    = useState('');

  const load = () => api.get('/products?limit=100').then(r => setProducts(r.data.products || r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openAdd = () => { setForm(EMPTY); setEditing(null); setError(''); setModal('add'); };
  const openEdit = p => {
    setForm({
      name: p.name, brand: p.brand, price: p.price,
      description: p.description || '',
      images: (p.images || []).join(', '),
      sizes:  (p.sizes  || []).join(', '),
      stock:  p.stock, featured: p.featured || false
    });
    setEditing(p);
    setError('');
    setModal('edit');
  };

  const handle = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const payload = () => ({
    name:        form.name,
    brand:       form.brand,
    price:       Number(form.price),
    description: form.description,
    images:      form.images.split(',').map(s => s.trim()).filter(Boolean),
    sizes:       form.sizes.split(',').map(s => Number(s.trim())).filter(Boolean),
    stock:       Number(form.stock),
    featured:    form.featured,
  });

  const save = async () => {
    setError('');
    if (!form.name || !form.brand || !form.price) { setError('Name, brand and price are required.'); return; }
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/products', payload());
        showToast('Product added!');
      } else {
        await api.put(`/products/${editing._id}`, payload());
        showToast('Product updated!');
      }
      setModal(null);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Error saving product.');
    } finally { setSaving(false); }
  };

  const remove = async id => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    showToast('Product deleted.');
    load();
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
        <h1 className="font-display text-3xl">Products</h1>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 text-left">
                <th className="px-5 py-4 font-medium">Product</th>
                <th className="px-5 py-4 font-medium">Brand</th>
                <th className="px-5 py-4 font-medium">Price</th>
                <th className="px-5 py-4 font-medium">Stock</th>
                <th className="px-5 py-4 font-medium">Featured</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map(p => (
                <tr key={p._id} className="hover:bg-white/3 transition">
                  <td className="px-5 py-4 flex items-center gap-3">
                    <img src={p.images?.[0]} alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover bg-ink-900" />
                    <span className="text-zinc-100">{p.name}</span>
                  </td>
                  <td className="px-5 py-4 text-zinc-400">{p.brand}</td>
                  <td className="px-5 py-4 text-gold font-semibold">${p.price}</td>
                  <td className="px-5 py-4">
                    <span className={p.stock < 5 ? 'text-red-400' : 'text-zinc-300'}>{p.stock}</span>
                  </td>
                  <td className="px-5 py-4">
                    {p.featured
                      ? <span className="text-xs px-2 py-1 rounded-full bg-gold/10 text-gold">Yes</span>
                      : <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-zinc-500">No</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)}
                        className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => remove(p._id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="text-center py-12 text-zinc-500">No products yet. Add one!</p>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <Modal title={modal === 'add' ? 'Add Product' : 'Edit Product'} onClose={() => setModal(null)}>
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4 text-red-400 text-sm">
                <AlertCircle size={14} /> {error}
              </div>
            )}
            <div className="space-y-4">
              <Field label="Name">
                <input className={inp} name="name" value={form.name} onChange={handle} placeholder="Phantom Onyx" />
              </Field>
              <Field label="Brand">
                <input className={inp} name="brand" value={form.brand} onChange={handle} placeholder="Vault" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price ($)">
                  <input className={inp} name="price" type="number" value={form.price} onChange={handle} placeholder="420" />
                </Field>
                <Field label="Stock">
                  <input className={inp} name="stock" type="number" value={form.stock} onChange={handle} placeholder="10" />
                </Field>
              </div>
              <Field label="Image URLs (comma separated) or Upload">
                <div className="flex gap-2">
                  <input className={`flex-1 ${inp}`} name="images" value={form.images} onChange={handle} placeholder="https://..." />
                  <input type="file" accept="image/*" id="image-upload" className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append('image', file);
                      try {
                        const res = await api.post('/upload', formData, {
                          headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        setForm(f => ({
                          ...f,
                          images: f.images ? `${f.images}, ${res.data.url}` : res.data.url
                        }));
                      } catch (err) {
                        setError('Failed to upload image');
                      }
                    }} 
                  />
                  <label htmlFor="image-upload" className="btn-gold cursor-pointer whitespace-nowrap px-4 py-2.5 rounded-xl text-sm flex items-center">
                    Upload
                  </label>
                </div>
              </Field>
              <Field label="Sizes — comma separated">
                <input className={inp} name="sizes" value={form.sizes} onChange={handle} placeholder="8, 9, 10, 11" />
              </Field>
              <Field label="Description">
                <textarea className={`${inp} resize-none h-24`} name="description" value={form.description} onChange={handle} />
              </Field>
              <label className="flex items-center gap-3 cursor-pointer text-sm text-zinc-300">
                <input type="checkbox" name="featured" checked={form.featured} onChange={handle}
                  className="w-4 h-4 accent-gold rounded" />
                Featured product
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-gold flex-1 disabled:opacity-60">
                {saving ? 'Saving…' : modal === 'add' ? 'Add Product' : 'Save Changes'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
