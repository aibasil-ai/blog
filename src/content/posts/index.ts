import type { ComponentType } from 'react'

export type Frontmatter = {
  title: string
  description: string
  date: string
  readTime: string
  tags?: string[]
  featured?: boolean
}

export type Post = {
  slug: string
  title: string
  description: string
  date: string
  displayDate: string
  readTime: string
  tags: string[]
  featured: boolean
  Component: ComponentType
}

type PostModule = {
  default: ComponentType
  frontmatter: Frontmatter
}

const postModules = import.meta.glob<PostModule>('./*.mdx', { eager: true })

function formatDisplayDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`
}

function getSlug(path: string) {
  const parts = path.split('/')
  return parts[parts.length - 1].replace('.mdx', '')
}

const posts = Object.entries(postModules)
  .map(([path, module]) => {
    const frontmatter = module.frontmatter

    return {
      slug: getSlug(path),
      title: frontmatter.title,
      description: frontmatter.description,
      date: frontmatter.date,
      displayDate: formatDisplayDate(frontmatter.date),
      readTime: frontmatter.readTime,
      tags: frontmatter.tags ?? [],
      featured: frontmatter.featured ?? false,
      Component: module.default,
    }
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

const tagSet = new Set<string>()
posts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)))

export const allTags = Array.from(tagSet).sort((a, b) => a.localeCompare(b))
export { posts }
