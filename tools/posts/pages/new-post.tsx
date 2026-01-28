import { useState, useEffect, useRef, useCallback } from 'react'
import SiteShell from '../../../src/components/SiteShell'
import Seo from '../../../src/components/Seo'
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

type UploadStatus = {
  type: 'idle' | 'uploading' | 'success' | 'error'
  message?: string
}

// 簡易 Markdown 轉 HTML（僅處理圖片和基本語法）
function renderMarkdownPreview(content: string): string {
  let html = content
    // 轉義 HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // 圖片
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />')
    // 標題
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-extrabold mt-8 mb-4">$1</h1>')
    // 粗體與斜體
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 行內程式碼
    .replace(/`([^`]+)`/g, '<code class="bg-neutral-100 px-1 rounded text-sm">$1</code>')
    // 引用
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-neutral-300 pl-4 italic text-neutral-600 my-4">$1</blockquote>')
    // 分隔線
    .replace(/^---$/gm, '<hr class="my-6 border-neutral-200" />')
    // 換行
    .replace(/\n\n/g, '</p><p class="my-3">')
    .replace(/\n/g, '<br />')

  return `<div class="prose prose-neutral max-w-none"><p class="my-3">${html}</p></div>`
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
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ type: 'idle' })
  const [isDragging, setIsDragging] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 自動從標題產生 slug
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

  // 上傳圖片
  const uploadImage = useCallback(async (file: File) => {
    if (!formData.slug) {
      setUploadStatus({ type: 'error', message: '請先輸入標題或 slug' })
      return
    }

    setUploadStatus({ type: 'uploading', message: '上傳中...' })

    const formDataObj = new FormData()
    formDataObj.append('image', file)
    formDataObj.append('slug', formData.slug)

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formDataObj,
      })
      const data = await response.json()

      if (data.success) {
        // 在游標位置插入 Markdown 圖片語法
        const textarea = textareaRef.current
        if (textarea) {
          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const before = formData.content.substring(0, start)
          const after = formData.content.substring(end)
          const imageMarkdown = `![${file.name}](${data.url})`

          setFormData((prev) => ({
            ...prev,
            content: before + imageMarkdown + after,
          }))

          // 移動游標到插入的圖片後面
          setTimeout(() => {
            textarea.focus()
            const newPos = start + imageMarkdown.length
            textarea.setSelectionRange(newPos, newPos)
          }, 0)
        }
        setUploadStatus({ type: 'success', message: '圖片已上傳' })
        setTimeout(() => setUploadStatus({ type: 'idle' }), 2000)
      } else {
        setUploadStatus({ type: 'error', message: data.error })
      }
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: `上傳失敗：${err instanceof Error ? err.message : String(err)}`,
      })
    }
  }, [formData.slug, formData.content])

  // 處理檔案選擇
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadImage(file)
    }
    // 清除 input 以允許重複選擇相同檔案
    e.target.value = ''
  }, [uploadImage])

  // 拖放處理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        uploadImage(file)
      } else {
        setUploadStatus({ type: 'error', message: '請拖入圖片檔案' })
      }
    }
  }, [uploadImage])

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

            {/* 內容編輯區 - 分割式預覽 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="content"
                  className="text-sm font-medium text-neutral-700"
                >
                  內容 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {uploadStatus.type !== 'idle' && (
                    <span
                      className={`text-xs ${uploadStatus.type === 'uploading'
                          ? 'text-blue-600'
                          : uploadStatus.type === 'success'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                    >
                      {uploadStatus.message}
                    </span>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!formData.slug || uploadStatus.type === 'uploading'}
                  >
                    📷 插入圖片
                  </Button>
                </div>
              </div>

              {/* 分割式編輯器 */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* 左側：Markdown 編輯區 */}
                <div
                  className={`relative rounded-md border ${isDragging
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-400/20'
                      : 'border-neutral-300'
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isDragging && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-brand-500/10">
                      <p className="text-lg font-medium text-brand-600">
                        放開以上傳圖片
                      </p>
                    </div>
                  )}
                  <textarea
                    ref={textareaRef}
                    id="content"
                    name="content"
                    required
                    rows={20}
                    value={formData.content}
                    onChange={handleChange}
                    className="w-full rounded-md bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-neutral-400 focus:outline-none"
                    placeholder="MDX 內容...&#10;&#10;支援拖放圖片上傳"
                  />
                </div>

                {/* 右側：即時預覽區 */}
                <div className="rounded-md border border-neutral-300 bg-white p-4 overflow-auto" style={{ minHeight: '450px', maxHeight: '600px' }}>
                  <div className="mb-2 border-b border-neutral-200 pb-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                      預覽
                    </span>
                  </div>
                  {formData.content ? (
                    <div
                      className="prose prose-neutral max-w-none text-sm"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdownPreview(formData.content),
                      }}
                    />
                  ) : (
                    <p className="text-sm text-neutral-400 italic">
                      在左側輸入內容以預覽...
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-neutral-500">
                支援 MDX 格式，可使用 Markdown 語法。直接拖放圖片到編輯區即可上傳。
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
