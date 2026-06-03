import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Mail, Loader2 } from 'lucide-react';
import api from '../utils/api';

export default function Success() {
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(state?.orderId);
  const [emailSent, setEmailSent] = useState(state?.emailSent);
  const [email, setEmail] = useState(state?.email || state?.trackEmail);
  const [isGuest, setIsGuest] = useState(state?.isGuest ?? !state?.user);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');

  const trackHref = orderId && email
    ? `/order/${orderId}?email=${encodeURIComponent(email)}`
    : orderId
      ? `/order/${orderId}`
      : null;

  useEffect(() => {
    if (orderId) return;

    const pi = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');
    if (!pi || redirectStatus !== 'succeeded') return;

    const raw = sessionStorage.getItem('sv_pending_order');
    if (!raw) return;

    setCompleting(true);
    const pending = JSON.parse(raw);

    if (pending.paymentIntentId !== pi) {
      setError('Could not match payment to order.');
      setCompleting(false);
      return;
    }

    api.post('/checkout/complete-order', {
      paymentIntentId: pi,
      cart_items: pending.cart_items,
      shipping_address: pending.shipping_address,
      confirmation_email: pending.confirmation_email,
      subtotal: pending.subtotal,
      discount_amount: pending.discount_amount,
      coupon_code: pending.coupon_code,
      total_price: pending.total_price
    })
      .then(r => {
        sessionStorage.removeItem('sv_pending_order');
        setOrderId(r.data.order._id);
        setEmailSent(r.data.emailSent);
        setEmail(r.data.confirmationEmail || pending.confirmation_email);
        setIsGuest(r.data.order.is_guest);
      })
      .catch(err => {
        setError(err?.response?.data?.message || 'Failed to finalize order');
      })
      .finally(() => setCompleting(false));
  }, [orderId, searchParams]);

  if (completing) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="animate-spin text-gold" size={32} />
        <p className="text-zinc-400 text-sm">Confirming your order…</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto text-center py-24 px-6">
      <CheckCircle2 className="mx-auto text-gold" size={64} />
      <h1 className="font-display text-4xl mt-6">Welcome to the Vault.</h1>
      <p className="text-zinc-400 mt-3">Your order is confirmed.</p>

      {error && (
        <p className="text-red-400 text-sm mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
      )}

      {emailSent !== false && email && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mx-auto max-w-md">
          <Mail size={16} />
          Confirmation sent to <span className="font-medium">{email}</span>
        </div>
      )}

      {emailSent === false && (
        <p className="text-zinc-500 text-sm mt-4">Email notifications are off for this address.</p>
      )}

      {isGuest && (
        <p className="text-zinc-500 text-sm mt-4">
          Save your order link — use the same email to track your order later.
        </p>
      )}

      {trackHref && (
        <Link to={trackHref} className="btn-gold mt-6 inline-flex mx-2">
          Track Order
        </Link>
      )}
      <Link to="/shop" className="btn-gold mt-6 inline-flex mx-2 bg-transparent border border-gold text-gold hover:bg-gold hover:text-ink-950">
        Keep Shopping
      </Link>
    </motion.div>
  );
}
