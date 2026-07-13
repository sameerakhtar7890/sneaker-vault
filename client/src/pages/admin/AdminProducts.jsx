import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check, AlertCircle, FileUp, Download, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const EMPTY = {
  name: '', brand: '', price: '', description: '',
  images: '', sizes: '', stock: '', featured: false,
  seoTitle: '', seoDescription: '', ogImage: ''
};

function parseCSV(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i+1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      lines.push(row);
      row = [''];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== '') {
    lines.push(row);
  }
  return lines;
}

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
  const [modal,    setModal]    = useState(null); // null | 'add' | 'edit' | 'import'
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [toast,    setToast]    = useState('');

  // CSV Importer State
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  const [importing, setImporting] = useState(false);

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
      stock:  p.stock, featured: p.featured || false,
      seoTitle: p.seoTitle || '',
      seoDescription: p.seoDescription || '',
      ogImage: p.ogImage || ''
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
    seoTitle:       form.seoTitle.trim() || undefined,
    seoDescription: form.seoDescription.trim() || undefined,
    ogImage:        form.ogImage.trim() || undefined
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

  // CSV Importer Logic
  const downloadTemplate = () => {
    const headers = 'name,brand,price,description,sizes,stock,category,featured,images\n';
    const row1 = 'Nike Air Max 90,Nike,130,Nothing as fly or comfortable,"8,9,10,11",15,sneakers,true,"https://images.unsplash.com/photo-1514989940723-e8e51635b782"\n';
    const row2 = 'Adidas Ultraboost 1.0,Adidas,190,A standard for comfort,"9,10,11",12,sneakers,false,"https://images.unsplash.com/photo-1587563871167-1ee9c731aefb"\n';
    const blob = new Blob([headers + row1 + row2], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sneaker_vault_products_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFile(file);
    setCsvErrors([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const parsed = parseCSV(text).map(r => r.map(cell => cell.trim()));
      if (parsed.length < 2) {
        setCsvErrors(['CSV file is empty or only contains headers.']);
        setCsvPreview([]);
        return;
      }

      const headers = parsed[0].map(h => h.toLowerCase());
      const rows = parsed.slice(1);
      const previewRows = [];
      const validationErrors = [];

      rows.forEach((row, idx) => {
        if (row.length === 0 || (row.length === 1 && row[0] === '')) return;
        const rowNum = idx + 2;
        const item = {};
        headers.forEach((header, colIndex) => {
          item[header] = row[colIndex] || '';
        });

        const rowErrors = [];
        if (!item.name) rowErrors.push('Name missing');
        if (!item.brand) rowErrors.push('Brand missing');
        if (!item.price || isNaN(Number(item.price))) rowErrors.push('Invalid price');

        previewRows.push({
          rowNum,
          name: item.name || '—',
          brand: item.brand || '—',
          price: item.price || '—',
          stock: item.stock || '0',
          errors: rowErrors
        });

        if (rowErrors.length > 0) {
          validationErrors.push(`Row ${rowNum}: ${rowErrors.join(', ')}`);
        }
      });

      setCsvPreview(previewRows);
      if (validationErrors.length > 0) {
        setCsvErrors(validationErrors);
      }
    };
    reader.readAsText(file);
  };

  const uploadCSV = async () => {
    if (!csvFile) return;
    setImporting(true);
    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await api.post('/products/bulk-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast(res.data.message);
      setModal(null);
      setCsvFile(null);
      setCsvPreview([]);
      setCsvErrors([]);
      load();
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Failed to import CSV';
      const detailErrors = err?.response?.data?.errors || [];
      setCsvErrors(detailErrors.length > 0 ? detailErrors : [errMsg]);
    } finally {
      setImporting(false);
    }
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setCsvFile(null); setCsvPreview([]); setCsvErrors([]); setError(''); setModal('import'); }}
            className="btn-ghost flex items-center gap-2"
          >
            <FileUp size={16} /> Import CSV
          </button>
          <button onClick={openAdd} className="btn-gold flex items-center gap-2">
            <Plus size={16} /> Add Product
          </button>
        </div>
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

      {/* Modal Add/Edit */}
      <AnimatePresence>
        {modal && modal !== 'import' && (
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
              <div className="border-t border-white/10 pt-4 space-y-3">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">SEO (optional)</p>
                <Field label="SEO title">
                  <input className={inp} name="seoTitle" value={form.seoTitle} onChange={handle} placeholder="Custom page title" />
                </Field>
                <Field label="SEO description">
                  <textarea className={`${inp} resize-none h-16`} name="seoDescription" value={form.seoDescription} onChange={handle} placeholder="Meta description for search & social" />
                </Field>
                <Field label="OG image URL">
                  <input className={inp} name="ogImage" value={form.ogImage} onChange={handle} placeholder="Leave blank to use first product image" />
                </Field>
              </div>
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

        {/* CSV Import Modal */}
        {modal === 'import' && (
          <Modal title="Import Products from CSV" onClose={() => setModal(null)}>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Download CSV Template</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Use this template structure to format your product data.</p>
                </div>
                <button onClick={downloadTemplate} className="btn-ghost flex items-center gap-1.5 py-2 px-3 text-xs">
                  <Download size={14} /> Template
                </button>
              </div>

              <Field label="Choose CSV File">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-6 hover:border-gold/30 transition bg-white/3 relative cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <FileUp size={24} className="text-zinc-500 mb-2" />
                  <p className="text-xs text-zinc-400 font-medium">
                    {csvFile ? csvFile.name : 'Click to select or drag and drop a CSV file'}
                  </p>
                  {csvFile && (
                    <p className="text-[10px] text-zinc-500 mt-1">
                      {(csvFile.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
              </Field>

              {csvErrors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 max-h-32 overflow-y-auto">
                  <div className="flex gap-2 text-red-400 text-xs font-semibold mb-1">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>Errors/Warnings:</span>
                  </div>
                  <ul className="list-disc list-inside text-[10px] text-red-300 space-y-0.5">
                    {csvErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {csvPreview.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-400 font-semibold">Preview (Parsed {csvPreview.length} items)</p>
                  <div className="max-h-48 overflow-y-auto border border-white/10 rounded-xl bg-white/5">
                    <table className="w-full text-[11px] text-left">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-zinc-400">
                          <th className="p-2 font-medium">Row</th>
                          <th className="p-2 font-medium">Product</th>
                          <th className="p-2 font-medium">Brand</th>
                          <th className="p-2 font-medium">Price</th>
                          <th className="p-2 font-medium">Stock</th>
                          <th className="p-2 font-medium text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-zinc-300">
                        {csvPreview.map(item => (
                          <tr key={item.rowNum} className={item.errors.length > 0 ? 'bg-red-500/5' : ''}>
                            <td className="p-2 font-mono text-zinc-500">{item.rowNum}</td>
                            <td className="p-2 font-medium text-zinc-200">{item.name}</td>
                            <td className="p-2 text-zinc-400">{item.brand}</td>
                            <td className="p-2 text-gold">${item.price}</td>
                            <td className="p-2">{item.stock}</td>
                            <td className="p-2 text-right">
                              {item.errors.length > 0 ? (
                                <span className="text-red-400 font-medium" title={item.errors.join(', ')}>Error</span>
                              ) : (
                                <span className="text-green-400 font-medium">OK</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setModal(null);
                  setCsvFile(null);
                  setCsvPreview([]);
                  setCsvErrors([]);
                }}
                className="btn-ghost flex-1"
                disabled={importing}
              >
                Cancel
              </button>
              <button
                onClick={uploadCSV}
                disabled={!csvFile || csvErrors.length > 0 || importing}
                className="btn-gold flex-1 disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {importing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Importing…
                  </>
                ) : (
                  'Import Products'
                )}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
