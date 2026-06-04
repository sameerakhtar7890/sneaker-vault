import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import api from '../utils/api';

const STORAGE_KEY = 'sv_compare';
export const MAX_COMPARE = 3;

const CompareCtx = createContext(null);
export const useCompare = () => useContext(CompareCtx);

function readLocalIds() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocalIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_COMPARE)));
}

export function CompareProvider({ children }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [compareIds, setCompareIds] = useState(() => readLocalIds());
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        const { data } = await api.get('/compare');
        setProducts(data);
        setCompareIds(data.map(p => p._id));
      } else {
        const ids = readLocalIds();
        setCompareIds(ids);
        if (!ids.length) {
          setProducts([]);
          return;
        }
        const { data } = await api.get('/compare/by-ids', { params: { ids: ids.join(',') } });
        setProducts(data);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      loadProducts();
      return;
    }
    const localIds = readLocalIds();
    if (localIds.length) {
      api.post('/compare/sync', { productIds: localIds })
        .then(() => {
          writeLocalIds([]);
          loadProducts();
        })
        .catch(() => loadProducts());
    } else {
      loadProducts();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const isInCompare = useCallback(
    id => compareIds.some(cid => String(cid) === String(id)),
    [compareIds]
  );

  const addToCompare = useCallback(async (productId) => {
    const id = String(productId);
    if (isInCompare(id)) {
      addToast('Already in compare list', 'error');
      return false;
    }
    if (compareIds.length >= MAX_COMPARE) {
      addToast(`You can compare up to ${MAX_COMPARE} products`, 'error');
      return false;
    }

    const nextIds = [...compareIds, id];
    setCompareIds(nextIds);
    writeLocalIds(nextIds);

    if (user) {
      try {
        const { data } = await api.post('/compare', { productId: id });
        setCompareIds(data.ids);
        setProducts(data.products);
        addToast('Added to compare');
        return true;
      } catch (err) {
        const msg = err?.response?.data?.message || 'Could not add to compare';
        addToast(msg, 'error');
        setCompareIds(compareIds);
        writeLocalIds(compareIds);
        return false;
      }
    }

    await loadProducts();
    addToast('Added to compare');
    return true;
  }, [compareIds, isInCompare, user, loadProducts, addToast]);

  const removeFromCompare = useCallback(async (productId) => {
    const id = String(productId);
    const nextIds = compareIds.filter(cid => String(cid) !== id);
    setCompareIds(nextIds);
    writeLocalIds(nextIds);

    if (user) {
      try {
        const { data } = await api.delete(`/compare/${id}`);
        setCompareIds(data.ids);
        setProducts(data.products);
      } catch {
        loadProducts();
      }
    } else {
      setProducts(prev => prev.filter(p => String(p._id) !== id));
    }
    addToast('Removed from compare');
  }, [compareIds, user, loadProducts, addToast]);

  const toggleCompare = useCallback(async (productId) => {
    if (isInCompare(productId)) {
      await removeFromCompare(productId);
      return false;
    }
    return addToCompare(productId);
  }, [isInCompare, addToCompare, removeFromCompare]);

  const clearCompare = useCallback(async () => {
    setCompareIds([]);
    setProducts([]);
    writeLocalIds([]);
    if (user) {
      try {
        await api.delete('/compare');
      } catch {
        /* ignore */
      }
    }
    addToast('Compare list cleared');
  }, [user, addToast]);

  const count = useMemo(() => compareIds.length, [compareIds]);

  return (
    <CompareCtx.Provider value={{
      products,
      compareIds,
      count,
      loading,
      isInCompare,
      addToCompare,
      removeFromCompare,
      toggleCompare,
      clearCompare,
      refresh: loadProducts
    }}>
      {children}
    </CompareCtx.Provider>
  );
}
