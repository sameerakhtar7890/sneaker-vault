import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Github } from 'lucide-react';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border-t border-white/10 bg-ink-950/80 backdrop-blur-xl mt-auto"
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="font-display text-2xl text-gold tracking-widest inline-block mb-4 hover:opacity-90 transition-opacity">
              VAULT.
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              The ultimate destination for premium sneakers. Discover exclusive drops, classic silhouettes, and future grails.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 rounded-full glass hover:bg-gold/10 text-zinc-500 hover:text-gold transition-all duration-300 hover:scale-110"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide uppercase text-sm">Shop</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link to="/shop" className="link-premium">All Sneakers</Link></li>
              <li><Link to="/shop?brand=Nike" className="link-premium">Nike</Link></li>
              <li><Link to="/shop?brand=Adidas" className="link-premium">Adidas</Link></li>
              <li><Link to="/shop?brand=Jordan" className="link-premium">Jordan</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide uppercase text-sm">Support</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link to="/about" className="link-premium">About Us</Link></li>
              <li><Link to="/contact" className="link-premium">Contact Us</Link></li>
              <li><Link to="/faq" className="link-premium">FAQ</Link></li>
              <li><Link to="/shipping" className="link-premium">Shipping & Returns</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide uppercase text-sm">Stay Updated</h3>
            <p className="text-sm text-zinc-400 mb-4">Subscribe for exclusive drops and early access.</p>
            <form className="flex" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="input-premium rounded-l-xl rounded-r-none border-r-0"
              />
              <button className="bg-gold text-ink-950 px-5 font-semibold rounded-r-xl hover:bg-gold-soft transition-all duration-300 text-sm hover:shadow-glow-sm">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-xs">
            &copy; {new Date().getFullYear()} Sneaker Vault. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-zinc-500">
            <Link to="/privacy" className="link-premium">Privacy Policy</Link>
            <Link to="/terms" className="link-premium">Terms of Service</Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
