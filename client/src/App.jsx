import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Public pages
import Home      from './pages/Home.jsx';
import Shop      from './pages/Shop.jsx';
import Detail    from './pages/Detail.jsx';
import Checkout  from './pages/Checkout.jsx';
import Success   from './pages/Success.jsx';
import Login     from './pages/Login.jsx';
import Register  from './pages/Register.jsx';
import About     from './pages/About.jsx';
import Contact   from './pages/Contact.jsx';
import Profile   from './pages/Profile.jsx';
import Wishlist  from './pages/Wishlist.jsx';
import OrderTracking from './pages/OrderTracking.jsx';

// Admin pages
import AdminLayout    from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProducts  from './pages/admin/AdminProducts.jsx';
import AdminOrders    from './pages/admin/AdminOrders.jsx';

export default function App() {
  return (
    <Routes>
      {/* ── Admin (no public Navbar/Footer) ── */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index          element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders"   element={<AdminOrders />} />
      </Route>

      {/* ── Public (with Navbar + Footer) ── */}
      <Route path="/*" element={
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <CartDrawer />
          <main className="flex-1">
            <Routes>
              <Route path="/"          element={<Home />} />
              <Route path="/shop"      element={<Shop />} />
              <Route path="/product/:slug" element={<Detail />} />
              <Route path="/about"     element={<About />} />
              <Route path="/contact"   element={<Contact />} />
              <Route path="/login"     element={<Login />} />
              <Route path="/register"  element={<Register />} />
              <Route path="/wishlist"  element={<Wishlist />} />
              <Route path="/profile"   element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/checkout"  element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              <Route path="/order/:id" element={
                <ProtectedRoute>
                  <OrderTracking />
                </ProtectedRoute>
              } />
              <Route path="/success"   element={<Success />} />
            </Routes>
          </main>
          <Footer />
        </div>
      } />
    </Routes>
  );
}
