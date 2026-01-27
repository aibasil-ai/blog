import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

type RequestBody = {
  slug: string
  confirmTitle: string
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

function slugToComponentName(slug: string): string {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function slugToFrontmatterName(slug: string): string {
  const componentName = slugToComponentName(slug)
  return componentName.charAt(0).toLowerCase() + componentName.slice(1) + 'Frontmatter'
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: '只接受 DELETE 請求' })
  }

  const body = req.body as RequestBody
  const { slug, confirmTitle } = body

  if (!slug || !confirmTitle) {
    return res.status(400).json({ success: false, error: '缺少必要欄位' })
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ success: false, error: 'slug 格式無效' })
  }

  const postsDir = path.join(process.cwd(), 'src/content/posts')
  const filePath = path.join(postsDir, `${slug}.mdx`)
  const indexPath = path.join(postsDir, 'index.ts')

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: '文章不存在' })
  }

  try {
    // Read and parse MDX file to verify title
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(fileContent)

    if (data.title !== confirmTitle) {
      return res.status(400).json({
        success: false,
        error: '標題不符，無法刪除文章',
      })
    }

    // Update index.ts to remove the post
    const indexContent = fs.readFileSync(indexPath, 'utf-8')

    const componentName = slugToComponentName(slug)
    const frontmatterName = slugToFrontmatterName(slug)

    // Remove import statement (3 lines)
    const importPattern = new RegExp(
      `import ${componentName}, \\{\\s*frontmatter as ${frontmatterName},\\s*\\} from '\\.\\/${slug}\\.mdx'\\n`,
      'g'
    )

    // Remove post entry from posts array
    // Match the entire object from { to }, including all properties
    const postEntryPattern = new RegExp(
      `\\s*\\{\\s*slug: '${slug}',[\\s\\S]*?Component: ${componentName},\\s*\\},?`,
      'g'
    )

    let updatedIndex = indexContent
      .replace(importPattern, '')
      .replace(postEntryPattern, '')

    // Clean up any double newlines that might result from removal
    updatedIndex = updatedIndex.replace(/\n{3,}/g, '\n\n')

    fs.writeFileSync(indexPath, updatedIndex, 'utf-8')

    // Delete the MDX file
    fs.unlinkSync(filePath)

    return res.status(200).json({
      success: true,
      message: '文章已刪除',
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `刪除文章失敗：${err instanceof Error ? err.message : String(err)}`,
    })
  }
}
