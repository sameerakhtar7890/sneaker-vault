import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/admin',          label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products',  icon: Package },
  { to: '/admin/orders',   label: 'Orders',    icon: ShoppingBag },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 glass border-r border-white/10 flex flex-col py-8 px-4">
        <div className="mb-10 px-2">
          <p className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase mb-1">Admin Panel</p>
          <p className="font-display text-xl">Sneaker <span className="text-gold">Vault</span></p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition
                 ${isActive ? 'bg-gold/10 text-gold' : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'}`
              }>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400
                     hover:text-red-400 hover:bg-red-500/10 transition mt-4">
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
