import Head from 'next/head'
import { useRouter } from 'next/router'
import site from '../config/site'

type SeoProps = {
  title?: string
  description?: string
  type?: 'website' | 'article'
  image?: string
}

function Seo({ title, description, type = 'website', image }: SeoProps) {
  const { asPath } = useRouter()
  const metaTitle = title ? `${title} | ${site.name}` : site.name
  const metaDescription = description ?? site.description
  const url = new URL(asPath ?? '/', site.url).toString()
  const imageUrl = new URL(image ?? site.ogImage, site.url).toString()

  return (
    <Head>
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
    </Head>
  )
}

export default Seo
