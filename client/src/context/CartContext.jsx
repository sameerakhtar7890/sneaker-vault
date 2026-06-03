import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react';

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD': {
      const key = `${action.item._id}-${action.item.size}`;
      const existing = state.find(i => i.key === key);
      if (existing) return state.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...action.item, key, qty: 1 }];
    }
    case 'REMOVE': return state.filter(i => i.key !== action.key);
    case 'QTY':    return state.map(i => i.key === action.key ? { ...i, qty: Math.max(1, action.qty) } : i);
    case 'CLEAR':  return [];
    case 'HYDRATE':return action.state || [];
    default: return state;
  }
};

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [open, setOpen] = useState(false);
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('sv_wish') || '[]'));

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('sv_cart') || '[]');
    dispatch({ type: 'HYDRATE', state: saved });
  }, []);
  useEffect(() => { localStorage.setItem('sv_cart', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem('sv_wish', JSON.stringify(wishlist)); }, [wishlist]);

  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);

  const toggleWish = (id) =>
    setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);

  return (
    <CartCtx.Provider value={{
      items, total, count, open, setOpen,
      add: (item) => { dispatch({ type:'ADD', item }); setOpen(true); },
      remove: (key) => dispatch({ type:'REMOVE', key }),
      setQty: (key, qty) => dispatch({ type:'QTY', key, qty }),
      clear: () => dispatch({ type:'CLEAR' }),
      wishlist, toggleWish
    }}>{children}</CartCtx.Provider>
  );
}
