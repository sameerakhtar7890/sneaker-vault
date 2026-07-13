import { useState } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import api from '../utils/api';

export default function NewsletterSignup({ className = '' }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/newsletter/subscribe', {
        email: trimmed,
        source: 'footer'
      });
      setSuccess(data.message);
      if (!data.alreadySubscribed) setEmail('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-0">
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); setSuccess(''); }}
          placeholder="Enter your email"
          disabled={loading}
          required
          className="input-premium rounded-xl sm:rounded-l-xl sm:rounded-r-none sm:border-r-0 flex-1 disabled:opacity-60"
          aria-label="Email for newsletter"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-gold text-ink-950 px-5 py-2.5 font-semibold rounded-xl sm:rounded-l-none sm:rounded-r-xl
                     hover:bg-gold-soft transition-all duration-300 text-sm disabled:opacity-60
                     flex items-center justify-center gap-2 min-w-[88px] mt-2 sm:mt-0"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Join'}
        </button>
      </form>

      {success && (
        <p className="mt-3 text-xs text-green-400 flex items-start gap-1.5">
          <Check size={14} className="shrink-0 mt-0.5" /> {success}
        </p>
      )}
      {error && (
        <p className="mt-3 text-xs text-red-400 flex items-start gap-1.5">
          <AlertCircle size={14} className="shrink-0 mt-0.5" /> {error}
        </p>
      )}
      <p className="mt-2 text-[11px] text-zinc-600">
        Exclusive drops & early access. Unsubscribe anytime.
      </p>
    </div>
  );
}
