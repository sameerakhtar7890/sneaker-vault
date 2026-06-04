import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import CartDrawer from '../components/CartDrawer.jsx';
import OfflineBanner from '../components/OfflineBanner.jsx';
import PWAInstallPrompt from '../components/PWAInstallPrompt.jsx';
import PageSeo from '../components/PageSeo.jsx';
import PageTransition from '../components/PageTransition.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';

import Home from '../pages/Home.jsx';
import Shop from '../pages/Shop.jsx';
import Detail from '../pages/Detail.jsx';
import Checkout from '../pages/Checkout.jsx';
import Success from '../pages/Success.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import About from '../pages/About.jsx';
import Contact from '../pages/Contact.jsx';
import Profile from '../pages/Profile.jsx';
import Wishlist from '../pages/Wishlist.jsx';
import Compare from '../pages/Compare.jsx';
import OrderTracking from '../pages/OrderTracking.jsx';
import NewsletterUnsubscribe from '../pages/NewsletterUnsubscribe.jsx';
import FAQ from '../pages/FAQ.jsx';
import ShippingReturns from '../pages/ShippingReturns.jsx';

export default function PublicLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <PageSeo />
      <OfflineBanner />
      <Navbar />
      <CartDrawer />
      <PWAInstallPrompt />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<Detail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/shipping" element={<ShippingReturns />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order/:id" element={<OrderTracking />} />
              <Route path="/success" element={<Success />} />
              <Route path="/newsletter/unsubscribe" element={<NewsletterUnsubscribe />} />
            </Routes>
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
