import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Save, RotateCcw, Check, AlertCircle, Eye, EyeOff, Loader2, Send } from 'lucide-react';
import api from '../../utils/api';
import SneakerLoader from '../../components/SneakerLoader';

const inp = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition placeholder-zinc-600 text-zinc-100";

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs text-zinc-400 tracking-widest uppercase mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-zinc-500 mt-1">{hint}</p>}
    </div>
  );
}

export default function AdminEmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [selectedKey, setSelectedKey] = useState('order_confirmation');
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showPreview, setShowPreview] = useState(true);

  const fetchTemplates = async (selectKey = null) => {
    try {
      const res = await api.get('/email-templates');
      setTemplates(res.data);
      const activeKey = selectKey || selectedKey;
      const current = res.data.find(t => t.templateKey === activeKey);
      if (current) {
        setForm({
          subject: current.subject || '',
          headerTitle: current.headerTitle || '',
          bodyText: current.bodyText || '',
          ctaText: current.ctaText || '',
          footerText: current.footerText || '',
          accentColor: current.accentColor || '',
          logoText: current.logoText || '',
          isActive: current.isActive ?? true,
        });
      }
    } catch (err) {
      showToast('Failed to load email templates.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 3500);
  };

  const handleTemplateChange = (key) => {
    setSelectedKey(key);
    const selected = templates.find(t => t.templateKey === key);
    if (selected) {
      setForm({
        subject: selected.subject || '',
        headerTitle: selected.headerTitle || '',
        bodyText: selected.bodyText || '',
        ctaText: selected.ctaText || '',
        footerText: selected.footerText || '',
        accentColor: selected.accentColor || '',
        logoText: selected.logoText || '',
        isActive: selected.isActive ?? true,
      });
    }
  };

  const handle = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/email-templates/${selectedKey}`, form);
      showToast('Template changes saved successfully!');
      // Refresh list to sync defaults and values
      await fetchTemplates(selectedKey);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Error saving template.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = async () => {
    if (!window.confirm('Are you sure you want to clear overrides and reset this template to defaults?')) return;
    setResetting(true);
    try {
      await api.post(`/email-templates/${selectedKey}/reset`);
      showToast('Template reset to system defaults!');
      await fetchTemplates(selectedKey);
    } catch (err) {
      showToast('Error resetting template.', 'error');
    } finally {
      setResetting(false);
    }
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testEmail) return;
    setSendingTest(true);
    try {
      await api.post(`/email-templates/${selectedKey}/send-test`, { email: testEmail });
      showToast(`Test email dispatched to ${testEmail}!`);
      setShowTestModal(false);
      setTestEmail('');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to send test email.', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  if (loading || !form) return (
    <div className="flex items-center justify-center h-64">
      <SneakerLoader size={64} />
    </div>
  );

  const selectedTemplate = templates.find(t => t.templateKey === selectedKey);
  const defaults = selectedTemplate?.defaults || {};

  // Resolve preview values (merge form overrides with defaults)
  const resolved = {
    subject: form.subject || defaults.subject || 'Preview Email',
    headerTitle: form.headerTitle || defaults.headerTitle || 'Welcome',
    bodyText: form.bodyText || defaults.bodyText || 'Welcome body content...',
    ctaText: form.ctaText || defaults.ctaText || 'Click Here',
    footerText: form.footerText || defaults.footerText || '',
    accentColor: form.accentColor || defaults.accentColor || '#d4af37',
    logoText: form.logoText || defaults.logoText || 'Sneaker Vault',
  };

  // Replace placeholders inside preview text representation
  const formatPreviewText = (text) => {
    return text
      .replace(/#{orderId}/g, 'SV-887F1')
      .replace(/#{customerName}/g, 'Alexander')
      .replace(/#{totalPrice}/g, '$340.00')
      .replace(/#{email}/g, 'customer@gmail.com')
      .replace(/#{productName}/g, 'Air Jordan 1 Retro High')
      .replace(/#{brand}/g, 'Nike')
      .replace(/#{price}/g, '190.00');
  };

  const iframeSrcDoc = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f0f14;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f14;padding:24px 12px;">
    <tr><td align="center">
      <table width="100%" max-width="500" style="max-width:500px;background:#18181f;border-radius:16px;overflow:hidden;border:1px solid #2a2a35;text-align:left;" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:28px 32px;background:linear-gradient(135deg,#1a1a24,#0f0f14);border-bottom:1px solid #2a2a35;">
            <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.3em;color:${resolved.accentColor};text-transform:uppercase;">${resolved.logoText}</p>
            <h1 style="margin:0;font-size:24px;color:#fafafa;font-weight:normal;">${formatPreviewText(resolved.headerTitle)}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <p style="margin:0 0 8px;color:#a1a1aa;font-size:14px;">Hi Alexander,</p>
            <p style="margin:0 0 24px;color:#a1a1aa;font-size:14px;line-height:1.6;white-space:pre-wrap;">${formatPreviewText(resolved.bodyText)}</p>
            
            ${selectedKey === 'order_confirmation' ? `
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a35;color:#e4e4e7;font-size:13px;">
                  Air Jordan 1 Retro High<br>
                  <span style="font-size:11px;color:#71717a;">Size 10.5 × 1</span>
                </td>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a35;color:${resolved.accentColor};text-align:right;font-size:13px;">
                  $190.00
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a35;color:#e4e4e7;font-size:13px;">
                  Yeezy Boost 350 V2<br>
                  <span style="font-size:11px;color:#71717a;">Size 11 × 1</span>
                </td>
                <td style="padding:10px 0;border-bottom:1px solid #2a2a35;color:${resolved.accentColor};text-align:right;font-size:13px;">
                  $150.00
                </td>
              </tr>
            </table>
            <p style="margin:0 0 24px;color:#fafafa;font-size:16px;text-align:right;">
              Total: <span style="color:${resolved.accentColor};">$340.00</span>
            </p>
            ` : ''}

            ${selectedKey === 'back_in_stock' ? `
            <div style="background:#0f0f14;border-radius:12px;padding:20px;border:1px solid #2a2a35;margin-bottom:24px;text-align:center;">
              <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" alt="Product" style="max-width:140px;border-radius:8px;margin-bottom:12px;display:inline-block;">
              <p style="margin:0 0 2px;font-size:11px;color:#71717a;text-transform:uppercase;">Nike</p>
              <h3 style="margin:0 0 6px;color:#fafafa;font-size:16px;font-weight:normal;">Air Jordan 1 Retro High</h3>
              <p style="margin:0 0 12px;color:${resolved.accentColor};font-size:15px;font-weight:bold;">$190.00</p>
            </div>
            ` : ''}

            <a href="#" style="display:inline-block;background:${resolved.accentColor};color:#0f0f14;text-decoration:none;padding:12px 24px;border-radius:10px;font-size:13px;font-weight:bold;">
              ${resolved.ctaText}
            </a>
          </td>
        </tr>
        ${resolved.footerText ? `<tr>
          <td style="padding:20px 32px;border-top:1px solid #2a2a35;">
            <p style="margin:0;color:#52525b;font-size:11px;text-align:center;">${formatPreviewText(resolved.footerText)}</p>
          </td>
        </tr>` : ''}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return (
    <div>
      {/* Toast Notification */}
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

      {/* Test Email Modal */}
      <AnimatePresence>
        {showTestModal && (
          <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass max-w-md w-full p-6 rounded-2xl border border-white/10"
            >
              <h3 className="font-display text-xl mb-2">Send Test Email</h3>
              <p className="text-xs text-zinc-400 mb-4">
                Dispatch a real test email using the custom values of <strong>{selectedTemplate?.label}</strong>.
              </p>
              <form onSubmit={handleSendTest} className="space-y-4">
                <Field label="Recipient Email">
                  <input
                    type="email" required className={inp} placeholder="you@example.com"
                    value={testEmail} onChange={e => setTestEmail(e.target.value)}
                  />
                </Field>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button" onClick={() => setShowTestModal(false)}
                    className="btn-ghost text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={sendingTest}
                    className="btn-gold flex items-center gap-2 text-xs py-2 px-4"
                  >
                    {sendingTest ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    {sendingTest ? 'Sending…' : 'Send Test'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
            <Mail size={20} />
          </div>
          <div>
            <h1 className="font-display text-3xl">Email Templates</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Customize transaction and welcome email designs</p>
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
          <button
            onClick={() => setShowTestModal(true)}
            className="btn-ghost flex items-center gap-2 py-2 text-zinc-300 hover:text-white"
          >
            <Send size={15} /> Send Test
          </button>
          <button onClick={resetDefaults} disabled={resetting} className="btn-ghost flex items-center gap-2 py-2">
            {resetting ? <Loader2 size={15} className="animate-spin" /> : <RotateCcw size={15} />}
            Reset
          </button>
          <button onClick={save} disabled={saving} className="btn-gold flex items-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving…' : 'Save Template'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-6 overflow-x-auto">
        {templates.map(t => (
          <button
            key={t.templateKey}
            onClick={() => handleTemplateChange(t.templateKey)}
            className={`px-4 py-2 rounded-xl text-xs tracking-wider uppercase font-semibold transition whitespace-nowrap ${
              selectedKey === t.templateKey
                ? 'bg-gold/10 border border-gold/20 text-gold'
                : 'border border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-[1.1fr_1.2fr]' : 'max-w-2xl'}`}>
        {/* Form Container */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-semibold">Template Settings</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-zinc-500">Enable Customizations:</span>
              <input
                type="checkbox" name="isActive" checked={form.isActive} onChange={handle}
                className="w-4 h-4 accent-gold bg-zinc-900 border-zinc-700 rounded focus:ring-0"
              />
            </label>
          </div>

          {!form.isActive && (
            <div className="p-3.5 bg-zinc-500/5 border border-zinc-500/10 rounded-xl text-xs text-zinc-400 flex items-start gap-2.5">
              <AlertCircle size={15} className="text-zinc-500 shrink-0 mt-0.5" />
              <span>
                This template's customizations are currently disabled. The system will use default built-in layouts.
              </span>
            </div>
          )}

          <div className={`${!form.isActive ? 'opacity-40 pointer-events-none transition' : 'transition'}`}>
            <div className="space-y-4">
              <Field label="Subject Line" hint="Supports placeholders: #{orderId}, #{customerName}, #{totalPrice}, #{productName}">
                <input
                  className={inp} name="subject" value={form.subject} onChange={handle}
                  placeholder={defaults.subject}
                />
              </Field>

              <Field label="Header Title" hint="Primary title displayed inside the email banner">
                <input
                  className={inp} name="headerTitle" value={form.headerTitle} onChange={handle}
                  placeholder={defaults.headerTitle}
                />
              </Field>

              <Field label="Body Copy" hint="Introductory paragraph or message details">
                <textarea
                  className={`${inp} resize-none h-28`} name="bodyText" value={form.bodyText} onChange={handle}
                  placeholder={defaults.bodyText}
                />
              </Field>

              <Field label="CTA Button Text" hint="Primary button call-to-action text">
                <input
                  className={inp} name="ctaText" value={form.ctaText} onChange={handle}
                  placeholder={defaults.ctaText}
                />
              </Field>

              <Field label="Footer Content" hint="Closing line or note inside footer (optional)">
                <input
                  className={inp} name="footerText" value={form.footerText} onChange={handle}
                  placeholder={defaults.footerText || 'None'}
                />
              </Field>

              <div className="border-t border-white/5 pt-4">
                <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-4">Visual Styling</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Logo Wordmark" hint="Header text">
                    <input
                      className={inp} name="logoText" value={form.logoText} onChange={handle}
                      placeholder={defaults.logoText}
                    />
                  </Field>

                  <Field label="Accent HEX Color" hint="Button color & highlights">
                    <div className="flex gap-2">
                      <div
                        className="w-10 h-10 rounded-xl border border-white/10 shrink-0"
                        style={{ backgroundColor: form.accentColor || defaults.accentColor || '#d4af37' }}
                      />
                      <input
                        className={inp} name="accentColor" value={form.accentColor} onChange={handle}
                        placeholder={defaults.accentColor}
                      />
                    </div>
                  </Field>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Container */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl overflow-hidden flex flex-col h-[700px] border border-white/10"
          >
            <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500/60" />
                <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                <div className="w-2 h-2 rounded-full bg-green-500/60" />
                <span className="text-[10px] text-zinc-500 ml-2">Email Live Preview — Sandbox</span>
              </div>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-white/5 uppercase">
                {selectedKey.replace('_', ' ')}
              </span>
            </div>

            <div className="px-5 py-2.5 bg-black/40 border-b border-white/5 text-xs text-zinc-400 flex items-center gap-2 shrink-0">
              <span className="text-zinc-600 font-medium select-none">Subject:</span>
              <span className="truncate text-zinc-300">{formatPreviewText(resolved.subject)}</span>
            </div>

            <div className="flex-1 bg-[#0f0f14] overflow-hidden relative">
              <iframe
                title="Email Sandbox Preview"
                srcDoc={iframeSrcDoc}
                className="w-full h-full border-none"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
