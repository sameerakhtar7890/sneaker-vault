export function toAbsoluteUrl(pathOrUrl, siteUrl) {
  if (!pathOrUrl) return siteUrl || '';
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = (siteUrl || import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : ''))
    .replace(/\/$/, '');
  return `${base}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function truncate(text, max = 160) {
  if (!text) return '';
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 3)}...`;
}

export function productSeoFromProduct(product, global) {
  const siteUrl = global?.siteUrl || toAbsoluteUrl('/');
  const title = product.seoTitle?.trim()
    || `${product.name} — ${product.brand}`;
  const description = truncate(
    product.seoDescription?.trim() || product.description || global?.defaultDescription
  );
  const ogImage = toAbsoluteUrl(
    product.ogImage?.trim() || product.images?.[0] || global?.defaultOgImage,
    siteUrl
  );

  return {
    title: `${title} | ${global?.titleSuffix || global?.siteName || 'Sneaker Vault'}`,
    description,
    ogImage,
    ogType: 'product',
    canonical: `${siteUrl.replace(/\/$/, '')}/product/${product.slug}`,
    noIndex: false
  };
}
