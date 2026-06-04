import api from './api';

const STORAGE_KEY = 'sv_offline_catalog_v1';

export function loadOfflineCatalog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveOfflineCatalog(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function syncOfflineCatalog() {
  if (!navigator.onLine) return loadOfflineCatalog();
  try {
    const { data } = await api.get('/pwa/catalog');
    saveOfflineCatalog(data);
    return data;
  } catch {
    return loadOfflineCatalog();
  }
}

export function findProductBySlug(slug) {
  const catalog = loadOfflineCatalog();
  return catalog?.products?.find(p => p.slug === slug) || null;
}

function matchesQuery(product, q) {
  if (!q) return true;
  const term = q.toLowerCase();
  return (
    product.name?.toLowerCase().includes(term) ||
    product.brand?.toLowerCase().includes(term) ||
    product.description?.toLowerCase().includes(term)
  );
}

export function filterOfflineProducts(products, { q, brand, size, maxPrice, sort, featured }) {
  let list = [...(products || [])];

  if (featured === true || featured === 'true') {
    list = list.filter(p => p.featured);
  }
  if (brand && brand !== 'all') {
    list = list.filter(p => p.brand === brand);
  }
  if (size && size !== 'all') {
    const s = Number(size);
    list = list.filter(p => p.sizes?.includes(s));
  }
  if (maxPrice && maxPrice !== '1000') {
    list = list.filter(p => p.price <= Number(maxPrice));
  }
  if (q) {
    list = list.filter(p => matchesQuery(p, q));
  }

  switch (sort) {
    case 'price_asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'popular':
      list.sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0));
      break;
    default:
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return list;
}

export function paginateOffline(list, page = 1, limit = 6) {
  const total = list.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return {
    products: list.slice(start, start + limit),
    page,
    pages,
    total
  };
}
