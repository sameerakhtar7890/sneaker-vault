import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { PolicySection, PolicyList } from '../components/PolicySection';

const UPDATED = 'June 4, 2026';

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <FileText className="mx-auto text-gold mb-4" size={40} />
        <p className="section-eyebrow mb-2">LEGAL</p>
        <h1 className="font-display text-4xl md:text-5xl mb-3">Terms of Service</h1>
        <p className="text-zinc-500 text-xs">Last updated: {UPDATED}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <PolicySection title="Agreement">
          <p>
            By accessing or using Sneaker Vault (the &quot;Site&quot;), you agree to these Terms of Service and our{' '}
            <Link to="/privacy" className="text-gold hover:underline">Privacy Policy</Link>.
            If you do not agree, please do not use the Site.
          </p>
        </PolicySection>

        <PolicySection title="Eligibility">
          <p>
            You must be at least 16 years old and able to form a binding contract to use this Site. By placing an order, you represent
            that information you provide is accurate and complete.
          </p>
        </PolicySection>

        <PolicySection title="Products & pricing">
          <PolicyList items={[
            'Product images and descriptions are for illustration; minor variations may occur',
            'Prices are shown in USD unless stated otherwise and may change without notice',
            'We reserve the right to limit quantities or refuse orders (e.g. errors, suspected fraud)',
            'Promotional codes are subject to their stated terms and cannot be combined unless specified'
          ]} />
        </PolicySection>

        <PolicySection title="Orders & payment">
          <p>
            An order is an offer to purchase. We confirm acceptance when you receive an order confirmation email. Payment is processed
            securely through our payment provider (Stripe). You are responsible for applicable taxes and duties where required.
          </p>
          <p>
            Guest checkout is available; you are responsible for providing a valid email for order updates and tracking.
          </p>
        </PolicySection>

        <PolicySection title="Shipping & delivery">
          <p>
            Delivery times are estimates, not guarantees. Risk of loss passes to you upon delivery to the carrier. See our{' '}
            <Link to="/shipping" className="text-gold hover:underline">Shipping & Returns</Link> page for details.
          </p>
        </PolicySection>

        <PolicySection title="Returns & refunds">
          <p>
            Returns are governed by our Shipping & Returns policy and in-app return request process. Eligible delivered orders may be
            returned within 30 days subject to inspection. Refunds are issued to the original payment method when approved.
          </p>
        </PolicySection>

        <PolicySection title="Accounts">
          <PolicyList items={[
            'You are responsible for maintaining the confidentiality of your login credentials',
            'Notify us promptly of unauthorized use of your account',
            'We may suspend or terminate accounts that violate these terms or applicable law',
            'Features such as wishlist, address book, and order history require an active account'
          ]} />
        </PolicySection>

        <PolicySection title="Acceptable use">
          <p>You agree not to:</p>
          <PolicyList items={[
            'Use the Site for unlawful purposes or to violate others\' rights',
            'Attempt to gain unauthorized access to our systems or other users\' accounts',
            'Scrape, copy, or resell Site content without permission',
            'Submit false orders, fraudulent returns, or abusive content in reviews',
            'Interfere with the normal operation of the Site (including automated abuse)'
          ]} />
        </PolicySection>

        <PolicySection title="Reviews & user content">
          <p>
            Product reviews you submit must be honest and based on your experience. We may remove content that is offensive, misleading,
            or violates these terms. You grant us a license to display review content on the Site.
          </p>
        </PolicySection>

        <PolicySection title="Intellectual property">
          <p>
            All Site content — including logos, text, graphics, and layout — is owned by Sneaker Vault or its licensors and protected by
            intellectual property laws. You may not reproduce or exploit content without written permission.
          </p>
        </PolicySection>

        <PolicySection title="Disclaimer">
          <p>
            THE SITE AND PRODUCTS ARE PROVIDED &quot;AS IS&quot; TO THE FULLEST EXTENT PERMITTED BY LAW. WE DISCLAIM WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT UNINTERRUPTED OR ERROR-FREE SERVICE.
          </p>
        </PolicySection>

        <PolicySection title="Limitation of liability">
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, SNEAKER VAULT SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL
            DAMAGES ARISING FROM YOUR USE OF THE SITE OR PRODUCTS. OUR TOTAL LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE AMOUNT YOU PAID
            FOR THE ORDER GIVING RISE TO THE CLAIM.
          </p>
        </PolicySection>

        <PolicySection title="Indemnification">
          <p>
            You agree to indemnify and hold Sneaker Vault harmless from claims arising from your misuse of the Site, violation of these
            terms, or infringement of third-party rights.
          </p>
        </PolicySection>

        <PolicySection title="Governing law">
          <p>
            These terms are governed by the laws of the State of New York, USA, without regard to conflict-of-law principles. Disputes
            shall be resolved in the courts of New York County, except where consumer protection laws require otherwise.
          </p>
        </PolicySection>

        <PolicySection title="Changes">
          <p>
            We may modify these Terms at any time. Material changes will be indicated by updating the date above. Your continued use
            after changes constitutes acceptance.
          </p>
        </PolicySection>

        <PolicySection title="Contact">
          <p>
            For questions about these Terms, contact{' '}
            <a href="mailto:legal@sneakervault.com" className="text-gold hover:underline">legal@sneakervault.com</a>
            {' '}or our <Link to="/contact" className="text-gold hover:underline">Contact</Link> page.
          </p>
        </PolicySection>
      </motion.div>

      <div className="mt-10 flex flex-wrap gap-3 justify-center text-sm">
        <Link to="/privacy" className="btn-ghost">Privacy Policy</Link>
        <Link to="/faq" className="btn-ghost">FAQ</Link>
        <Link to="/contact" className="btn-gold">Contact Us</Link>
      </div>
    </div>
  );
}
