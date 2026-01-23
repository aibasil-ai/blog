import { type AnchorHTMLAttributes } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MDXProvider } from '@mdx-js/react'
import SiteShell from '../components/SiteShell'
import Seo from '../components/Seo'
import PostLayout from '../components/PostLayout'
import { posts } from '../content/posts'

const mdxComponents = {
  a: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const { className, ...rest } = props
    return <a {...rest} className={`link-primary ${className ?? ''}`.trim()} />
  },
}

function Post() {
  const { slug } = useParams()
  const activePost = posts.find((post) => post.slug === slug)

  return (
    <SiteShell>
      <Seo
        title={activePost?.title ?? '找不到文章'}
        description={activePost?.description}
        type={activePost ? 'article' : 'website'}
      />
      <section className="space-y-8">
        <Link className="link-primary text-sm text-neutral-700" to="/posts">
          返回文章列表
        </Link>
        {activePost ? (
          <MDXProvider components={mdxComponents}>
            <PostLayout post={activePost}>
              <activePost.Component />
            </PostLayout>
          </MDXProvider>
        ) : (
          <div className="rounded-lg border border-neutral-200 bg-card px-6 py-10 text-center text-neutral-700">
            <p className="text-lg font-bold text-neutral-900">找不到這篇文章</p>
            <p className="mt-3 text-sm">
              可能是連結已更新，回到列表再重新選取。
            </p>
            <Link className="link-primary mt-6 inline-block text-sm" to="/posts">
              回到文章列表
            </Link>
          </div>
        )}
        <div className="space-y-3">
          <p className="text-sm font-medium text-neutral-700">更多文章</p>
          <div className="flex flex-wrap gap-4 text-sm text-neutral-700">
            {posts.map((post) => (
              <Link key={post.slug} className="link-primary" to={`/posts/${post.slug}`}>
                {post.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  )
}

export default Post
