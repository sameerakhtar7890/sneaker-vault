import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Truck, Package, RotateCcw, Clock, MapPin, CreditCard, AlertCircle, CheckCircle2
} from 'lucide-react';

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="glass rounded-2xl p-6 flex gap-4">
      <div className="bg-gold/10 p-3 rounded-xl text-gold h-fit shrink-0">
        <Icon size={22} />
      </div>
      <div>
        <h3 className="font-display text-lg text-zinc-100 mb-2">{title}</h3>
        <div className="text-sm text-zinc-400 leading-relaxed space-y-2">{children}</div>
      </div>
    </div>
  );
}

function Step({ n, title, text }) {
  return (
    <li className="flex gap-4">
      <span className="w-8 h-8 rounded-full bg-gold/15 text-gold text-sm font-bold grid place-items-center shrink-0">
        {n}
      </span>
      <div>
        <p className="font-medium text-zinc-200 text-sm">{title}</p>
        <p className="text-zinc-500 text-sm mt-0.5">{text}</p>
      </div>
    </li>
  );
}

export default function ShippingReturns() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <p className="section-eyebrow mb-2">POLICIES</p>
        <h1 className="font-display text-4xl md:text-5xl mb-3">Shipping & Returns</h1>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto">
          Everything you need to know about delivery, tracking, and returning your pairs.
        </p>
      </motion.div>

      <div className="space-y-6">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="font-display text-2xl text-gold mb-4 flex items-center gap-2">
            <Truck size={22} /> Shipping
          </h2>
          <div className="space-y-4">
            <InfoCard icon={Clock} title="Processing & delivery">
              <p>Orders are typically processed within <strong className="text-zinc-300">1–2 business days</strong> after payment confirmation.</p>
              <ul className="list-disc list-inside space-y-1 text-zinc-500">
                <li>Standard US delivery: 3–7 business days</li>
                <li>Express shipping: 1–3 business days (where available)</li>
                <li>International: 7–14 business days (customs may add delay)</li>
              </ul>
            </InfoCard>

            <InfoCard icon={MapPin} title="Shipping rates">
              <p>Rates are calculated at checkout based on your address and order total. Free standard shipping may apply on qualifying orders — look for promotions on the shop page.</p>
            </InfoCard>

            <InfoCard icon={Package} title="Order tracking">
              <p>
                After your order ships, track it from the link in your confirmation email or from{' '}
                <Link to="/profile" className="text-gold hover:underline">Profile → Order History</Link>.
                Guest orders can be tracked with your order ID and confirmation email.
              </p>
            </InfoCard>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-display text-2xl text-gold mb-4 flex items-center gap-2">
            <RotateCcw size={22} /> Returns
          </h2>
          <div className="space-y-4">
            <InfoCard icon={CheckCircle2} title="30-day return window">
              <p>
                Eligible <strong className="text-zinc-300">delivered</strong> orders can be returned within{' '}
                <strong className="text-zinc-300">30 days</strong> of delivery. Items must be unworn, in original condition, with tags and packaging where applicable.
              </p>
            </InfoCard>

            <InfoCard icon={AlertCircle} title="What cannot be returned">
              <ul className="list-disc list-inside space-y-1">
                <li>Items marked final sale or heavily discounted (unless defective)</li>
                <li>Worn, damaged, or altered products</li>
                <li>Orders not yet delivered or still in transit</li>
                <li>Guest return requests outside the tracking flow (contact support)</li>
              </ul>
            </InfoCard>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg mb-4">How to start a return</h3>
              <ol className="space-y-4">
                <Step n="1" title="Sign in" text="Returns are submitted from your account for delivered, paid orders." />
                <Step n="2" title="Open your order" text="Go to Profile → Order History or use Track Order from your confirmation email." />
                <Step n="3" title="Request return" text='Click "Return" on a delivered order and choose a reason. You can track status under Profile → Returns.' />
                <Step n="4" title="Ship it back" text="Once approved, follow the return instructions we provide. Refunds are processed after inspection." />
              </ol>
              <Link to="/profile" className="btn-gold inline-block mt-6 text-sm">View my orders</Link>
            </div>

            <InfoCard icon={CreditCard} title="Refunds">
              <p>
                Approved refunds are issued to your original payment method within{' '}
                <strong className="text-zinc-300">5–10 business days</strong> after we receive and inspect the return.
                You will receive an email when your refund is processed.
              </p>
            </InfoCard>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 border border-gold/20"
        >
          <h3 className="font-display text-lg mb-2">Exchanges</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            We do not offer direct exchanges at this time. For a different size or style, return the original item (if eligible) and place a new order on the{' '}
            <Link to="/shop" className="text-gold hover:underline">shop</Link>.
          </p>
        </motion.section>
      </div>

      <div className="mt-10 flex flex-wrap gap-3 justify-center">
        <Link to="/faq" className="btn-ghost text-sm">Read FAQ</Link>
        <Link to="/contact" className="btn-gold text-sm">Contact Support</Link>
      </div>
    </div>
  );
}
