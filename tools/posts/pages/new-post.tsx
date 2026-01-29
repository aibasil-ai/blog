import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import SiteShell from '../../../src/components/SiteShell'
import Seo from '../../../src/components/Seo'
import MarkdownEditor from '../../../src/components/MarkdownEditor'
import { Button } from '../../../src/components/ui/button'

function getTodayDate(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

type FormData = {
  title: string
  slug: string
  description: string
  date: string
  readTime: string
  tags: string
  featured: boolean
  content: string
}

type SubmitStatus = {
  type: 'idle' | 'loading' | 'success' | 'error'
  message?: string
  slug?: string
}

function NewPost() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    description: '',
    date: getTodayDate(),
    readTime: '',
    tags: '',
    featured: false,
    content: '',
  })

  const [slugEdited, setSlugEdited] = useState(false)
  const [slugLoading, setSlugLoading] = useState(false)
  const [status, setStatus] = useState<SubmitStatus>({ type: 'idle' })
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const isProduction = process.env.NODE_ENV === 'production'

  useEffect(() => {
    if (slugEdited || !formData.title) {
      return
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(async () => {
      setSlugLoading(true)
      try {
        const response = await fetch('/api/translate-title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: formData.title }),
        })
        const data = await response.json()
        if (data.success) {
          setFormData((prev) => ({ ...prev, slug: data.slug }))
        }
      } catch {
        const fallbackSlug = formData.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
        setFormData((prev) => ({ ...prev, slug: fallbackSlug }))
      } finally {
        setSlugLoading(false)
      }
    }, 500)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [formData.title, slugEdited])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    if (name === 'slug') {
      setSlugEdited(true)
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus({ type: 'loading' })

    const tags = formData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    try {
      const response = await fetch('/api/create-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          date: formData.date,
          readTime: formData.readTime,
          tags,
          featured: formData.featured,
          content: formData.content,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus({
          type: 'success',
          message: `文章已建立：${data.path}`,
          slug: data.slug,
        })
      } else {
        setStatus({
          type: 'error',
          message: data.error || '發生未知錯誤',
        })
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: `請求失敗：${err instanceof Error ? err.message : String(err)}`,
      })
    }
  }

  const inputClass =
    'w-full rounded-xl border border-neutral-200 bg-white/80 px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-300/30'

  const readOnlyHint = slugLoading ? '翻譯中...' : 'article-slug'

  return (
    <SiteShell>
      <Seo title="新增文章" description="建立新的部落格文章" />

      {isProduction && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            ⚠️ 文章管理功能僅在本地開發環境中可用，生產環境無法建立或更新內容。
          </p>
        </div>
      )}

      <section className="animate-fade-up relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-brand-50/40 p-8 shadow-sm">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-neutral-100 blur-3xl" />
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="signature-badge">Content Studio</div>
              <h1 className="text-3xl font-semibold text-neutral-900 md:text-4xl">
                新增文章
              </h1>
              <p className="max-w-2xl text-base text-neutral-600">
                用完整的 Markdown 編輯器建立新文章，支援即時預覽與圖片上傳。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/manage-posts">
                <Button variant="outline">返回管理</Button>
              </Link>
              <Link href="/posts">
                <Button variant="ghost">前台瀏覽</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="animate-fade-up delay-1 space-y-6">
        {status.type === 'success' && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800">
              {status.message}
            </p>
            <a
              href={`/posts/${status.slug}`}
              className="mt-2 inline-block text-sm font-semibold text-emerald-700 underline hover:text-emerald-900"
            >
              查看文章 →
            </a>
          </div>
        )}

        {status.type === 'error' && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">
              {status.message}
            </p>
          </div>
        )}

        <section className="rounded-2xl border border-neutral-200 bg-white/90 p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <label
                htmlFor="title"
                className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                標題
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className={`${inputClass} mt-2 text-lg font-semibold`}
                placeholder="輸入文章標題"
              />
            </div>
            <div>
              <label
                htmlFor="slug"
                className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                Slug
                {slugLoading && (
                  <span className="ml-2 text-xs text-neutral-400">生成中...</span>
                )}
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className={`${inputClass} mt-2`}
                placeholder={readOnlyHint}
              />
              <p className="mt-2 text-xs text-neutral-500">
                用於網址路徑，可手動調整
              </p>
            </div>
            <div className="lg:col-span-2">
              <label
                htmlFor="description"
                className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                描述
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className={`${inputClass} mt-2 resize-none`}
                placeholder="簡短說明這篇文章的重點"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white/90 p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label
                htmlFor="date"
                className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                日期
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className={`${inputClass} mt-2`}
              />
            </div>
            <div>
              <label
                htmlFor="readTime"
                className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                閱讀時間
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  id="readTime"
                  name="readTime"
                  required
                  min="1"
                  value={formData.readTime}
                  onChange={handleChange}
                  className={`${inputClass} w-24`}
                  placeholder="5"
                />
                <span className="text-sm text-neutral-600">分鐘</span>
              </div>
            </div>
            <div>
              <label
                htmlFor="tags"
                className="text-xs font-semibold uppercase tracking-wide text-neutral-500"
              >
                標籤
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className={`${inputClass} mt-2`}
                placeholder="標籤一, 標籤二"
              />
              <p className="mt-2 text-xs text-neutral-500">
                以逗號分隔多個標籤
              </p>
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-700">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="h-4 w-4 rounded border-neutral-300 text-brand-500 focus:ring-brand-400"
              />
              設為精選文章
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white/90 p-6 shadow-sm">
          <MarkdownEditor
            value={formData.content}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, content: value }))
            }
            slug={formData.slug}
            helperText="支援 MDX 格式，可直接拖放或貼上圖片。"
          />
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-6 text-sm text-neutral-600 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            小提示
          </p>
          <p className="mt-2">
            首圖可直接拖進編輯器，會自動上傳並插入圖片語法。
          </p>
          <p className="mt-2">
            建議在內容最上方放置摘要與重點，讓預覽更吸引人。
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={status.type === 'loading'}>
            {status.type === 'loading' ? '發布中...' : '發布文章'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                title: '',
                slug: '',
                description: '',
                date: getTodayDate(),
                readTime: '',
                tags: '',
                featured: false,
                content: '',
              })
              setSlugEdited(false)
              setStatus({ type: 'idle' })
            }}
          >
            清除表單
          </Button>
        </div>
      </form>
    </SiteShell>
  )
}

export default NewPost
