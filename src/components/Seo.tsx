import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import site from '../config/site'

type SeoProps = {
  title?: string
  description?: string
  type?: 'website' | 'article'
  image?: string
}

function Seo({ title, description, type = 'website', image }: SeoProps) {
  const { pathname } = useLocation()
  const metaTitle = title ? `${title} | ${site.name}` : site.name
  const metaDescription = description ?? site.description
  const url = new URL(pathname, site.url).toString()
  const imageUrl = new URL(image ?? site.ogImage, site.url).toString()

  return (
    <Helmet>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={imageUrl} />
      <link rel="canonical" href={url} />
    </Helmet>
  )
}

export default Seo
