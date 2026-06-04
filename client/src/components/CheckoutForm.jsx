import { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import CheckoutDetailsForm from './CheckoutDetailsForm';
import { addressToShipping } from '../utils/addressUtils';

const EMPTY_SHIPPING = {
  fullName: '', address: '', city: '', postalCode: '', country: 'US'
};

export default function CheckoutForm({ finalTotal, pricing, paymentIntentId, items }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clear } = useCart();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [shipping, setShipping] = useState({
    ...EMPTY_SHIPPING,
    fullName: user?.name || ''
  });
  const [confirmationEmail, setConfirmationEmail] = useState(user?.email || '');
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.get('/addresses')
      .then(r => {
        const list = r.data || [];
        const def = list.find(a => a.isDefault) || list[0];
        if (def) {
          setSelectedAddressId(def._id);
          setShipping(addressToShipping(def));
        }
      })
      .catch(() => {});
  }, [user?._id]);

  const completeOrderOnServer = async () => {
    const { data } = await api.post('/checkout/complete-order', {
      paymentIntentId,
      cart_items: items,
      shipping_address: shipping,
      confirmation_email: confirmationEmail.trim(),
      subtotal: pricing.subtotal,
      discount_amount: pricing.discountAmount,
      coupon_code: pricing.couponCode || null,
      total_price: pricing.total
    });
    return data;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!shipping.fullName || !shipping.address || !shipping.city || !shipping.postalCode) {
      setError('Please fill in your shipping address');
      return;
    }
    if (!confirmationEmail.trim()) {
      setError('Please enter an email for your order confirmation');
      return;
    }

    setSubmitting(true);
    setError(null);

    const pending = {
      paymentIntentId,
      cart_items: items,
      shipping_address: shipping,
      confirmation_email: confirmationEmail.trim(),
      subtotal: pricing.subtotal,
      discount_amount: pricing.discountAmount,
      coupon_code: pricing.couponCode || null,
      total_price: pricing.total
    };

    sessionStorage.setItem('sv_pending_order', JSON.stringify(pending));

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/success` },
      redirect: 'if_required'
    });

    if (stripeError) {
      setError(stripeError.message);
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status !== 'succeeded') {
      setError('Payment was not completed');
      setSubmitting(false);
      return;
    }

    try {
      const result = await completeOrderOnServer();
      sessionStorage.removeItem('sv_pending_order');
      clear();
      navigate('/success', {
        state: {
          orderId: result.order._id,
          emailSent: result.emailSent,
          email: result.confirmationEmail || confirmationEmail.trim(),
          isGuest: !user
        }
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Order could not be saved. Contact support if you were charged.');
      setSubmitting(false);
    }
  };

  return (
    <motion.form onSubmit={onSubmit}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      <CheckoutDetailsForm
        shipping={shipping}
        onShippingChange={setShipping}
        confirmationEmail={confirmationEmail}
        onEmailChange={setConfirmationEmail}
        selectedAddressId={selectedAddressId}
        onSelectAddress={setSelectedAddressId}
      />

      <div className="glass rounded-2xl p-6 space-y-5">
        <h3 className="font-display text-lg">Payment</h3>
        <PaymentElement />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button disabled={!stripe || submitting} className="btn-gold w-full disabled:opacity-60">
          {submitting ? 'Processing…' : `Pay $${(finalTotal ?? 0).toFixed(2)} securely`}
        </button>
      </div>
    </motion.form>
  );
}
