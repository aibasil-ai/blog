import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import SiteShell from '../../../../src/components/SiteShell'
import Seo from '../../../../src/components/Seo'
import { Button } from '../../../../src/components/ui/button'

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
}

function EditPost() {
  const router = useRouter()
  const { slug } = router.query

  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    description: '',
    date: '',
    readTime: '',
    tags: '',
    featured: false,
    content: '',
  })

  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [status, setStatus] = useState<SubmitStatus>({ type: 'idle' })

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return

    const fetchPost = async () => {
      try {
        setPageLoading(true)
        const response = await fetch(`/api/get-post?slug=${encodeURIComponent(slug)}`)
        const data = await response.json()

        if (data.success) {
          setFormData({
            title: data.post.title,
            slug: data.post.slug,
            description: data.post.description,
            date: data.post.date,
            readTime: data.post.readTime.replace(/\s*分鐘\s*$/, ''),
            tags: data.post.tags.join(', '),
            featured: data.post.featured,
            content: data.post.content,
          })
          setPageError(null)
        } else {
          setPageError(data.error)
        }
      } catch (err) {
        setPageError(`請求失敗：${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setPageLoading(false)
      }
    }

    fetchPost()
  }, [slug])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

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
      const response = await fetch('/api/update-post', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: formData.slug,
          title: formData.title,
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
          message: '文章已更新',
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

  const readOnlyInputClass =
    'w-full rounded-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm text-neutral-600 cursor-not-allowed'

  if (pageLoading) {
    return (
      <SiteShell>
        <Seo title="編輯文章" description="編輯部落格文章" />
        <section className="rounded-lg border border-neutral-200 bg-card p-8">
          <div className="py-8 text-center text-neutral-500">載入中...</div>
        </section>
      </SiteShell>
    )
  }

  if (pageError) {
    return (
      <SiteShell>
        <Seo title="編輯文章" description="編輯部落格文章" />
        <section className="rounded-lg border border-neutral-200 bg-card p-8">
          <div className="space-y-4">
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{pageError}</p>
            </div>
            <Link href="/manage-posts" className="inline-block text-brand-500 underline">
              返回文章管理
            </Link>
          </div>
        </section>
      </SiteShell>
    )
  }

  return (
    <SiteShell>
      <Seo title={`編輯：${formData.title}`} description="編輯部落格文章" />
      <section className="rounded-lg border border-neutral-200 bg-card p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-neutral-600">
              Edit Post
            </p>
            <h1 className="text-3xl font-extrabold text-neutral-900">
              編輯文章
            </h1>
            <div className="flex gap-4 text-sm">
              <Link href="/manage-posts" className="text-brand-500 hover:underline">
                ← 返回管理
              </Link>
              <Link href={`/posts/${formData.slug}`} className="text-brand-500 hover:underline">
                查看文章 →
              </Link>
            </div>
          </div>

          {status.type === 'success' && (
            <div className="rounded-md border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">
                {status.message}
              </p>
              <Link
                href={`/posts/${formData.slug}`}
                className="mt-2 inline-block text-sm font-medium text-green-700 underline hover:text-green-900"
              >
                查看文章 →
              </Link>
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
                  Slug <span className="text-neutral-400">(不可變更)</span>
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  readOnly
                  className={readOnlyInputClass}
                />
                <p className="text-xs text-neutral-500">
                  網址路徑，建立後無法變更
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
              <Button type="submit" disabled={status.type === 'loading'}>
                {status.type === 'loading' ? '儲存中...' : '儲存變更'}
              </Button>
              <Link href="/manage-posts">
                <Button type="button" variant="outline">
                  返回管理
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </section>
    </SiteShell>
  )
}

export default EditPost
