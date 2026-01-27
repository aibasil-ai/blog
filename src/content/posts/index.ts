import type { ComponentType } from 'react'
import QuietInteraction, {
  frontmatter as quietInteractionFrontmatter,
} from './quiet-interaction.mdx'
import ReadingRhythm, {
  frontmatter as readingRhythmFrontmatter,
} from './reading-rhythm.mdx'
import WritingWorkflow, {
  frontmatter as writingWorkflowFrontmatter,
} from './writing-workflow.mdx'
import ASDF, {
  frontmatter as aSDFFrontmatter,
} from './a-s-d-f.mdx'

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

function formatDisplayDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`
}

const posts: Post[] = [
  {
    slug: 'a-s-d-f',
    title: aSDFFrontmatter.title,
    description: aSDFFrontmatter.description,
    date: aSDFFrontmatter.date,
    displayDate: formatDisplayDate(aSDFFrontmatter.date),
    readTime: aSDFFrontmatter.readTime,
    tags: aSDFFrontmatter.tags ?? [],
    featured: aSDFFrontmatter.featured ?? false,
    Component: ASDF,
  },
  {
    slug: 'quiet-interaction',
    title: quietInteractionFrontmatter.title,
    description: quietInteractionFrontmatter.description,
    date: quietInteractionFrontmatter.date,
    displayDate: formatDisplayDate(quietInteractionFrontmatter.date),
    readTime: quietInteractionFrontmatter.readTime,
    tags: quietInteractionFrontmatter.tags ?? [],
    featured: quietInteractionFrontmatter.featured ?? false,
    Component: QuietInteraction,
  },
  {
    slug: 'reading-rhythm',
    title: readingRhythmFrontmatter.title,
    description: readingRhythmFrontmatter.description,
    date: readingRhythmFrontmatter.date,
    displayDate: formatDisplayDate(readingRhythmFrontmatter.date),
    readTime: readingRhythmFrontmatter.readTime,
    tags: readingRhythmFrontmatter.tags ?? [],
    featured: readingRhythmFrontmatter.featured ?? false,
    Component: ReadingRhythm,
  },
  {
    slug: 'writing-workflow',
    title: writingWorkflowFrontmatter.title,
    description: writingWorkflowFrontmatter.description,
    date: writingWorkflowFrontmatter.date,
    displayDate: formatDisplayDate(writingWorkflowFrontmatter.date),
    readTime: writingWorkflowFrontmatter.readTime,
    tags: writingWorkflowFrontmatter.tags ?? [],
    featured: writingWorkflowFrontmatter.featured ?? false,
    Component: WritingWorkflow,
  },
]

const tagSet = new Set<string>()
posts.forEach((post) => post.tags.forEach((tag) => tagSet.add(tag)))

export const allTags = Array.from(tagSet).sort((a, b) => a.localeCompare(b))
export { posts }
