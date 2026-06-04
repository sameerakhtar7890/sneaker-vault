import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { PolicySection, PolicyList } from '../components/PolicySection';

const UPDATED = 'June 4, 2026';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <Shield className="mx-auto text-gold mb-4" size={40} />
        <p className="section-eyebrow mb-2">LEGAL</p>
        <h1 className="font-display text-4xl md:text-5xl mb-3">Privacy Policy</h1>
        <p className="text-zinc-500 text-xs">Last updated: {UPDATED}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <PolicySection title="Introduction">
          <p>
            Sneaker Vault (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy. This policy explains how we collect,
            use, and protect personal information when you use our website, mobile experience, and related services.
          </p>
        </PolicySection>

        <PolicySection title="Information we collect">
          <p><strong className="text-zinc-300">Account information:</strong> name, email, and password when you register.</p>
          <p><strong className="text-zinc-300">Order information:</strong> shipping address, order details, payment confirmation (payments are processed by Stripe — we do not store full card numbers).</p>
          <p><strong className="text-zinc-300">Communication:</strong> emails you provide for order confirmations, newsletter signup, or contact forms.</p>
          <p><strong className="text-zinc-300">Usage data:</strong> browser type, pages visited, and device information collected through cookies and similar technologies for site functionality and analytics.</p>
          <p><strong className="text-zinc-300">Saved preferences:</strong> wishlist, compare list, cart (local storage), recently viewed products, and address book entries for logged-in users.</p>
        </PolicySection>

        <PolicySection title="How we use your information">
          <PolicyList items={[
            'Process and fulfill orders, including shipping and confirmation emails',
            'Manage your account, returns, and customer support requests',
            'Send marketing emails if you subscribe to our newsletter (you may unsubscribe anytime)',
            'Improve our store, products, and user experience',
            'Prevent fraud and maintain security of our platform',
            'Comply with legal obligations'
          ]} />
        </PolicySection>

        <PolicySection title="Email communications">
          <p>
            Order-related emails are sent to the address you provide at checkout. You can control marketing emails via
            newsletter unsubscribe links or by contacting us. Account holders can toggle order confirmation emails in{' '}
            <Link to="/profile" className="text-gold hover:underline">Profile settings</Link>.
          </p>
        </PolicySection>

        <PolicySection title="Sharing your information">
          <p>We do not sell your personal data. We may share information with:</p>
          <PolicyList items={[
            'Payment processors (e.g. Stripe) to complete transactions',
            'Shipping carriers to deliver your orders',
            'Email service providers to send transactional and marketing messages',
            'Cloud hosting and infrastructure providers that help operate our site',
            'Authorities when required by law or to protect our rights'
          ]} />
        </PolicySection>

        <PolicySection title="Cookies & local storage">
          <p>
            We use cookies and browser storage for authentication, cart persistence, wishlist, compare lists, offline catalog caching (PWA),
            and session preferences. You can clear site data in your browser settings; some features may not work without storage.
          </p>
        </PolicySection>

        <PolicySection title="Data retention">
          <p>
            We retain account and order data as long as your account is active or as needed for legal, tax, and business purposes.
            Newsletter subscriber records are kept until you unsubscribe or request deletion.
          </p>
        </PolicySection>

        <PolicySection title="Your rights">
          <p>Depending on your location, you may have the right to:</p>
          <PolicyList items={[
            'Access, correct, or delete your personal information',
            'Object to or restrict certain processing',
            'Withdraw consent for marketing communications',
            'Request a copy of data we hold about you'
          ]} />
          <p>
            To exercise these rights, contact us at{' '}
            <a href="mailto:privacy@sneakervault.com" className="text-gold hover:underline">privacy@sneakervault.com</a>.
          </p>
        </PolicySection>

        <PolicySection title="Security">
          <p>
            We use industry-standard measures including HTTPS, secure payment processing, and hashed passwords. No method of transmission
            over the internet is 100% secure; we encourage strong passwords and protecting your login credentials.
          </p>
        </PolicySection>

        <PolicySection title="Children">
          <p>
            Our services are not directed to individuals under 16. We do not knowingly collect personal information from children.
          </p>
        </PolicySection>

        <PolicySection title="Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the top will reflect changes.
            Continued use of the site after updates constitutes acceptance of the revised policy.
          </p>
        </PolicySection>

        <PolicySection title="Contact us">
          <p>
            Questions about privacy? Email{' '}
            <a href="mailto:privacy@sneakervault.com" className="text-gold hover:underline">privacy@sneakervault.com</a>
            {' '}or visit our <Link to="/contact" className="text-gold hover:underline">Contact</Link> page.
          </p>
        </PolicySection>
      </motion.div>

      <div className="mt-10 flex flex-wrap gap-3 justify-center text-sm">
        <Link to="/terms" className="btn-ghost">Terms of Service</Link>
        <Link to="/contact" className="btn-gold">Contact Us</Link>
      </div>
    </div>
  );
}
