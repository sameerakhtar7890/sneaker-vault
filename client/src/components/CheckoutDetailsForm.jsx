import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { addressToShipping, formatAddressLine } from '../utils/addressUtils';

const inp = 'input-premium w-full';

export default function CheckoutDetailsForm({
  shipping,
  onShippingChange,
  confirmationEmail,
  onEmailChange,
  selectedAddressId,
  onSelectAddress
}) {
  const { user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingAddresses(true);
    api.get('/addresses')
      .then(r => setSavedAddresses(r.data))
      .catch(() => setSavedAddresses([]))
      .finally(() => setLoadingAddresses(false));
  }, [user]);

  const handleShipping = e => {
    onSelectAddress?.('manual');
    onShippingChange({ ...shipping, [e.target.name]: e.target.value });
  };

  const pickAddress = addr => {
    onSelectAddress?.(addr._id);
    onShippingChange(addressToShipping(addr));
  };

  const useNewAddress = () => {
    onSelectAddress?.('manual');
    onShippingChange({
      fullName: user?.name || '',
      address: '',
      city: '',
      postalCode: '',
      country: 'US'
    });
  };

  const isManual = selectedAddressId === 'manual' || !selectedAddressId;

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

      {user && (
        <div className="pt-2 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Saved addresses</p>
            <Link to="/profile" className="text-[11px] text-gold hover:underline" onClick={() => {
              sessionStorage.setItem('sv_profile_tab', 'addresses');
            }}>
              Manage
            </Link>
          </div>

          {loadingAddresses ? (
            <p className="text-sm text-zinc-500">Loading addresses…</p>
          ) : savedAddresses.length > 0 ? (
            <div className="space-y-2">
              {savedAddresses.map(addr => (
                <button
                  key={addr._id}
                  type="button"
                  onClick={() => pickAddress(addr)}
                  className={`w-full text-left rounded-xl p-3 border transition-all duration-300 ${
                    selectedAddressId === addr._id
                      ? 'border-gold/40 bg-gold/10'
                      : 'border-white/10 hover:border-gold/20 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-gold shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-200">
                        {addr.label}
                        {addr.isDefault && (
                          <span className="ml-2 text-[10px] text-gold uppercase">Default</span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">{formatAddressLine(addr)}</p>
                    </div>
                  </div>
                </button>
              ))}
              <button
                type="button"
                onClick={useNewAddress}
                className={`w-full flex items-center justify-center gap-2 rounded-xl p-3 border text-sm transition ${
                  isManual && savedAddresses.length > 0
                    ? 'border-gold/40 bg-gold/10 text-gold'
                    : 'border-white/10 text-zinc-400 hover:border-gold/20'
                }`}
              >
                <Plus size={14} /> Use a different address
              </button>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              No saved addresses.{' '}
              <Link to="/profile" className="text-gold hover:underline" onClick={() => {
                sessionStorage.setItem('sv_profile_tab', 'addresses');
              }}>
                Add one in your profile
              </Link>
            </p>
          )}
        </div>
      )}

      <div className={`grid sm:grid-cols-2 gap-4 pt-2 border-t border-white/10 ${user && savedAddresses.length > 0 && !isManual ? 'opacity-60 pointer-events-none' : ''}`}>
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
