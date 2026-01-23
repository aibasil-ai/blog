import type { ReactNode } from 'react'
import type { Post } from '../content/posts'

type PostLayoutProps = {
  post: Post
  children: ReactNode
}

function PostLayout({ post, children }: PostLayoutProps) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-card px-6 py-8 shadow-[0_20px_50px_-45px_rgba(30,30,29,0.5)] sm:px-10">
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-wide text-neutral-600">
          {post.displayDate} · {post.readTime}
        </p>
        <h2 className="text-3xl font-extrabold text-neutral-900 sm:text-4xl">
          {post.title}
        </h2>
        <p className="max-w-2xl text-base text-neutral-700">
          {post.description}
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-brand-400 px-2 py-1 text-brand-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>
      <div className="prose prose-neutral mt-8">{children}</div>
    </article>
  )
}

export default PostLayout
