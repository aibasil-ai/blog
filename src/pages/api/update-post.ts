import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

type RequestBody = {
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  tags: string[]
  featured: boolean
  content: string
}

type SuccessResponse = {
  success: true
  message: string
}

type ErrorResponse = {
  success: false
  error: string
}

type ApiResponse = SuccessResponse | ErrorResponse

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: '只接受 PUT 請求' })
  }

  const body = req.body as RequestBody
  const { slug, title, description, date, readTime, tags, featured, content } = body

  // Validate required fields
  if (!slug || !title || !description || !date || !readTime || !content) {
    return res.status(400).json({ success: false, error: '缺少必要欄位' })
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ success: false, error: 'slug 格式無效' })
  }

  const postsDir = path.join(process.cwd(), 'src/content/posts')
  const filePath = path.join(postsDir, `${slug}.mdx`)

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: '文章不存在' })
  }

  try {
    // Build frontmatter
    const tagsYaml = tags.length > 0
      ? `tags:\n${tags.map((tag) => `  - ${tag}`).join('\n')}`
      : ''

    const frontmatter = [
      '---',
      `title: "${title}"`,
      `description: "${description}"`,
      `date: "${date}"`,
      `readTime: "${readTime}"`,
      tagsYaml,
      `featured: ${featured}`,
      '---',
    ]
      .filter(Boolean)
      .join('\n')

    const mdxContent = `${frontmatter}\n\n${content}\n`

    fs.writeFileSync(filePath, mdxContent, 'utf-8')

    return res.status(200).json({
      success: true,
      message: '文章已更新',
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `更新文章失敗：${err instanceof Error ? err.message : String(err)}`,
    })
  }
}
