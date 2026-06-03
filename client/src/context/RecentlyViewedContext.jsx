import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const STORAGE_KEY = 'sv_recent';
const MAX_ITEMS = 12;

const RecentlyViewedCtx = createContext(null);
export const useRecentlyViewed = () => useContext(RecentlyViewedCtx);

function readLocalIds() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocalIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_ITEMS)));
}

export function RecentlyViewedProvider({ children }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        const { data } = await api.get('/recently-viewed');
        setProducts(data);
      } else {
        const ids = readLocalIds();
        if (!ids.length) {
          setProducts([]);
          return;
        }
        const { data } = await api.get('/recently-viewed/by-ids', {
          params: { ids: ids.join(',') }
        });
        setProducts(data);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const trackView = useCallback(async (product) => {
    if (!product?._id) return;

    const id = product._id;
    const ids = readLocalIds().filter(x => x !== id);
    ids.unshift(id);
    writeLocalIds(ids);

    if (user) {
      try {
        await api.post('/recently-viewed', { productId: id });
      } catch (err) {
        console.error('Failed to sync recently viewed', err);
      }
    }

    await loadProducts();
  }, [user, loadProducts]);

  useEffect(() => {
    if (!user) {
      loadProducts();
      return;
    }

    const localIds = readLocalIds();
    if (localIds.length) {
      api.post('/recently-viewed/sync', { productIds: localIds })
        .then(() => loadProducts())
        .catch(() => loadProducts());
    } else {
      loadProducts();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <RecentlyViewedCtx.Provider value={{ products, loading, trackView, refresh: loadProducts }}>
      {children}
    </RecentlyViewedCtx.Provider>
  );
}
