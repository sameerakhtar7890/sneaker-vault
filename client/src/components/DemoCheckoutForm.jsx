import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import CheckoutDetailsForm from './CheckoutDetailsForm';
import { addressToShipping } from '../utils/addressUtils';

const EMPTY_SHIPPING = {
  fullName: '', address: '', city: '', postalCode: '', country: 'US'
};

export default function DemoCheckoutForm({
  items, pricing,
  shipping, onShippingChange,
  confirmationEmail, onEmailChange,
  selectedAddressId, onSelectAddress
}) {
  const navigate = useNavigate();
  const { clear } = useCart();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
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

    try {
      const { data } = await api.post('/checkout/demo-order', {
        cart_items: items,
        shipping_address: shipping,
        confirmation_email: confirmationEmail.trim(),
        subtotal: pricing.subtotal,
        discount_amount: pricing.discountAmount,
        shipping_cost: pricing.shippingCost,
        coupon_code: pricing.couponCode || null,
        total_price: pricing.total
      });
      clear();
      const email = data.confirmationEmail || confirmationEmail.trim();
      navigate('/success', {
        state: {
          orderId: data.order._id,
          emailSent: data.emailSent,
          email,
          isGuest: !user,
          trackEmail: email
        }
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not place order');
      setSubmitting(false);
    }
  };

  return (
    <motion.form onSubmit={onSubmit}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      {!user && (
        <p className="text-sm text-zinc-400 glass rounded-xl px-4 py-3">
          Checking out as guest. Already have an account?{' '}
          <Link to="/login" state={{ from: { pathname: '/checkout' } }} className="text-gold hover:underline">
            Sign in
          </Link>
        </p>
      )}

      <p className="text-amber-400/90 text-sm bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
        Demo mode — Stripe is not configured. Place a test order; confirmation email goes to the address below.
      </p>

      <CheckoutDetailsForm
        shipping={shipping}
        onShippingChange={setShipping}
        confirmationEmail={confirmationEmail}
        onEmailChange={setConfirmationEmail}
        selectedAddressId={selectedAddressId}
        onSelectAddress={setSelectedAddressId}
      />

      {error && <p className="text-sm text-red-400">{error}</p>}
      <button disabled={submitting} className="btn-gold w-full disabled:opacity-60">
        {submitting ? 'Placing order…' : `Place Order — $${pricing.total.toFixed(2)}`}
      </button>
    </motion.form>
  );
}
