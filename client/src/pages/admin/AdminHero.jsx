import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Save, RotateCcw, Check, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import SneakerLoader from '../../components/SneakerLoader';

const DEFAULTS = {
  eyebrow: 'SS25 · LIMITED RELEASE',
  title: 'Step Into \nQuiet Luxury.',
  description: "A curated vault of rare, hand-finished sneakers from the world's uncompromising houses.",
  btnText: 'Explore the Vault',
  btnLink: '/shop',
  secondaryBtnText: 'Featured',
  secondaryBtnLink: '/shop?featured=true',
  image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1400&q=80'
};

const inp = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition placeholder-zinc-600 text-zinc-100";

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs text-zinc-400 tracking-widest uppercase mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-zinc-600 mt-1">{hint}</p>}
    </div>
  );
}

export default function AdminHero() {
  const [form, setForm]       = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast]     = useState('');
  const [toastType, setToastType] = useState('success');
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    api.get('/hero')
      .then(r => {
        const d = r.data;
        setForm({
          eyebrow:          d.eyebrow          || DEFAULTS.eyebrow,
          title:            d.title            || DEFAULTS.title,
          description:      d.description      || DEFAULTS.description,
          btnText:          d.btnText          || DEFAULTS.btnText,
          btnLink:          d.btnLink          || DEFAULTS.btnLink,
          secondaryBtnText: d.secondaryBtnText || DEFAULTS.secondaryBtnText,
          secondaryBtnLink: d.secondaryBtnLink || DEFAULTS.secondaryBtnLink,
          image:            d.image            || DEFAULTS.image,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 3500);
  };

  const handle = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(f => ({ ...f, image: res.data.url }));
      showToast('Image uploaded!');
    } catch {
      showToast('Failed to upload image.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.title || !form.btnText || !form.image) {
      showToast('Title, primary button text, and image are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.put('/hero', form);
      showToast('Hero settings saved!');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Error saving settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    setForm(DEFAULTS);
    showToast('Reset to defaults. Click Save to apply.');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <SneakerLoader size={64} />
    </div>
  );

  const titleLines = form.title.split('\n');

  return (
    <div>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl flex items-center gap-2 text-sm shadow-xl border
              ${toastType === 'error'
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-green-500/10 border-green-500/20 text-green-400'}`}
          >
            {toastType === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
            <Image size={20} />
          </div>
          <div>
            <h1 className="font-display text-3xl">Hero CMS</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Edit the homepage hero banner</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(p => !p)}
            className="btn-ghost flex items-center gap-2 py-2"
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button onClick={resetDefaults} className="btn-ghost flex items-center gap-2 py-2">
            <RotateCcw size={15} /> Reset
          </button>
          <button onClick={save} disabled={saving} className="btn-gold flex items-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-[1fr_1.2fr]' : 'max-w-2xl'}`}>
        {/* Form */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold border-b border-white/5 pb-3">Text Content</p>

          <Field label="Eyebrow Text" hint="Small label above the headline">
            <input className={inp} name="eyebrow" value={form.eyebrow} onChange={handle} placeholder="SS25 · LIMITED RELEASE" />
          </Field>

          <Field label="Headline" hint="Use \\n for a line break in the headline">
            <textarea
              className={`${inp} resize-none h-20`}
              name="title"
              value={form.title}
              onChange={handle}
              placeholder="Step Into\nQuiet Luxury."
            />
          </Field>

          <Field label="Description">
            <textarea
              className={`${inp} resize-none h-20`}
              name="description"
              value={form.description}
              onChange={handle}
              placeholder="A curated vault of rare, hand-finished sneakers…"
            />
          </Field>

          <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold border-b border-white/5 pb-3 pt-2">Buttons</p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Primary Button Text">
              <input className={inp} name="btnText" value={form.btnText} onChange={handle} placeholder="Explore the Vault" />
            </Field>
            <Field label="Primary Button Link">
              <input className={inp} name="btnLink" value={form.btnLink} onChange={handle} placeholder="/shop" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Secondary Button Text">
              <input className={inp} name="secondaryBtnText" value={form.secondaryBtnText} onChange={handle} placeholder="Featured" />
            </Field>
            <Field label="Secondary Button Link">
              <input className={inp} name="secondaryBtnLink" value={form.secondaryBtnLink} onChange={handle} placeholder="/shop?featured=true" />
            </Field>
          </div>

          <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold border-b border-white/5 pb-3 pt-2">Hero Image</p>

          <Field label="Image URL">
            <input className={inp} name="image" value={form.image} onChange={handle} placeholder="https://..." />
          </Field>

          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" id="hero-img-upload" className="hidden" onChange={handleImageUpload} />
            <label
              htmlFor="hero-img-upload"
              className="btn-ghost cursor-pointer flex items-center gap-2 py-2 text-sm"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Image size={14} />}
              {uploading ? 'Uploading…' : 'Upload New Image'}
            </label>

            {form.image && (
              <img
                src={form.image}
                alt="Hero preview thumbnail"
                className="h-10 w-16 rounded-lg object-cover border border-white/10"
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
            )}
          </div>
        </div>

        {/* Live Preview */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500/60" />
              <div className="w-2 h-2 rounded-full bg-amber-500/60" />
              <div className="w-2 h-2 rounded-full bg-green-500/60" />
              <span className="text-[10px] text-zinc-500 ml-2">Live Preview — Home Hero</span>
            </div>

            <div className="relative overflow-hidden bg-ink-950 p-6">
              {/* Background glows */}
              <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />

              <div className="grid md:grid-cols-2 gap-6 items-center relative">
                {/* Text side */}
                <div className="space-y-4">
                  <p className="text-[9px] tracking-[0.25em] text-gold font-semibold uppercase">{form.eyebrow}</p>

                  <h2 className="font-display text-2xl leading-[1.1] text-white">
                    {titleLines.map((line, i) => (
                      <span key={i}>
                        {i === titleLines.length - 1
                          ? <span className="bg-gradient-to-r from-gold via-amber-300 to-gold bg-clip-text text-transparent">{line}</span>
                          : <>{line}<br /></>
                        }
                      </span>
                    ))}
                  </h2>

                  <p className="text-zinc-400 text-[11px] leading-relaxed max-w-xs">{form.description}</p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-[10px] px-3 py-1.5 rounded-lg bg-gold text-ink-950 font-semibold">{form.btnText}</span>
                    <span className="text-[10px] px-3 py-1.5 rounded-lg border border-white/20 text-zinc-300">{form.secondaryBtnText}</span>
                  </div>
                </div>

                {/* Image side */}
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-tr from-gold/20 via-transparent to-indigo-500/10 rounded-2xl blur-xl pointer-events-none" />
                  <img
                    src={form.image}
                    alt="Hero preview"
                    className="relative rounded-2xl shadow-xl border border-white/10 w-full object-cover aspect-[4/3]"
                    onError={e => { e.currentTarget.src = DEFAULTS.image; }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
