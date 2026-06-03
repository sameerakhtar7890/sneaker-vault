import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Tag, X, Loader2 } from 'lucide-react';
import CheckoutForm from '../components/CheckoutForm';
import DemoCheckoutForm from '../components/DemoCheckoutForm';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

export default function Checkout() {
  const { items, total } = useCart();
  const { addToast } = useToast();

  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(false);

  const [promoInput, setPromoInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validating, setValidating] = useState(false);

  const [pricing, setPricing] = useState({
    subtotal: total,
    discountAmount: 0,
    total: total
  });

  const cartPayload = useCallback(
    () => items.map(i => ({ price: i.price, qty: i.qty })),
    [items]
  );

  const fetchPaymentIntent = useCallback(async (couponCode = appliedCoupon?.code) => {
    if (!items.length) return;
    setLoading(true);
    try {
      const { data } = await api.post('/checkout/create-payment-intent', {
        items: cartPayload(),
        currency: 'usd',
        couponCode: couponCode || undefined
      });
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setPricing({
        subtotal: data.subtotal,
        discountAmount: data.discountAmount,
        total: data.total
      });
      setDemo(false);
    } catch {
      setClientSecret(null);
      setPaymentIntentId(null);
      setDemo(true);
      if (appliedCoupon) {
        setPricing({
          subtotal: total,
          discountAmount: appliedCoupon.discountAmount,
          total: Math.max(0, total - appliedCoupon.discountAmount)
        });
      } else {
        setPricing({ subtotal: total, discountAmount: 0, total });
      }
    } finally {
      setLoading(false);
    }
  }, [items, cartPayload, appliedCoupon, total]);

  useEffect(() => {
    fetchPaymentIntent(appliedCoupon?.code);
  }, [items, appliedCoupon?.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyPromo = async () => {
    const code = promoInput.trim();
    if (!code) return;
    setCouponError('');
    setValidating(true);
    try {
      const { data } = await api.post('/coupons/validate', {
        code,
        items: cartPayload()
      });
      setAppliedCoupon({
        code: data.coupon.code,
        description: data.coupon.description,
        discountAmount: data.discountAmount
      });
      setPromoInput('');
      setPricing({
        subtotal: data.subtotal,
        discountAmount: data.discountAmount,
        total: data.total
      });
      addToast(`Promo code "${data.coupon.code}" applied!`);
      await fetchPaymentIntent(data.coupon.code);
    } catch (err) {
      setCouponError(err?.response?.data?.message || 'Invalid promo code');
    } finally {
      setValidating(false);
    }
  };

  const removePromo = async () => {
    setAppliedCoupon(null);
    setPromoInput('');
    setCouponError('');
    addToast('Promo code removed');
    await fetchPaymentIntent(null);
  };

  if (!items.length) {
    return <div className="p-20 text-center text-zinc-500">Your cart is empty.</div>;
  }

  const pricingPayload = {
    subtotal: pricing.subtotal,
    discountAmount: pricing.discountAmount,
    total: pricing.total,
    couponCode: appliedCoupon?.code || null
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-[1fr_360px] gap-10"
    >
      <section>
        <p className="section-eyebrow mb-2">SECURE PAYMENT</p>
        <h1 className="font-display text-4xl mb-6">Checkout</h1>
        {loading && !clientSecret && !demo ? (
          <div className="glass rounded-2xl p-6 text-zinc-400 text-sm flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Preparing secure checkout…
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#d4af37' } } }}>
            <CheckoutForm
              finalTotal={pricing.total}
              pricing={pricingPayload}
              paymentIntentId={paymentIntentId}
              items={items}
            />
          </Elements>
        ) : demo ? (
          <DemoCheckoutForm items={items} pricing={pricingPayload} />
        ) : null}
      </section>

      <aside className="glass-strong rounded-2xl p-6 h-fit space-y-4 shadow-card sticky top-24">
        <h3 className="font-display text-xl">Order Summary</h3>

        <ul className="space-y-3 text-sm">
          {items.map(i => (
            <li key={i.key} className="flex justify-between text-zinc-300">
              <span className="pr-4">{i.name} · {i.size} × {i.qty}</span>
              <span>${(i.price * i.qty).toFixed(2)}</span>
            </li>
          ))}
        </ul>

        {/* Promo code */}
        <div className="border-t border-white/10 pt-4">
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-2 text-sm text-green-400">
                <Tag size={14} />
                <span className="font-medium">{appliedCoupon.code}</span>
                {appliedCoupon.description && (
                  <span className="text-green-400/60 text-xs hidden sm:inline">— {appliedCoupon.description}</span>
                )}
              </div>
              <button onClick={removePromo} className="text-zinc-400 hover:text-red-400 transition p-1">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={e => { setPromoInput(e.target.value.toUpperCase()); setCouponError(''); }}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), applyPromo())}
                  placeholder="Promo code"
                  className="input-premium flex-1 uppercase"
                />
                <button
                  onClick={applyPromo}
                  disabled={validating || !promoInput.trim()}
                  className="px-4 py-2 rounded-xl text-sm border border-gold/30 text-gold
                             hover:bg-gold/10 transition disabled:opacity-50">
                  {validating ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                </button>
              </div>
              {couponError && <p className="text-xs text-red-400">{couponError}</p>}
            </div>
          )}
        </div>

        <div className="border-t border-white/10 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Subtotal</span>
            <span>${pricing.subtotal.toFixed(2)}</span>
          </div>
          {pricing.discountAmount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Discount{appliedCoupon ? ` (${appliedCoupon.code})` : ''}</span>
              <span>-${pricing.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-white/10">
            <span className="text-zinc-400">Total</span>
            <span className="font-display text-2xl text-gold">${pricing.total.toFixed(2)}</span>
          </div>
        </div>
      </aside>
    </motion.div>
  );
}
