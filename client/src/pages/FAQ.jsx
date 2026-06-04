import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import FaqAccordion from '../components/FaqAccordion';

const SECTIONS = [
  {
    title: 'Orders & Checkout',
    items: [
      {
        q: 'Do I need an account to place an order?',
        a: (
          <>
            No. You can check out as a guest with your email and shipping details. Creating an account lets you track orders, save addresses, and manage returns from your{' '}
            <Link to="/profile" className="text-gold hover:underline">profile</Link>.
          </>
        )
      },
      {
        q: 'Which payment methods do you accept?',
        a: 'We accept major cards via Stripe secure checkout. In demo mode (when Stripe is not configured), you can place test orders without a real charge.'
      },
      {
        q: 'Can I use a promo code?',
        a: 'Yes. Enter your code on the checkout page before payment. Valid codes apply a discount to your order total automatically.'
      },
      {
        q: 'Will I receive an order confirmation email?',
        a: 'Yes. A confirmation is sent to the email you provide at checkout (which can differ from your account email). Make sure it is spelled correctly and check your spam folder.'
      }
    ]
  },
  {
    title: 'Products & Sizing',
    items: [
      {
        q: 'Are your sneakers authentic?',
        a: 'Every pair in the Vault is curated and listed with accurate brand, imagery, and descriptions. We stand behind the quality of what we sell.'
      },
      {
        q: 'How do I choose the right size?',
        a: (
          <>
            Use the size selector on each product page. Tap <strong className="text-zinc-300">Size Guide</strong> on the product or shop page for brand-specific US sizing charts.
          </>
        )
      },
      {
        q: 'What if an item is out of stock?',
        a: 'Out-of-stock sizes cannot be added to cart. Limited-stock items show a low-inventory badge — we recommend ordering soon when your size is available.'
      }
    ]
  },
  {
    title: 'Account & Features',
    items: [
      {
        q: 'What is the wishlist?',
        a: (
          <>
            Save pairs you love from any product card. View them anytime on your{' '}
            <Link to="/wishlist" className="text-gold hover:underline">wishlist</Link>.
          </>
        )
      },
      {
        q: 'How does Compare work?',
        a: (
          <>
            Add up to three products to compare specs side by side. Open{' '}
            <Link to="/compare" className="text-gold hover:underline">Compare</Link> from the navbar to review price, sizes, ratings, and more.
          </>
        )
      },
      {
        q: 'Can I save multiple shipping addresses?',
        a: (
          <>
            Yes, when logged in. Go to <Link to="/profile" className="text-gold hover:underline">Profile → Address Book</Link> to add, edit, or set a default address for faster checkout.
          </>
        )
      },
      {
        q: 'Can I install Sneaker Vault as an app?',
        a: 'Yes. Use Install in the navbar or footer to add the site to your home screen for quicker access and offline browsing of saved products.'
      }
    ]
  },
  {
    title: 'Returns & Support',
    items: [
      {
        q: 'How do I return an item?',
        a: (
          <>
            Delivered orders can be returned within 30 days. Open the order from{' '}
            <Link to="/profile" className="text-gold hover:underline">Profile → Order History</Link> or order tracking, then submit a return request. See our{' '}
            <Link to="/shipping" className="text-gold hover:underline">Shipping & Returns</Link> page for full details.
          </>
        )
      },
      {
        q: 'How do I contact support?',
        a: (
          <>
            Visit our <Link to="/contact" className="text-gold hover:underline">Contact</Link> page or email support@sneakervault.com. Include your order ID for faster help.
          </>
        )
      }
    ]
  }
];

export default function FAQ() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <HelpCircle className="mx-auto text-gold mb-4" size={40} />
        <p className="section-eyebrow mb-2">HELP CENTER</p>
        <h1 className="font-display text-4xl md:text-5xl mb-3">Frequently Asked Questions</h1>
        <p className="text-zinc-400 text-sm max-w-lg mx-auto">
          Quick answers about orders, sizing, returns, and your Sneaker Vault account.
        </p>
      </motion.div>

      <div className="space-y-10">
        {SECTIONS.map((section, i) => (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <h2 className="font-display text-xl text-gold mb-4">{section.title}</h2>
            <FaqAccordion items={section.items} />
          </motion.section>
        ))}
      </div>

      <div className="mt-12 glass rounded-2xl p-6 text-center">
        <p className="text-zinc-400 text-sm mb-4">Still need help?</p>
        <Link to="/contact" className="btn-gold text-sm">Contact Support</Link>
      </div>
    </div>
  );
}
