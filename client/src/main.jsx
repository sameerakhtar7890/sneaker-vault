import './pwa-install-capture.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext.jsx';
import { CompareProvider } from './context/CompareContext.jsx';
import { PWAProvider } from './context/PWAContext.jsx';
import { SeoProvider } from './context/SeoContext.jsx';
import PWAUpdateNotifier from './components/PWAUpdateNotifier.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
    <BrowserRouter>
      <AuthProvider>
        <SeoProvider>
        <RecentlyViewedProvider>
        <ToastProvider>
          <PWAProvider>
            <CompareProvider>
              <CartProvider>
                <PWAUpdateNotifier />
                <App />
              </CartProvider>
            </CompareProvider>
          </PWAProvider>
        </ToastProvider>
        </RecentlyViewedProvider>
        </SeoProvider>
      </AuthProvider>
    </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
