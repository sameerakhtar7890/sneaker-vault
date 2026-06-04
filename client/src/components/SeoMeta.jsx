import { Helmet } from 'react-helmet-async';
import { toAbsoluteUrl } from '../utils/seo';

export default function SeoMeta({
  title,
  description,
  ogImage,
  ogType = 'website',
  canonical,
  noIndex = false,
  siteName = 'Sneaker Vault',
  twitterCard = 'summary_large_image',
  siteUrl
}) {
  const absImage = toAbsoluteUrl(ogImage, siteUrl);
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : '');

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {absImage && <meta property="og:image" content={absImage} />}
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {absImage && <meta name="twitter:image" content={absImage} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
