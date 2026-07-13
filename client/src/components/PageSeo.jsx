import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SeoMeta from './SeoMeta';
import { useSeo } from '../context/SeoContext';

const SKIP_PREFIXES = ['/product/', '/admin'];

export default function PageSeo() {
  const { pathname } = useLocation();
  const { ready, getPageMeta } = useSeo();
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    if (!ready) return;
    if (SKIP_PREFIXES.some(p => pathname.startsWith(p))) {
      setMeta(null);
      return;
    }

    if (pathname.startsWith('/order/')) {
      setMeta({
        title: 'Order Tracking | Sneaker Vault',
        description: 'Track your Sneaker Vault order status.',
        noIndex: true
      });
      return;
    }

    setMeta(getPageMeta(pathname));
  }, [pathname, ready, getPageMeta]);

  if (!meta) return null;

  return <SeoMeta {...meta} />;
}
