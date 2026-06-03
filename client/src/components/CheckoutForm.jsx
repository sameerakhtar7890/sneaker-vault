import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true); setError(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/success` },
      redirect: 'if_required'
    });
    if (error) { setError(error.message); setSubmitting(false); return; }
    clear();
    navigate('/success');
  };

  return (
    <motion.form onSubmit={onSubmit}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 space-y-5">
      <PaymentElement />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button disabled={!stripe || submitting} className="btn-gold w-full disabled:opacity-60">
        {submitting ? 'Processing…' : 'Pay securely'}
      </button>
      <p className="text-[11px] text-zinc-500 text-center">
        Payments processed by Stripe. Your details never touch our servers.
      </p>
    </motion.form>
  );
}
