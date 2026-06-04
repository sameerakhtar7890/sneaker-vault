import { useEffect, useState } from 'react';
import { Loader2, Save, Globe } from 'lucide-react';
import api from '../../utils/api';

const inp = 'input-premium w-full';

export default function AdminSeo() {
  const [form, setForm] = useState({
    siteName: '',
    titleSuffix: '',
    defaultDescription: '',
    defaultOgImage: '',
    siteUrl: '',
    pages: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.get('/seo')
      .then(r => setForm({
        siteName: r.data.siteName || '',
        titleSuffix: r.data.titleSuffix || '',
        defaultDescription: r.data.defaultDescription || '',
        defaultOgImage: r.data.defaultOgImage || '',
        siteUrl: r.data.siteUrl || '',
        pages: r.data.pages || []
      }))
      .finally(() => setLoading(false));
  }, []);

  const handleGlobal = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handlePage = (index, field, value) => {
    setForm(f => {
      const pages = [...f.pages];
      pages[index] = { ...pages[index], [field]: value };
      return { ...f, pages };
    });
  };

  const save = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/seo/admin', form);
      setToast('SEO settings saved');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      alert(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-gold" size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="section-eyebrow mb-2">DISCOVERABILITY</p>
        <h1 className="font-display text-3xl flex items-center gap-3">
          <Globe className="text-gold" size={28} />
          SEO Settings
        </h1>
      </div>

      {toast && (
        <p className="mb-4 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
          {toast}
        </p>
      )}

      <form onSubmit={save} className="space-y-8 max-w-3xl">
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-lg">Global defaults</h2>
          <div>
            <label className="block text-xs text-zinc-500 uppercase mb-1">Site name</label>
            <input name="siteName" value={form.siteName} onChange={handleGlobal} className={inp} />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 uppercase mb-1">Title suffix (e.g. page | suffix)</label>
            <input name="titleSuffix" value={form.titleSuffix} onChange={handleGlobal} className={inp} />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 uppercase mb-1">Default description</label>
            <textarea name="defaultDescription" value={form.defaultDescription} onChange={handleGlobal} rows={3} className={`${inp} resize-none`} />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 uppercase mb-1">Default OG image URL</label>
            <input name="defaultOgImage" value={form.defaultOgImage} onChange={handleGlobal} className={inp} placeholder="/pwa-512.png or https://..." />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 uppercase mb-1">Site URL (canonical base)</label>
            <input name="siteUrl" value={form.siteUrl} onChange={handleGlobal} className={inp} placeholder="https://yoursite.com" />
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-6">
          <h2 className="font-display text-lg">Per-page SEO</h2>
          {form.pages.map((page, i) => (
            <div key={page.path} className="border-t border-white/10 pt-4 space-y-3">
              <p className="text-xs text-gold font-mono">{page.path}</p>
              <input
                value={page.title || ''}
                onChange={e => handlePage(i, 'title', e.target.value)}
                placeholder="Page title"
                className={inp}
              />
              <textarea
                value={page.description || ''}
                onChange={e => handlePage(i, 'description', e.target.value)}
                placeholder="Meta description"
                rows={2}
                className={`${inp} resize-none`}
              />
              <input
                value={page.ogImage || ''}
                onChange={e => handlePage(i, 'ogImage', e.target.value)}
                placeholder="OG image override (optional)"
                className={inp}
              />
              <label className="flex items-center gap-2 text-sm text-zinc-400">
                <input
                  type="checkbox"
                  checked={Boolean(page.noIndex)}
                  onChange={e => handlePage(i, 'noIndex', e.target.checked)}
                  className="accent-gold"
                />
                Hide from search engines (noindex)
              </label>
            </div>
          ))}
        </div>

        <button type="submit" disabled={saving} className="btn-gold flex items-center gap-2 disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save SEO settings
        </button>
      </form>
    </div>
  );
}
