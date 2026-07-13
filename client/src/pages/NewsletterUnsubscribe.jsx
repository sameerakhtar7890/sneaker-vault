import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Check, AlertCircle, Loader2 } from 'lucide-react';
import api from '../utils/api';

export default function NewsletterUnsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid unsubscribe link.');
      return;
    }

    api.post(`/newsletter/unsubscribe/${token}`)
      .then(r => {
        setStatus('success');
        setMessage(r.data.message);
      })
      .catch(err => {
        setStatus('error');
        setMessage(err?.response?.data?.message || 'Could not process unsubscribe request.');
      });
  }, [token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-10 max-w-md w-full text-center shadow-card"
      >
        {status === 'loading' && (
          <>
            <Loader2 size={40} className="mx-auto text-gold animate-spin mb-4" />
            <p className="text-zinc-400">Processing your request…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <Check size={40} className="mx-auto text-green-400 mb-4" />
            <h1 className="font-display text-2xl mb-2">Unsubscribed</h1>
            <p className="text-zinc-400 text-sm">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle size={40} className="mx-auto text-red-400 mb-4" />
            <h1 className="font-display text-2xl mb-2">Something went wrong</h1>
            <p className="text-zinc-400 text-sm">{message}</p>
          </>
        )}
        <Link to="/" className="btn-gold inline-block mt-8 text-sm">
          Back to Sneaker Vault
        </Link>
        <p className="mt-6 text-xs text-zinc-500 flex items-center justify-center gap-1">
          <Mail size={12} /> Changed your mind? Subscribe again from our footer.
        </p>
      </motion.div>
    </div>
  );
}
