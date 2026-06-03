import { useAuth } from '../context/AuthContext';

const inp = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold/50 transition';

export default function CheckoutDetailsForm({ shipping, onShippingChange, confirmationEmail, onEmailChange }) {
  const { user } = useAuth();

  const handleShipping = e => onShippingChange({ ...shipping, [e.target.name]: e.target.value });

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <h3 className="font-display text-lg">Contact & Shipping</h3>

      <div>
        <label className="block text-xs text-zinc-400 uppercase mb-1.5">
          Order confirmation email
        </label>
        <input
          type="email"
          value={confirmationEmail}
          onChange={e => onEmailChange(e.target.value)}
          required
          placeholder="you@example.com"
          className={inp}
        />
        <p className="text-[11px] text-zinc-500 mt-1.5">
          {user
            ? 'Receipt goes here — can differ from your account email.'
            : 'Guest checkout — we’ll send your receipt to this address.'}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
        <div className="sm:col-span-2">
          <label className="block text-xs text-zinc-400 uppercase mb-1.5">Full Name</label>
          <input name="fullName" value={shipping.fullName} onChange={handleShipping} required className={inp} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-zinc-400 uppercase mb-1.5">Address</label>
          <input name="address" value={shipping.address} onChange={handleShipping} required className={inp} />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 uppercase mb-1.5">City</label>
          <input name="city" value={shipping.city} onChange={handleShipping} required className={inp} />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 uppercase mb-1.5">Postal Code</label>
          <input name="postalCode" value={shipping.postalCode} onChange={handleShipping} required className={inp} />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 uppercase mb-1.5">Country</label>
          <input name="country" value={shipping.country} onChange={handleShipping} required className={inp} />
        </div>
      </div>
    </div>
  );
}
