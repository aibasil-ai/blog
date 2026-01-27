import { useState, useEffect } from 'react'
import Link from 'next/link'
import SiteShell from '../components/SiteShell'
import Seo from '../components/Seo'
import { Button } from '../components/ui/button'

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

  const isProduction = process.env.NODE_ENV === 'production'

  return (
    <SiteShell>
      <Seo title="文章管理" description="管理部落格文章" />

      {isProduction && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-900">
            ⚠️ 文章管理功能僅在本地開發環境中可用。在生產環境中，文件系統為唯讀狀態，無法建立、編輯或刪除文章。
          </p>
        </div>
      )}

      <section className="rounded-lg border border-neutral-200 bg-card p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-wide text-neutral-600">
                Manage Posts
              </p>
              <h1 className="text-3xl font-extrabold text-neutral-900">
                文章管理
              </h1>
            </div>
            <Link href="/new-post">
              <Button>新增文章</Button>
            </Link>
          </div>

          {loading && (
            <div className="py-8 text-center text-neutral-500">載入中...</div>
          )}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="py-8 text-center text-neutral-500">
              尚無文章。
              <Link href="/new-post" className="ml-1 text-brand-500 underline">
                建立第一篇文章
              </Link>
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                      標題
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                      日期
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-neutral-600">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr
                      key={post.slug}
                      className="border-b border-neutral-100 hover:bg-neutral-50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/posts/${post.slug}`}
                          className="font-medium text-neutral-900 hover:text-brand-500"
                        >
                          {post.title}
                        </Link>
                        <p className="mt-1 text-sm text-neutral-500 line-clamp-1">
                          {post.description}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600">
                        {formatDate(post.date)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/edit-post/${post.slug}`}>
                            <Button variant="outline" size="sm">
                              編輯
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteModal(post.slug, post.title)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            刪除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-bold text-neutral-900">確認刪除</h2>
            <p className="mt-2 text-sm text-neutral-600">
              請輸入文章標題「
              <span className="font-medium text-neutral-900">
                {deleteModal.title}
              </span>
              」以確認刪除。此操作無法復原。
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
              className="mt-4 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/20"
              placeholder="輸入文章標題"
            />

            {deleteModal.error && (
              <p className="mt-2 text-sm text-red-600">{deleteModal.error}</p>
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
