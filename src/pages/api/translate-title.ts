import type { NextApiRequest, NextApiResponse } from 'next'
import translate from 'google-translate-api-x'

type SuccessResponse = {
  success: true
  slug: string
  translated: string
}

type ErrorResponse = {
  success: false
  error: string
}

type ApiResponse = SuccessResponse | ErrorResponse

function textToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: '只接受 POST 請求' })
  }

  const { title } = req.body

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ success: false, error: '缺少 title 參數' })
  }

  // If title is already English, just convert to slug
  if (!/[\u4e00-\u9fff]/.test(title)) {
    const slug = textToSlug(title)
    return res.status(200).json({
      success: true,
      slug,
      translated: title,
    })
  }

  try {
    const result = await translate(title, { from: 'zh-TW', to: 'en' })
    const translated = result.text
    const slug = textToSlug(translated)

    return res.status(200).json({
      success: true,
      slug,
      translated,
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `翻譯失敗：${err instanceof Error ? err.message : String(err)}`,
    })
  }
}
