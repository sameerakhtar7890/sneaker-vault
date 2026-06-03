import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicLayout from './layouts/PublicLayout.jsx';

import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminCoupons from './pages/admin/AdminCoupons.jsx';
import AdminSizeGuides from './pages/admin/AdminSizeGuides.jsx';
import AdminReturns from './pages/admin/AdminReturns.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="returns" element={<AdminReturns />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="size-guides" element={<AdminSizeGuides />} />
      </Route>

      <Route path="/*" element={<PublicLayout />} />
    </Routes>
  );
}
