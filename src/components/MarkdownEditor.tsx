import { useCallback, useMemo, useRef, useState, useId } from 'react'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

type UploadStatus = {
  type: 'idle' | 'uploading' | 'success' | 'error'
  message?: string
}

type ViewMode = 'write' | 'preview' | 'split'

type MarkdownEditorProps = {
  label?: string
  value: string
  onChange: (value: string) => void
  slug?: string
  placeholder?: string
  helperText?: string
  minRows?: number
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const CODE_BLOCK_REGEX = /```(\w+)?\n([\s\S]*?)```/g

const renderMarkdownPreview = (content: string) => {
  const codeBlocks: string[] = []
  let html = content.replace(CODE_BLOCK_REGEX, (_, lang, code) => {
    const index = codeBlocks.length
    const language = lang ? `language-${lang}` : 'language-text'
    const escaped = escapeHtml((code ?? '').trim())
    codeBlocks.push(
      `<pre class="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs leading-relaxed"><code class="${language}">${escaped}</code></pre>`
    )
    return `__CODE_BLOCK_${index}__`
  })

  html = escapeHtml(html)

  html = html
    .replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" class="my-4 w-full rounded-xl border border-neutral-200" />'
    )
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-brand-600 underline decoration-brand-300 underline-offset-4">$1</a>'
    )
    .replace(/^###### (.+)$/gm, '<h6 class="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">$1</h6>')
    .replace(/^##### (.+)$/gm, '<h5 class="mt-4 text-sm font-semibold text-neutral-700">$1</h5>')
    .replace(/^#### (.+)$/gm, '<h4 class="mt-4 text-base font-semibold text-neutral-800">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="mt-6 text-lg font-semibold text-neutral-900">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="mt-8 text-xl font-semibold text-neutral-900">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="mt-10 text-2xl font-bold text-neutral-900">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="rounded bg-neutral-100 px-1 py-0.5 text-xs font-medium">$1</code>')
    .replace(
      /^> (.+)$/gm,
      '<blockquote class="my-4 border-l-4 border-brand-200 bg-neutral-50 pl-4 italic text-neutral-900">$1</blockquote>'
    )
    .replace(/^---$/gm, '<hr class="my-6 border-neutral-200" />')

  const lines = html.split('\n')
  const blocks: string[] = []
  let paragraph = ''
  let listType: 'ul' | 'ol' | null = null
  let listItems: string[] = []

  const flushParagraph = () => {
    if (paragraph.trim()) {
      blocks.push(`<p class="my-3">${paragraph}</p>`)
      paragraph = ''
    }
  }

  const flushList = () => {
    if (listType && listItems.length) {
      const listClass =
        listType === 'ul'
          ? 'my-3 ml-5 list-disc text-neutral-900'
          : 'my-3 ml-5 list-decimal text-neutral-900'
      blocks.push(`<${listType} class="${listClass}">${listItems.join('')}</${listType}>`)
      listItems = []
      listType = null
    }
  }

  const pushBlock = (line: string) => {
    flushParagraph()
    flushList()
    blocks.push(line)
  }

  lines.forEach((line) => {
    if (!line.trim()) {
      flushParagraph()
      flushList()
      return
    }

    if (line.startsWith('__CODE_BLOCK_')) {
      pushBlock(line)
      return
    }

    if (
      line.startsWith('<h') ||
      line.startsWith('<blockquote') ||
      line.startsWith('<hr')
    ) {
      pushBlock(line)
      return
    }

    const unordered = line.match(/^\s*[-*]\s+(.+)/)
    if (unordered) {
      flushParagraph()
      if (listType !== 'ul') {
        flushList()
        listType = 'ul'
      }
      listItems.push(`<li>${unordered[1]}</li>`)
      return
    }

    const ordered = line.match(/^\s*\d+\.\s+(.+)/)
    if (ordered) {
      flushParagraph()
      if (listType !== 'ol') {
        flushList()
        listType = 'ol'
      }
      listItems.push(`<li>${ordered[1]}</li>`)
      return
    }

    if (listType) {
      flushList()
    }

    paragraph = paragraph ? `${paragraph}<br />${line}` : line
  })

  flushParagraph()
  flushList()

  const output = blocks.join('')
  return output.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => codeBlocks[Number(index)] || '')
}

function MarkdownEditor({
  label = '內容',
  value,
  onChange,
  slug,
  placeholder = '使用 Markdown / MDX 撰寫內容...',
  helperText,
  minRows = 18,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ type: 'idle' })
  const [isDragging, setIsDragging] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const textareaId = useId()

  const updateValue = (nextValue: string, selection?: { start: number; end: number }) => {
    onChange(nextValue)
    if (selection && textareaRef.current) {
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(selection.start, selection.end)
        }
      })
    }
  }

  const getSelection = () => {
    const textarea = textareaRef.current
    if (!textarea) return null
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    }
  }

  const wrapSelection = (before: string, after: string, placeholderText: string) => {
    const selection = getSelection()
    if (!selection) return

    const { start, end } = selection
    const selectedText = value.slice(start, end)
    const insertText = selectedText || placeholderText
    const nextValue =
      value.slice(0, start) + before + insertText + after + value.slice(end)
    const cursorStart = start + before.length
    const cursorEnd = cursorStart + insertText.length

    updateValue(nextValue, { start: cursorStart, end: cursorEnd })
  }

  const prefixLines = (prefix: string) => {
    const selection = getSelection()
    if (!selection) return

    const { start, end } = selection
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const lineEnd = value.indexOf('\n', end)
    const blockEnd = lineEnd === -1 ? value.length : lineEnd
    const block = value.slice(lineStart, blockEnd)
    const updated = block
      .split('\n')
      .map((line) => (line.trim() ? `${prefix}${line}` : line))
      .join('\n')

    const nextValue = value.slice(0, lineStart) + updated + value.slice(blockEnd)
    const delta = updated.length - block.length
    updateValue(nextValue, { start, end: end + delta })
  }

  const insertCodeBlock = () => {
    const selection = getSelection()
    if (!selection) return

    const { start, end } = selection
    const selectedText = value.slice(start, end) || '在這裡輸入程式碼'
    const snippet = `\n\`\`\`\n${selectedText}\n\`\`\`\n`
    const nextValue = value.slice(0, start) + snippet + value.slice(end)
    const cursorStart = start + 5
    const cursorEnd = cursorStart + selectedText.length
    updateValue(nextValue, { start: cursorStart, end: cursorEnd })
  }

  const insertLink = () => {
    const selection = getSelection()
    if (!selection) return

    const { start, end } = selection
    const selectedText = value.slice(start, end) || '連結文字'
    const snippet = `[${selectedText}](https://)`
    const nextValue = value.slice(0, start) + snippet + value.slice(end)
    const cursorStart = start + selectedText.length + 3
    const cursorEnd = cursorStart + 8
    updateValue(nextValue, { start: cursorStart, end: cursorEnd })
  }

  const uploadImage = useCallback(
    async (file: File) => {
      if (!slug) {
        setUploadStatus({ type: 'error', message: '請先填入 slug 再上傳圖片' })
        return
      }

      setUploadStatus({ type: 'uploading', message: '圖片上傳中...' })

      const formData = new FormData()
      formData.append('image', file)
      formData.append('slug', slug)

      try {
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        })
        const data = await response.json()

        if (data.success) {
          const textarea = textareaRef.current
          const selection = textarea
            ? { start: textarea.selectionStart, end: textarea.selectionEnd }
            : { start: value.length, end: value.length }

          const imageMarkdown = `![${file.name}](${data.url})`
          const nextValue =
            value.slice(0, selection.start) +
            imageMarkdown +
            value.slice(selection.end)
          updateValue(nextValue, {
            start: selection.start + imageMarkdown.length,
            end: selection.start + imageMarkdown.length,
          })
          setUploadStatus({ type: 'success', message: '圖片已插入內容' })
          setTimeout(() => setUploadStatus({ type: 'idle' }), 2000)
        } else {
          setUploadStatus({ type: 'error', message: data.error })
        }
      } catch (err) {
        setUploadStatus({
          type: 'error',
          message: `上傳失敗：${err instanceof Error ? err.message : String(err)}`,
        })
      }
    },
    [slug, value]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        uploadImage(file)
      }
      e.target.value = ''
    },
    [uploadImage]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = Array.from(e.clipboardData?.items ?? [])
      const imageItem = items.find((item) => item.type.startsWith('image/'))
      if (imageItem) {
        const file = imageItem.getAsFile()
        if (file) {
          e.preventDefault()
          uploadImage(file)
        }
      }
    },
    [uploadImage]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files?.[0]
      if (file) {
        if (file.type.startsWith('image/')) {
          uploadImage(file)
        } else {
          setUploadStatus({ type: 'error', message: '請拖入圖片檔案' })
        }
      }
    },
    [uploadImage]
  )

  const previewHtml = useMemo(() => renderMarkdownPreview(value), [value])

  const toolbarButtonClass =
    'rounded-md border border-transparent px-2 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-600 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300'

  const viewButtonClass = (active: boolean) =>
    cn(
      'rounded-full px-3 py-1 text-xs font-semibold transition',
      active
        ? 'bg-neutral-900 text-white'
        : 'border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100'
    )

  const showEditor = viewMode !== 'preview'
  const showPreview = viewMode !== 'write'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <label
            htmlFor={textareaId}
            className="text-sm font-semibold text-neutral-800"
          >
            {label} <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-neutral-500">
            支援 Markdown / MDX，拖放或貼上圖片可即時上傳並插入內容
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {uploadStatus.type !== 'idle' && (
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold',
                uploadStatus.type === 'uploading'
                  ? 'bg-brand-50 text-brand-600'
                  : uploadStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
              )}
            >
              {uploadStatus.message}
            </span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={!slug || uploadStatus.type === 'uploading'}
          >
            插入圖片
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white/80 px-3 py-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => wrapSelection('**', '**', '粗體文字')}
            aria-label="粗體"
          >
            B
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => wrapSelection('*', '*', '斜體文字')}
            aria-label="斜體"
          >
            I
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => prefixLines('## ')}
            aria-label="標題二"
          >
            H2
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => prefixLines('### ')}
            aria-label="標題三"
          >
            H3
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => prefixLines('> ')}
            aria-label="引用"
          >
            Quote
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => prefixLines('- ')}
            aria-label="清單"
          >
            List
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={() => wrapSelection('`', '`', '程式碼')}
            aria-label="行內程式碼"
          >
            {'</>'}
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={insertCodeBlock}
            aria-label="程式碼區塊"
          >
            {`{ }`}
          </button>
          <button
            type="button"
            className={toolbarButtonClass}
            onClick={insertLink}
            aria-label="連結"
          >
            Link
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={viewButtonClass(viewMode === 'write')}
            onClick={() => setViewMode('write')}
          >
            編輯
          </button>
          <button
            type="button"
            className={viewButtonClass(viewMode === 'preview')}
            onClick={() => setViewMode('preview')}
          >
            預覽
          </button>
          <button
            type="button"
            className={viewButtonClass(viewMode === 'split')}
            onClick={() => setViewMode('split')}
          >
            分割
          </button>
        </div>
      </div>

      <div className={cn('grid gap-4', viewMode === 'split' && 'lg:grid-cols-2')}>
        {showEditor && (
          <div
            className={cn(
              'relative rounded-xl border bg-white/80 shadow-sm',
              isDragging
                ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-200'
                : 'border-neutral-200'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-brand-500/10">
                <p className="text-sm font-semibold text-brand-600">
                  放開即可上傳圖片
                </p>
              </div>
            )}
            <textarea
              ref={textareaRef}
              id={textareaId}
              name="content"
              required
              rows={minRows}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onPaste={handlePaste}
              className="h-full w-full rounded-xl bg-transparent px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
              placeholder={placeholder}
            />
          </div>
        )}
        {showPreview && (
          <div className="rounded-xl border border-neutral-200 bg-white/90 p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                即時預覽
              </span>
              <span className="text-xs text-neutral-400">同步更新</span>
            </div>
            <div className="mt-3">
              {value.trim() ? (
                <div
                  className="prose prose-neutral max-w-none text-sm text-neutral-900"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <p className="text-sm text-neutral-400 italic">
                  開始輸入內容以預覽 Markdown
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-xs text-neutral-500">{helperText}</p>
      )}
    </div>
  )
}

export default MarkdownEditor
