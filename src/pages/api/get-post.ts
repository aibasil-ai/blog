import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

type PostData = {
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
  post: PostData
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
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: '只接受 GET 請求' })
  }

  const { slug } = req.query

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ success: false, error: '缺少 slug 參數' })
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
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    const post: PostData = {
      title: data.title || '',
      slug,
      description: data.description || '',
      date: data.date || '',
      readTime: data.readTime || '',
      tags: data.tags || [],
      featured: data.featured || false,
      content: content.trim(),
    }

    return res.status(200).json({ success: true, post })
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `讀取文章失敗：${err instanceof Error ? err.message : String(err)}`,
    })
  }
}
