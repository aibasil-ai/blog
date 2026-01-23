import Link from 'next/link'
import SiteShell from '../components/SiteShell'
import Seo from '../components/Seo'
import { Button } from '../components/ui/button'
import { posts } from '../content/posts'

const notes = [
  'Josh 調整標題字重與字距，讓中文標題更有呼吸感。',
  'Josh 把文章頁的行長控制在 38-42 字之間。',
  'Josh 認為留白不只是空間，而是視線的休息點。',
]

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17" cy="7" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M8.5 10.5v6" />
      <path d="M8.5 8.2h.01" />
      <path d="M12 16.5v-3.4a2 2 0 0 1 4 0v3.4" />
    </svg>
  )
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M15 22v-2.2c0-.9-.4-1.6-1.1-2 2.7-.3 5.5-1.4 5.5-6.3 0-1.3-.4-2.3-1.2-3.1.1-.3.5-1.6-.1-3.2 0 0-1-.3-3.2 1.2-.9-.3-1.9-.4-2.9-.4s-2 .1-2.9.4C7 4.9 6 5.2 6 5.2c-.6 1.6-.2 2.9-.1 3.2-.8.8-1.2 1.8-1.2 3.1 0 4.9 2.8 6 5.5 6.3-.5.4-.9 1.1-1 2v2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 19c-.7.6-2.2 1.2-3.5-.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const socials = [
  { label: 'Instagram', href: '#', icon: InstagramIcon },
  { label: 'LinkedIn', href: '#', icon: LinkedInIcon },
  { label: 'GitHub', href: '#', icon: GitHubIcon },
]

const featuredPosts = posts.filter((post) => post.featured).slice(0, 6)
const fallbackPosts = posts.slice(0, 6)
const displayPosts = featuredPosts.length > 0 ? featuredPosts : fallbackPosts

function Home() {
  return (
    <SiteShell>
      <Seo />
      <section className="flex flex-col items-center text-center">
        <img
          src="/avatar.svg"
          alt="Josh 頭像"
          className="mb-4 h-32 w-32 rounded-full border border-neutral-200 object-cover"
        />
        <h1 className="text-4xl font-extrabold text-neutral-900">Josh</h1>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xl text-neutral-700">
          嗨，我是 Josh
          <span className="signature-badge">
            <span className="signature-dot" aria-hidden="true" />
            慢讀筆記
          </span>
        </p>
        <p className="mt-3 max-w-2xl text-base text-neutral-700">
          這裡是 Josh 的個人筆記，聚焦閱讀體驗、工具與前端實作，
          記錄我看過的書、做過的專案與整理過的觀察。
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {socials.map((social) => {
            const Icon = social.icon
            return (
              <a
                key={social.label}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-brand-400 hover:text-neutral-900"
                href={social.href}
                aria-label={social.label}
              >
                <Icon className="h-5 w-5" />
              </a>
            )
          })}
        </div>
      </section>

      <section id="posts" className="scroll-mt-24 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-extrabold text-neutral-900">精選文章</h2>
          <Link className="link-primary text-sm text-neutral-700" href="/posts">
            查看全部文章
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayPosts.map((post, index) => {
            const delayClass =
              index === 0
                ? 'delay-1'
                : index === 1
                ? 'delay-2'
                : index === 2
                ? 'delay-3'
                : 'delay-4'

            return (
              <li
                key={post.title}
                className={`animate-fade-up ${delayClass} flex min-h-full flex-col overflow-hidden rounded-lg border-2 border-neutral-200 bg-card shadow-[0_20px_45px_-35px_rgba(30,30,29,0.55)]`}
              >
                <div className="aspect-[4/3] w-full bg-gradient-to-br from-brand-100 via-neutral-100 to-brand-200" />
                <div className="flex flex-1 flex-col px-6 py-4">
                  <div className="text-sm text-neutral-600">
                    <time dateTime={post.date}>{post.displayDate}</time>
                  </div>
                  <h3 className="mt-2 text-xl font-bold text-neutral-800">
                    <Link
                      className="hover:underline hover:decoration-brand-400 hover:decoration-2 hover:underline-offset-4"
                      href={`/posts/${post.slug}`}
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-base text-neutral-700">
                    {post.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-brand-400 px-2 py-1 text-brand-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/posts">顯示更多</Link>
          </Button>
        </div>
      </section>

      <section
        id="topics"
        className="scroll-mt-24 grid gap-5 md:grid-cols-2"
      >
        <div className="space-y-4 rounded-lg border border-neutral-200 bg-card p-6">
          <h3 className="text-xl font-bold text-neutral-900">Josh 的閱讀主題</h3>
          <p className="text-base text-neutral-700">
            Josh 關注內容與產品的長期脈絡，記錄低調但持續的細節。
          </p>
          <div className="flex flex-wrap gap-2">
            {['閱讀體驗', '前端實作', '設計節奏', '產品筆記', '長文排版'].map(
              (topic) => (
                <span
                  key={topic}
                  className="rounded-md border border-brand-400 px-2.5 py-1 text-xs text-brand-700"
                >
                  {topic}
                </span>
              )
            )}
          </div>
        </div>
        <div
          id="notes"
          className="space-y-4 rounded-lg border border-neutral-200 bg-card p-6"
        >
          <h3 className="text-xl font-bold text-neutral-900">Josh 的工作札記</h3>
          <ul className="space-y-3 text-base text-neutral-700">
            {notes.map((note) => (
              <li key={note} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-500" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-neutral-900">關於 Josh</h3>
            <p className="mt-2 text-base text-neutral-700">
              想更了解 Josh 的背景與這個部落格的脈絡。
            </p>
          </div>
          <Link className="link-primary text-sm text-neutral-700" href="/about">
            前往關於頁面
          </Link>
        </div>
      </section>
    </SiteShell>
  )
}

export default Home
