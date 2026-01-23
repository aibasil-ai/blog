import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type SiteShellProps = {
  children: ReactNode
}

const navItems = [
  { label: '分類', href: '/#topics' },
]

function SiteShell({ children }: SiteShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand-200 focus:px-4 focus:py-2 focus:text-sm focus:text-brand-700"
        href="#main-content"
      >
        快轉到主要內容
      </a>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-background to-transparent" />
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="page-shell mx-auto flex min-h-[var(--header-height)] flex-wrap items-center justify-between gap-6 py-3">
          <Link
            className="text-base font-semibold text-neutral-700 hover:text-neutral-900"
            to="/"
          >
            Josh 筆記
          </Link>
          <nav className="flex flex-wrap items-center gap-5 text-base text-neutral-700">
            <Link
              className="hover:text-neutral-900 hover:underline hover:decoration-brand-400 hover:decoration-2 hover:underline-offset-4"
              to="/posts"
            >
              所有文章
            </Link>
            <Link
              className="hover:text-neutral-900 hover:underline hover:decoration-brand-400 hover:decoration-2 hover:underline-offset-4"
              to="/subscribe"
            >
              訂閱
            </Link>
            {navItems.map((item) => (
              <a
                key={item.label}
                className="hover:text-neutral-900 hover:underline hover:decoration-brand-400 hover:decoration-2 hover:underline-offset-4"
                href={item.href}
              >
                {item.label}
              </a>
            ))}
            <Link
              className="hover:text-neutral-900 hover:underline hover:decoration-brand-400 hover:decoration-2 hover:underline-offset-4"
              to="/about"
            >
              關於
            </Link>
          </nav>
        </div>
      </header>
      <div className="page-shell relative z-20 mx-auto flex min-h-screen flex-col pb-20 pt-[calc(var(--header-height)+0.75rem)]">

        <main id="main-content" className="section-stack flex-1">
          {children}
        </main>

        <footer className="mt-16 space-y-4 text-sm text-neutral-600">
          <nav className="flex flex-wrap gap-6 text-base font-medium text-neutral-700">
            <a
              className="hover:text-neutral-900 hover:underline hover:decoration-brand-400 hover:decoration-2 hover:underline-offset-4"
              href="/#topics"
            >
              標籤
            </a>
            <a
              className="hover:text-neutral-900 hover:underline hover:decoration-brand-400 hover:decoration-2 hover:underline-offset-4"
              href="/#topics"
            >
              分類
            </a>
          </nav>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p>2026 Josh 筆記風格部落格</p>
            <p className="text-xs">以 Vite & React 製作</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default SiteShell
