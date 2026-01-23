import Link from 'next/link'
import SiteShell from '../components/SiteShell'
import Seo from '../components/Seo'

function NotFound() {
  return (
    <SiteShell>
      <Seo title="找不到頁面" />
      <section className="rounded-lg border border-neutral-200 bg-card px-6 py-12 text-center">
        <p className="text-2xl font-bold text-neutral-900">這個頁面不存在</p>
        <p className="mt-3 text-sm text-neutral-700">
          可能是網址輸入錯誤，或頁面已被移動。
        </p>
        <Link className="link-primary mt-6 inline-block text-sm" href="/">
          回到首頁
        </Link>
      </section>
    </SiteShell>
  )
}

export default NotFound
