import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { IncomingForm, File } from 'formidable'

// 停用 Next.js 內建的 body parser，因為我們要用 formidable 處理 multipart
export const config = {
    api: {
        bodyParser: false,
    },
}

type SuccessResponse = {
    success: true
    url: string
    filename: string
}

type ErrorResponse = {
    success: false
    error: string
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
    // 僅限開發環境
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
            success: false,
            error: '此功能僅在本地開發環境中可用',
        })
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: '只允許 POST 方法' })
    }

    try {
        const form = new IncomingForm({
            maxFileSize: MAX_SIZE,
            keepExtensions: true,
        })

        const [fields, files] = await form.parse(req)

        // 取得 slug
        const slugArray = fields.slug
        const slug = Array.isArray(slugArray) ? slugArray[0] : slugArray
        if (!slug) {
            return res.status(400).json({
                success: false,
                error: '缺少必要參數：slug',
            })
        }

        // 驗證 slug 格式
        if (!/^[a-z0-9-]+$/.test(slug)) {
            return res.status(400).json({
                success: false,
                error: 'slug 格式不正確',
            })
        }

        // 取得上傳的檔案
        const fileArray = files.image
        const uploadedFile = Array.isArray(fileArray) ? fileArray[0] : fileArray
        if (!uploadedFile) {
            return res.status(400).json({
                success: false,
                error: '未上傳任何圖片',
            })
        }

        const file = uploadedFile as File

        // 驗證檔案類型
        if (!file.mimetype || !ALLOWED_TYPES.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                error: `不支援的圖片格式。支援的格式：${ALLOWED_TYPES.join(', ')}`,
            })
        }

        // 建立目標資料夾
        const publicDir = path.join(process.cwd(), 'public', 'posts', slug)
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true })
        }

        // 產生唯一檔名
        const ext = path.extname(file.originalFilename || '.jpg')
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 8)
        const filename = `img-${timestamp}-${randomStr}${ext}`
        const targetPath = path.join(publicDir, filename)

        // 複製檔案到目標位置
        const fileBuffer = fs.readFileSync(file.filepath)
        fs.writeFileSync(targetPath, fileBuffer)

        // 清理暫存檔案
        fs.unlinkSync(file.filepath)

        // 回傳公開 URL
        const url = `/posts/${slug}/${filename}`

        return res.status(200).json({
            success: true,
            url,
            filename,
        })
    } catch (err) {
        console.error('圖片上傳錯誤:', err)
        return res.status(500).json({
            success: false,
            error: `上傳失敗：${err instanceof Error ? err.message : String(err)}`,
        })
    }
}
