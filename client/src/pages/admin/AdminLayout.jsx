import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Tag, Ruler, RotateCcw, Mail, Globe, Truck, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SeoMeta from '../../components/SeoMeta';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/returns', label: 'Returns', icon: RotateCcw },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag },
  { to: '/admin/size-guides', label: 'Size Guides', icon: Ruler },
  { to: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { to: '/admin/seo', label: 'SEO', icon: Globe },
  { to: '/admin/shipping-zones', label: 'Shipping', icon: Truck },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen flex bg-ink-950">
      <SeoMeta title="Admin Panel | Sneaker Vault" description="Sneaker Vault administration" noIndex />
      <aside className="w-60 shrink-0 glass-strong border-r border-white/10 flex flex-col py-8 px-4">
        <div className="mb-10 px-2">
          <p className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase mb-1">Admin Panel</p>
          <p className="font-display text-xl">Sneaker <span className="text-gold">Vault</span></p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300
                 ${isActive
                   ? 'bg-gold/15 text-gold border border-gold/20 shadow-glow-sm'
                   : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-transparent'}`
              }>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400
                     hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 mt-4"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
