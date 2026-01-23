import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import Seo from '../components/Seo'
import { Button } from '../components/ui/button'
import { allTags, posts } from '../content/posts'
import { cn } from '../lib/utils'

const filterTags = ['全部', ...allTags]

function Posts() {
  const [activeTag, setActiveTag] = useState('全部')

  const filteredPosts = useMemo(() => {
    if (activeTag === '全部') {
      return posts
    }
    return posts.filter((post) => post.tags.includes(activeTag))
  }, [activeTag])

  return (
    <SiteShell>
      <Seo title="所有文章" description="依日期排序的文章清單與標籤篩選。" />
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold text-neutral-900">所有文章</h1>
          <p className="text-sm text-neutral-700">
            共 {filteredPosts.length} 篇
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterTags.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant={activeTag === tag ? 'default' : 'outline'}
              size="sm"
              className={cn('h-9 rounded-full px-4 text-sm')}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </Button>
          ))}
        </div>
        <ul className="space-y-4">
          {filteredPosts.map((post) => (
            <li
              key={post.slug}
              className="rounded-lg border border-neutral-200 bg-card px-6 py-5"
            >
              <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
                <time dateTime={post.date}>{post.displayDate}</time>
                <span aria-hidden="true">·</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="mt-2 text-xl font-bold text-neutral-900">
                <Link
                  className="hover:underline hover:decoration-brand-400 hover:decoration-2 hover:underline-offset-4"
                  to={`/posts/${post.slug}`}
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-base text-neutral-700">
                {post.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-brand-400 px-2 py-1 text-brand-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </SiteShell>
  )
}

export default Posts
