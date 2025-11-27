import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';

type JSONLD = Record<string, unknown> | Array<Record<string, unknown>>;

type SEOProps = {
  title: string;
  description?: string;
  canonical?: string;
  openGraphImage?: string;
  ogType?: 'website' | 'article' | 'profile' | string;
  jsonLd?: JSONLD;
  children?: ReactNode;
};

export function SEO({
  title,
  description,
  canonical,
  openGraphImage,
  ogType = 'website',
  jsonLd,
  children,
}: SEOProps) {
  const siteName = 'Harshith K — Data, AI & Analytics';
  const jsonLdArray = jsonLd
    ? Array.isArray(jsonLd)
      ? (jsonLd as Array<Record<string, unknown>>)
      : ([jsonLd] as Array<Record<string, unknown>>)
    : [];

  return (
    <Helmet>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      <meta property="og:title" content={title} />
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={ogType} />
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      {openGraphImage ? <meta property="og:image" content={openGraphImage} /> : null}
      {jsonLdArray.map((entry, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(entry)}
        </script>
      ))}
      {children}
    </Helmet>
  );
}
