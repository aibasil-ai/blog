import SiteShell from '../components/SiteShell'
import Seo from '../components/Seo'
import { Button } from '../components/ui/button'

function Subscribe() {
  return (
    <SiteShell>
      <Seo title="訂閱" description="訂閱 Josh 的最新文章與筆記。" />
      <section className="rounded-lg border border-neutral-200 bg-card p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-neutral-600">
              Subscribe
            </p>
            <h1 className="text-3xl font-extrabold text-neutral-900">
              訂閱 Josh 的筆記
            </h1>
            <p className="max-w-2xl text-base text-neutral-700">
              每週整理精選文章與觀察，保持內容節奏感，讓你用更輕鬆的方式跟上更新。
            </p>
          </div>
          <form className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-background p-6 sm:flex-row">
            <input
              type="email"
              name="email"
              placeholder="輸入你的 Email"
              className="h-11 flex-1 rounded-md border border-neutral-200 bg-white px-4 text-base text-neutral-900 outline-none focus:border-brand-400"
            />
            <Button type="submit" className="h-11">
              訂閱
            </Button>
          </form>
          <div className="grid gap-4 text-sm text-neutral-700 md:grid-cols-2">
            <div className="rounded-lg border border-neutral-200 bg-background p-4">
              <p className="font-semibold text-neutral-900">更新頻率</p>
              <p className="mt-1">每週 1-2 封，專注於閱讀體驗與前端實作。</p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-background p-4">
              <p className="font-semibold text-neutral-900">內容形式</p>
              <p className="mt-1">重點摘要 + 精選連結，讓閱讀保持輕盈。</p>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  )
}

export default Subscribe
