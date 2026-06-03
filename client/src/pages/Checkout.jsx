import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

export default function Checkout() {
  const { items, total } = useCart();
  const [clientSecret, setClientSecret] = useState(null);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    if (!items.length) return;
    api.post('/checkout/create-payment-intent', {
      items: items.map(i => ({ price: i.price, qty: i.qty })),
      currency: 'usd'
    })
    .then(r => setClientSecret(r.data.clientSecret))
    .catch(() => setDemo(true));
  }, [items]);

  if (!items.length) {
    return <div className="p-20 text-center text-zinc-500">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-[1fr_360px] gap-10">
      <section>
        <h1 className="font-display text-4xl mb-6">Checkout</h1>
        {clientSecret ? (
          <Elements stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#d4af37' } } }}>
            <CheckoutForm />
          </Elements>
        ) : demo ? (
          <div className="glass rounded-2xl p-6">
            <p className="text-zinc-400 text-sm">
              Stripe is not configured. Set <code>STRIPE_SECRET_KEY</code> on the server and
              <code> VITE_STRIPE_PUBLIC_KEY</code> on the client to enable real payments.
            </p>
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 text-zinc-400 text-sm">Preparing secure checkout…</div>
        )}
      </section>
      <aside className="glass rounded-2xl p-6 h-fit">
        <h3 className="font-display text-xl mb-4">Order Summary</h3>
        <ul className="space-y-3 text-sm">
          {items.map(i => (
            <li key={i.key} className="flex justify-between text-zinc-300">
              <span>{i.name} · {i.size} × {i.qty}</span>
              <span>${(i.price * i.qty).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-white/10 mt-4 pt-4 flex justify-between">
          <span className="text-zinc-400">Total</span>
          <span className="font-display text-2xl text-gold">${total.toFixed(2)}</span>
        </div>
      </aside>
    </div>
  );
}
