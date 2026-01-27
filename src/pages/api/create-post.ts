import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

type CreatePostRequest = {
  title: string
  slug: string
  description: string
  date: string
  readTime: string
  tags: string[]
  featured: boolean
  content: string
}

type SuccessResponse = {
  success: true
  slug: string
  path: string
}

type ErrorResponse = {
  success: false
  error: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: '只允許 POST 方法' })
  }

  const body = req.body as CreatePostRequest

  // Validate required fields
  const requiredFields = ['title', 'slug', 'description', 'date', 'readTime', 'content']
  for (const field of requiredFields) {
    if (!body[field as keyof CreatePostRequest]) {
      return res.status(400).json({ success: false, error: `缺少必填欄位：${field}` })
    }
  }

  const { title, slug, description, date, readTime, tags, featured, content } = body

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({
      success: false,
      error: 'Slug 只能包含小寫字母、數字和連字號',
    })
  }

  const postsDir = path.join(process.cwd(), 'src/content/posts')
  const mdxPath = path.join(postsDir, `${slug}.mdx`)
  const indexPath = path.join(postsDir, 'index.ts')

  // Check if slug already exists
  if (fs.existsSync(mdxPath)) {
    return res.status(400).json({
      success: false,
      error: `文章 "${slug}" 已存在，請使用其他 slug`,
    })
  }

  // Step A: Create MDX file
  const tagsYaml =
    tags && tags.length > 0
      ? `tags:\n${tags.map((tag) => `  - ${tag}`).join('\n')}`
      : ''

  const mdxContent = `---
title: "${title}"
description: "${description}"
date: "${date}"
readTime: "${readTime}"
${tagsYaml}
featured: ${featured || false}
---

${content}
`

  try {
    fs.writeFileSync(mdxPath, mdxContent, 'utf-8')
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `無法寫入 MDX 檔案：${err instanceof Error ? err.message : String(err)}`,
    })
  }

  // Step B: Modify index.ts
  try {
    let indexContent = fs.readFileSync(indexPath, 'utf-8')

    // Generate variable names from slug
    // e.g., "my-new-post" -> "MyNewPost" and "myNewPostFrontmatter"
    const pascalCase = slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
    const camelCase = pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1)
    const frontmatterVar = `${camelCase}Frontmatter`

    // Find the last MDX import and insert after it
    const importPattern = /} from '\.\/[a-z0-9-]+\.mdx'\n/g
    let lastImportMatch: RegExpExecArray | null = null
    let match: RegExpExecArray | null
    while ((match = importPattern.exec(indexContent)) !== null) {
      lastImportMatch = match
    }

    if (!lastImportMatch) {
      // Rollback: delete the MDX file
      fs.unlinkSync(mdxPath)
      return res.status(500).json({
        success: false,
        error: '無法找到現有的 MDX import 語句',
      })
    }

    const newImport = `import ${pascalCase}, {
  frontmatter as ${frontmatterVar},
} from './${slug}.mdx'\n`

    const insertImportPos = lastImportMatch.index + lastImportMatch[0].length
    indexContent =
      indexContent.slice(0, insertImportPos) +
      newImport +
      indexContent.slice(insertImportPos)

    // Find "const posts: Post[] = [" and insert the new post after it
    const postsArrayPattern = /const posts: Post\[\] = \[\n/
    const postsMatch = postsArrayPattern.exec(indexContent)

    if (!postsMatch) {
      // Rollback: delete the MDX file
      fs.unlinkSync(mdxPath)
      return res.status(500).json({
        success: false,
        error: '無法找到 posts 陣列定義',
      })
    }

    const newPostEntry = `  {
    slug: '${slug}',
    title: ${frontmatterVar}.title,
    description: ${frontmatterVar}.description,
    date: ${frontmatterVar}.date,
    displayDate: formatDisplayDate(${frontmatterVar}.date),
    readTime: ${frontmatterVar}.readTime,
    tags: ${frontmatterVar}.tags ?? [],
    featured: ${frontmatterVar}.featured ?? false,
    Component: ${pascalCase},
  },
`

    const insertPostPos = postsMatch.index + postsMatch[0].length
    indexContent =
      indexContent.slice(0, insertPostPos) +
      newPostEntry +
      indexContent.slice(insertPostPos)

    fs.writeFileSync(indexPath, indexContent, 'utf-8')
  } catch (err) {
    // Rollback: delete the MDX file if index.ts modification fails
    try {
      fs.unlinkSync(mdxPath)
    } catch {
      // Ignore cleanup errors
    }
    return res.status(500).json({
      success: false,
      error: `無法更新 index.ts：${err instanceof Error ? err.message : String(err)}`,
    })
  }

  return res.status(200).json({
    success: true,
    slug,
    path: `src/content/posts/${slug}.mdx`,
  })
}
