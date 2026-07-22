import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Anjeel Upreti | Portfolio'
const DEFAULT_DESCRIPTION =
  'Anjeel Upreti — Software Engineer specializing in Django, Odoo, and PostgreSQL.'

/**
 * Per-route document title, meta description, and Open Graph/Twitter Card tags.
 * `jsonLd`, if provided, is injected as a <script type="application/ld+json"> block
 * for structured data (Person/Article schema).
 */
export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  url,
  type = 'website',
  jsonLd,
}) {
  const fullTitle = title ? `${title} | Anjeel Upreti` : SITE_NAME
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : undefined)

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {image && <meta property="og:image" content={image} />}
      <meta property="og:site_name" content="Anjeel Upreti" />

      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}
