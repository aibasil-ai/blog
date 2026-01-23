import SiteShell from '../components/SiteShell'
import Seo from '../components/Seo'

function About() {
  return (
    <SiteShell>
      <Seo title="關於" description="關於 Josh 與這個部落格的介紹。" />
      <section className="rounded-lg border border-neutral-200 bg-card p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-neutral-600">About</p>
            <h1 className="text-3xl font-extrabold text-neutral-900">
              關於 Josh
            </h1>
            <p className="max-w-2xl text-base text-neutral-700">
              我是 Josh，這裡是我的個人筆記與部落格。
              我關注閱讀體驗、前端實作與內容設計，
              也會記錄正在做的專案與長期觀察。
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-neutral-200 bg-background p-6">
              <h2 className="text-lg font-semibold text-neutral-900">我在做什麼</h2>
              <p className="mt-2 text-sm text-neutral-700">
                將內容整理成清楚的系統，讓閱讀成為一種穩定的節奏。
                設計上偏好極簡、乾淨與安靜的介面，
                並用前端實作把想法落地。
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-background p-6">
              <h2 className="text-lg font-semibold text-neutral-900">這裡有什麼</h2>
              <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                <li>閱讀體驗與排版設計的筆記</li>
                <li>前端開發流程與工具整理</li>
                <li>個人專案與產品觀察</li>
              </ul>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-background p-6">
              <h2 className="text-lg font-semibold text-neutral-900">寫作頻率</h2>
              <p className="mt-2 text-sm text-neutral-700">
                每週更新 1-2 篇，主要集中在專案整理與閱讀心得。
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-background p-6">
              <h2 className="text-lg font-semibold text-neutral-900">聯絡方式</h2>
              <p className="mt-2 text-sm text-neutral-700">
                若你想交流或合作，歡迎透過社群或 Email 聯繫我。
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  )
}

export default About
