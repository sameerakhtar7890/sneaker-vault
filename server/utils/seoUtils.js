const DESC_MAX = 160;

export function truncateDescription(text, max = DESC_MAX) {
  if (!text) return '';
  const clean = String(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 3)}...`;
}

export function resolveSiteUrl(settings) {
  return (settings?.siteUrl || process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function toAbsoluteUrl(pathOrUrl, siteUrl) {
  if (!pathOrUrl) return siteUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = siteUrl.replace(/\/$/, '');
  return `${base}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function buildProductMeta(product, settings) {
  const siteUrl = resolveSiteUrl(settings);
  const title = product.seoTitle?.trim()
    || `${product.name} — ${product.brand}`;
  const description = truncateDescription(
    product.seoDescription?.trim()
    || product.description
    || settings.defaultDescription
  );
  const ogImage = toAbsoluteUrl(
    product.ogImage?.trim() || product.images?.[0] || settings.defaultOgImage,
    siteUrl
  );

  return {
    title: `${title} | ${settings.titleSuffix || settings.siteName}`,
    description,
    ogImage,
    ogType: 'product',
    canonical: `${siteUrl}/product/${product.slug}`,
    noIndex: false
  };
}

export function buildPageMeta(path, settings) {
  const siteUrl = resolveSiteUrl(settings);
  const page = settings.pages?.find(p => p.path === path);
  const title = page?.title?.trim()
    || settings.siteName;
  const description = truncateDescription(
    page?.description?.trim() || settings.defaultDescription
  );
  const ogImage = toAbsoluteUrl(
    page?.ogImage?.trim() || settings.defaultOgImage,
    siteUrl
  );

  return {
    title: page?.title ? `${page.title} | ${settings.titleSuffix || settings.siteName}` : title,
    description,
    ogImage,
    ogType: 'website',
    canonical: `${siteUrl}${path === '/' ? '' : path}`,
    noIndex: Boolean(page?.noIndex)
  };
}
