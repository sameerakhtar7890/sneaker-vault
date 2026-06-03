import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, LayoutDashboard, LogIn, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { count, setOpen }      = useCart();
  const { user, logout }        = useAuth();
  const navigate                = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef                 = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const link = ({ isActive }) =>
    `text-sm tracking-wide transition hover:text-gold ${isActive ? 'text-gold' : 'text-zinc-300'}`;

  const handleLogout = () => { logout(); setDropOpen(false); navigate('/'); };

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 backdrop-blur-xl bg-ink-950/70 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link to="/" className="font-display text-xl tracking-widest">
          SNEAKER <span className="text-gold">VAULT</span>
        </Link>

        <nav className="hidden md:flex gap-8">
          <NavLink to="/" end className={link}>Home</NavLink>
          <NavLink to="/shop" className={link}>Shop</NavLink>
          <NavLink to="/shop?featured=true" className={link}>Featured</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {/* Wishlist */}
          <Link to="/wishlist" className="p-2 rounded-full hover:bg-white/5 transition">
            <Heart size={18} className="text-zinc-300 hover:text-gold" />
          </Link>

          {/* Cart */}
          <button id="nav-cart" onClick={() => setOpen(true)}
            className="relative p-2 rounded-full hover:bg-white/5 transition">
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] bg-gold text-ink-950
                               rounded-full w-4 h-4 grid place-items-center font-bold">{count}</span>
            )}
          </button>

          {/* User menu */}
          {user ? (
            <div className="relative" ref={dropRef}>
              <button id="nav-user" onClick={() => setDropOpen(d => !d)}
                className="flex items-center gap-2 p-2 rounded-full hover:bg-white/5 transition">
                <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                  <span className="text-gold text-xs font-bold">{user.name?.[0]?.toUpperCase()}</span>
                </div>
              </button>

              <AnimatePresence>
                {dropOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-48 glass rounded-xl py-2 shadow-2xl">
                    <div className="px-4 py-2 border-b border-white/10 mb-1">
                      <p className="text-sm font-medium text-zinc-100 truncate">{user.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setDropOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300
                                 hover:text-gold hover:bg-gold/5 transition">
                      <User size={14} /> My Profile
                    </Link>
                    {user.isAdmin && (
                      <Link to="/admin" onClick={() => setDropOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300
                                   hover:text-gold hover:bg-gold/5 transition">
                        <LayoutDashboard size={14} /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-zinc-300
                                 hover:text-red-400 hover:bg-red-500/5 transition">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link id="nav-login" to="/login"
              className="flex items-center gap-1.5 text-sm text-zinc-300 hover:text-gold
                         transition px-3 py-2 rounded-full hover:bg-white/5">
              <LogIn size={16} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
