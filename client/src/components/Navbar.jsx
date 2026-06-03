import { Link, NavLink } from 'react-router-dom';
import { ShoppingBag, Search, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { count, setOpen } = useCart();
  const link = ({ isActive }) =>
    `text-sm tracking-wide transition hover:text-gold ${isActive ? 'text-gold' : 'text-zinc-300'}`;

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
          <button className="p-2 rounded-full hover:bg-white/5"><Search size={18} /></button>
          <button className="p-2 rounded-full hover:bg-white/5"><User size={18} /></button>
          <button onClick={() => setOpen(true)}
                  className="relative p-2 rounded-full hover:bg-white/5">
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] bg-gold text-ink-950
                               rounded-full w-4 h-4 grid place-items-center font-bold">{count}</span>
            )}
          </button>
        </div>
      </div>
    </motion.header>
  );
}
