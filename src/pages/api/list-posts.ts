import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

type PostSummary = {
  slug: string
  title: string
  date: string
  description: string
}

type SuccessResponse = {
  success: true
  posts: PostSummary[]
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

  const postsDir = path.join(process.cwd(), 'src/content/posts')

  try {
    const files = fs.readdirSync(postsDir)
    const mdxFiles = files.filter((file) => file.endsWith('.mdx'))

    const posts: PostSummary[] = mdxFiles.map((file) => {
      const slug = file.replace('.mdx', '')
      const filePath = path.join(postsDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(fileContent)

      return {
        slug,
        title: data.title || '',
        date: data.date || '',
        description: data.description || '',
      }
    })

    // Sort by date descending
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return res.status(200).json({ success: true, posts })
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `讀取文章列表失敗：${err instanceof Error ? err.message : String(err)}`,
    })
  }
}
