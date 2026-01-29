import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import SiteShell from '../../../src/components/SiteShell'
import Seo from '../../../src/components/Seo'
import { Button } from '../../../src/components/ui/button'

type PostSummary = {
  slug: string
  title: string
  date: string
  description: string
}

type DeleteModalState = {
  isOpen: boolean
  slug: string
  title: string
  inputValue: string
  isDeleting: boolean
  error: string
}

function ManagePosts() {
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    slug: '',
    title: '',
    inputValue: '',
    isDeleting: false,
    error: '',
  })

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/list-posts')
      const data = await response.json()

      if (data.success) {
        setPosts(data.posts)
        setError(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError(`請求失敗：${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const openDeleteModal = (slug: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      slug,
      title,
      inputValue: '',
      isDeleting: false,
      error: '',
    })
  }

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      slug: '',
      title: '',
      inputValue: '',
      isDeleting: false,
      error: '',
    })
  }

  const handleDelete = async () => {
    if (deleteModal.inputValue !== deleteModal.title) {
      setDeleteModal((prev) => ({
        ...prev,
        error: '標題不符，請重新輸入',
      }))
      return
    }

    setDeleteModal((prev) => ({ ...prev, isDeleting: true, error: '' }))

    try {
      const response = await fetch('/api/delete-post', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: deleteModal.slug,
          confirmTitle: deleteModal.inputValue,
        }),
      })

      const data = await response.json()

      if (data.success) {
        closeDeleteModal()
        fetchPosts()
      } else {
        setDeleteModal((prev) => ({
          ...prev,
          isDeleting: false,
          error: data.error,
        }))
      }
    } catch (err) {
      setDeleteModal((prev) => ({
        ...prev,
        isDeleting: false,
        error: `請求失敗：${err instanceof Error ? err.message : String(err)}`,
      }))
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return dateStr
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  }

  const latestPost = useMemo(() => {
    if (!posts.length) return null
    return posts.reduce((latest, post) => {
      const latestTime = new Date(latest.date).getTime()
      const postTime = new Date(post.date).getTime()
      if (Number.isNaN(postTime)) return latest
      if (Number.isNaN(latestTime)) return post
      return postTime > latestTime ? post : latest
    }, posts[0])
  }, [posts])

  const isProduction = process.env.NODE_ENV === 'production'

  return (
    <SiteShell>
      <Seo title="文章管理" description="管理部落格文章" />

      {isProduction && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            ⚠️ 文章管理功能僅在本地開發環境中可用。在生產環境中，文件系統為唯讀狀態，無法建立、編輯或刪除文章。
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
                文章管理
              </h1>
              <p className="max-w-2xl text-base text-neutral-600">
                集中管理所有文章、快速編輯與刪除內容，並即時同步到內容索引。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/new-post">
                <Button>新增文章</Button>
              </Link>
              <Link href="/posts">
                <Button variant="outline">前台瀏覽</Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white/90 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                總文章數
              </p>
              <p className="mt-2 text-2xl font-semibold text-neutral-900">
                {posts.length}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                已同步至內容庫
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white/90 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                最近更新
              </p>
              <p className="mt-2 text-lg font-semibold text-neutral-900">
                {latestPost ? formatDate(latestPost.date) : '尚無資料'}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {latestPost ? latestPost.title : '新增第一篇文章開始'}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white/90 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                快速入口
              </p>
              <p className="mt-2 text-sm text-neutral-600">
                新增內容後記得檢查預覽，確保排版符合期待。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="animate-fade-up delay-1 rounded-2xl border border-neutral-200 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-neutral-900">文章清單</h2>
          <span className="text-sm text-neutral-500">{posts.length} 篇</span>
        </div>

        {loading && (
          <div className="py-10 text-center text-neutral-500">載入中...</div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-10 text-center">
            <p className="text-sm text-neutral-500">尚無文章</p>
            <Link href="/new-post" className="mt-4 inline-flex">
              <Button>建立第一篇文章</Button>
            </Link>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="mt-6 grid gap-4">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group rounded-2xl border border-neutral-200 bg-gradient-to-br from-white via-white to-neutral-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <span className="rounded-full bg-neutral-100 px-2 py-1">
                        {formatDate(post.date)}
                      </span>
                      <span className="rounded-full bg-neutral-100 px-2 py-1">
                        /{post.slug}
                      </span>
                    </div>
                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-lg font-semibold text-neutral-900 transition group-hover:text-brand-600"
                    >
                      {post.title}
                    </Link>
                    <p className="text-sm text-neutral-600 line-clamp-2">
                      {post.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link href={`/edit-post/${post.slug}`}>
                      <Button variant="outline" size="sm">
                        編輯
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteModal(post.slug, post.title)}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      刪除
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
                  Danger Zone
                </p>
                <h2 className="mt-2 text-xl font-semibold text-neutral-900">
                  確認刪除文章
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-500 hover:bg-neutral-100"
              >
                關閉
              </button>
            </div>

            <p className="mt-4 text-sm text-neutral-600">
              請輸入文章標題「
              <span className="font-semibold text-neutral-900">
                {deleteModal.title}
              </span>
              」以確認刪除，此操作無法復原。
            </p>

            <input
              type="text"
              value={deleteModal.inputValue}
              onChange={(e) =>
                setDeleteModal((prev) => ({
                  ...prev,
                  inputValue: e.target.value,
                  error: '',
                }))
              }
              className="mt-4 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              placeholder="輸入文章標題"
              autoFocus
            />

            {deleteModal.error && (
              <p className="mt-2 text-sm font-semibold text-red-600">
                {deleteModal.error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={closeDeleteModal}
                disabled={deleteModal.isDeleting}
              >
                取消
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleteModal.isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteModal.isDeleting ? '刪除中...' : '確認刪除'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </SiteShell>
  )
}

export default ManagePosts
