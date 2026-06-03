import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, LayoutDashboard, LogIn, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { count, setOpen } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const link = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;

  const handleLogout = () => { logout(); setDropOpen(false); navigate('/'); };

  const iconBtn = 'p-2.5 rounded-full transition-all duration-300 hover:bg-white/[0.06] hover:scale-105 active:scale-95';

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-40 border-b transition-all duration-500 ${
        scrolled
          ? 'bg-ink-950/90 backdrop-blur-2xl border-white/10 shadow-lg shadow-black/20'
          : 'bg-ink-950/50 backdrop-blur-xl border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-xl tracking-widest transition-opacity duration-300 hover:opacity-90">
          SNEAKER <span className="text-gold">VAULT</span>
        </Link>

        <nav className="hidden md:flex gap-10">
          <NavLink to="/" end className={link}>Home</NavLink>
          <NavLink to="/shop" className={link}>Shop</NavLink>
          <NavLink to="/shop?featured=true" className={link}>Featured</NavLink>
        </nav>

        <div className="flex items-center gap-1">
          <Link to="/wishlist" className={iconBtn} aria-label="Wishlist">
            <Heart size={18} className="text-zinc-300 hover:text-gold transition-colors" />
          </Link>

          <button id="nav-cart" onClick={() => setOpen(true)} className={`${iconBtn} relative`} aria-label="Cart">
            <ShoppingBag size={18} />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 text-[10px] bg-gold text-ink-950
                             rounded-full min-w-[18px] h-[18px] px-1 grid place-items-center font-bold shadow-glow-sm"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {user ? (
            <div className="relative ml-1" ref={dropRef}>
              <button id="nav-user" onClick={() => setDropOpen(d => !d)} className={`${iconBtn} flex items-center gap-2`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/30 to-gold/5 border border-gold/40 flex items-center justify-center">
                  <span className="text-gold text-xs font-bold">{user.name?.[0]?.toUpperCase()}</span>
                </div>
              </button>

              <AnimatePresence>
                {dropOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -8 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-12 w-52 glass-strong rounded-2xl py-2 shadow-card overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-white/10 mb-1">
                      <p className="text-sm font-medium text-zinc-100 truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-gold hover:bg-gold/5 transition-colors">
                      <User size={14} /> My Profile
                    </Link>
                    {user.isAdmin && (
                      <Link to="/admin" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-gold hover:bg-gold/5 transition-colors">
                        <LayoutDashboard size={14} /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-zinc-300
                                 hover:text-red-400 hover:bg-red-500/5 transition-colors">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link id="nav-login" to="/login"
              className="ml-2 flex items-center gap-1.5 text-sm text-zinc-300 hover:text-gold
                         transition-all duration-300 px-4 py-2 rounded-full hover:bg-white/[0.06] border border-transparent hover:border-gold/20">
              <LogIn size={16} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
