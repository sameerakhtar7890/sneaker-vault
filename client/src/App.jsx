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
import AdminNewsletter from './pages/admin/AdminNewsletter.jsx';
import AdminSeo from './pages/admin/AdminSeo.jsx';
import AdminShippingZones from './pages/admin/AdminShippingZones.jsx';
import AdminReviews from './pages/admin/AdminReviews.jsx';
import AdminHero from './pages/admin/AdminHero.jsx';
import AdminEmailTemplates from './pages/admin/AdminEmailTemplates.jsx';

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
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="size-guides" element={<AdminSizeGuides />} />
        <Route path="newsletter" element={<AdminNewsletter />} />
        <Route path="seo" element={<AdminSeo />} />
        <Route path="shipping-zones" element={<AdminShippingZones />} />
        <Route path="hero" element={<AdminHero />} />
        <Route path="email-templates" element={<AdminEmailTemplates />} />
      </Route>

      <Route path="/*" element={<PublicLayout />} />
    </Routes>
  );
}
