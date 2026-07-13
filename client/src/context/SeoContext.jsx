import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../utils/api';
import { toAbsoluteUrl } from '../utils/seo';

const SeoCtx = createContext(null);
export const useSeo = () => useContext(SeoCtx);

const FALLBACK = {
  siteName: 'Sneaker Vault',
  titleSuffix: 'Sneaker Vault',
  defaultDescription: 'Discover luxury sneakers, exclusive drops, and curated grails at Sneaker Vault.',
  defaultOgImage: '/pwa-512.png',
  siteUrl: typeof window !== 'undefined' ? window.location.origin : '',
  twitterCard: 'summary_large_image',
  pages: []
};

export function SeoProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.get('/seo')
      .then(r => {
        const data = r.data;
        setSettings({
          ...data,
          defaultOgImage: data.defaultOgImage || toAbsoluteUrl('/pwa-512.png', data.siteUrl),
          siteUrl: data.siteUrl || window.location.origin
        });
      })
      .catch(() => setSettings(FALLBACK))
      .finally(() => setReady(true));
  }, []);

  const getPageMeta = useCallback((pathname) => {
    const path = pathname.split('?')[0] || '/';
    const page = settings.pages?.find(p => p.path === path);
    const siteUrl = settings.siteUrl || window.location.origin;

    const title = page?.title
      ? `${page.title} | ${settings.titleSuffix || settings.siteName}`
      : settings.siteName;
    const description = (page?.description || settings.defaultDescription || '').slice(0, 160);
    const ogImage = toAbsoluteUrl(page?.ogImage || settings.defaultOgImage, siteUrl);

    return {
      title,
      description,
      ogImage,
      ogType: 'website',
      canonical: `${siteUrl.replace(/\/$/, '')}${path === '/' ? '' : path}`,
      noIndex: Boolean(page?.noIndex),
      siteName: settings.siteName,
      twitterCard: settings.twitterCard,
      siteUrl
    };
  }, [settings]);

  const fetchProductMeta = useCallback(async (slug) => {
    try {
      const { data } = await api.get(`/seo/product/${slug}`);
      return { ...data, siteName: settings.siteName, twitterCard: settings.twitterCard, siteUrl: settings.siteUrl };
    } catch {
      return null;
    }
  }, [settings]);

  return (
    <SeoCtx.Provider value={{ settings, ready, getPageMeta, fetchProductMeta }}>
      {children}
    </SeoCtx.Provider>
  );
}
