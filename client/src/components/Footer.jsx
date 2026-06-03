import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-950 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Brand & Description */}
          <div className="md:col-span-1">
            <Link to="/" className="font-display text-2xl text-gold tracking-widest inline-block mb-4">
              VAULT.
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              The ultimate destination for premium sneakers. Discover exclusive drops, classic silhouettes, and future grails.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-zinc-500 hover:text-gold transition"><Facebook size={18} /></a>
              <a href="#" className="text-zinc-500 hover:text-gold transition"><Twitter size={18} /></a>
              <a href="#" className="text-zinc-500 hover:text-gold transition"><Instagram size={18} /></a>
              <a href="#" className="text-zinc-500 hover:text-gold transition"><Github size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide uppercase text-sm">Shop</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link to="/shop" className="hover:text-gold transition">All Sneakers</Link></li>
              <li><Link to="/shop?brand=Nike" className="hover:text-gold transition">Nike</Link></li>
              <li><Link to="/shop?brand=Adidas" className="hover:text-gold transition">Adidas</Link></li>
              <li><Link to="/shop?brand=Jordan" className="hover:text-gold transition">Jordan</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide uppercase text-sm">Support</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link to="/about" className="hover:text-gold transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-gold transition">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:text-gold transition">Shipping & Returns</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide uppercase text-sm">Stay Updated</h3>
            <p className="text-sm text-zinc-400 mb-4">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <form className="flex" onSubmit={e => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/5 border border-white/10 rounded-l-xl px-4 py-2.5 text-sm w-full focus:outline-none focus:border-gold/50"
              />
              <button className="bg-gold text-ink-950 px-4 font-semibold rounded-r-xl hover:bg-gold/90 transition text-sm">
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-xs">
            &copy; {new Date().getFullYear()} Sneaker Vault. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-zinc-500">
            <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
