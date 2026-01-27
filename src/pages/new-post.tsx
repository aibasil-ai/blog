import { useState, useEffect, useRef } from 'react'
import SiteShell from '../components/SiteShell'
import Seo from '../components/Seo'
import { Button } from '../components/ui/button'

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

  // Auto-generate slug from title when title changes (unless slug was manually edited)
  useEffect(() => {
    if (slugEdited || !formData.title) {
      return
    }

    // Clear previous debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce the API call
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
        // Fallback: simple slug conversion
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

    // Parse tags
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
    'w-full rounded-md border border-neutral-300 bg-background px-3 py-2 text-sm text-foreground placeholder:text-neutral-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20'

  return (
    <SiteShell>
      <Seo title="新增文章" description="建立新的部落格文章" />
      <section className="rounded-lg border border-neutral-200 bg-card p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-neutral-600">
              New Post
            </p>
            <h1 className="text-3xl font-extrabold text-neutral-900">
              新增文章
            </h1>
            <p className="max-w-2xl text-base text-neutral-700">
              填寫下方表單以建立新文章。發布後會自動建立 MDX 檔案並更新索引。
            </p>
          </div>

          {status.type === 'success' && (
            <div className="rounded-md border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">
                {status.message}
              </p>
              <a
                href={`/posts/${status.slug}`}
                className="mt-2 inline-block text-sm font-medium text-green-700 underline hover:text-green-900"
              >
                查看文章 →
              </a>
            </div>
          )}

          {status.type === 'error' && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                {status.message}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="text-sm font-medium text-neutral-700"
                >
                  標題 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="文章標題"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="slug"
                  className="text-sm font-medium text-neutral-700"
                >
                  Slug <span className="text-red-500">*</span>
                  {slugLoading && (
                    <span className="ml-2 text-xs text-neutral-400">翻譯中...</span>
                  )}
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder={slugLoading ? '翻譯中...' : 'article-slug'}
                />
                <p className="text-xs text-neutral-500">
                  自動將標題翻譯為英文，可手動修改
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-neutral-700"
              >
                描述 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={2}
                value={formData.description}
                onChange={handleChange}
                className={inputClass}
                placeholder="文章的簡短描述"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label
                  htmlFor="date"
                  className="text-sm font-medium text-neutral-700"
                >
                  日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="readTime"
                  className="text-sm font-medium text-neutral-700"
                >
                  閱讀時間 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
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

              <div className="space-y-2">
                <label
                  htmlFor="tags"
                  className="text-sm font-medium text-neutral-700"
                >
                  標籤
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="標籤一, 標籤二"
                />
                <p className="text-xs text-neutral-500">以逗號分隔多個標籤</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="h-4 w-4 rounded border-neutral-300 text-brand-500 focus:ring-brand-400"
              />
              <label
                htmlFor="featured"
                className="text-sm font-medium text-neutral-700"
              >
                精選文章
              </label>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="content"
                className="text-sm font-medium text-neutral-700"
              >
                內容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={15}
                value={formData.content}
                onChange={handleChange}
                className={`${inputClass} font-mono`}
                placeholder="MDX 內容..."
              />
              <p className="text-xs text-neutral-500">
                支援 MDX 格式，可使用 Markdown 語法
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={status.type === 'loading'}
              >
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
        </div>
      </section>
    </SiteShell>
  )
}

export default NewPost
