# Repository Guidelines

## 專案結構與模組分工
- `src/pages` 放置 Next.js（pages router）路由入口。
- `src/components` 為可重用元件，`src/lib` 放共用工具函式。
- `src/content/posts` 存放 MDX 文章，對應 `/posts/[slug]`。
- `src/assets` 與 `public` 放靜態資源；樣式集中在 `src/index.css` 與 `tailwind.config.js`。
- `tools` 收錄輔助資源（例如 `tools/new-post.html`）。

## 建置、測試與開發指令
- `yarn dev` 啟動本機開發伺服器並支援熱更新。
- `yarn build` 產出正式版建置結果。
- `yarn start` 在本機啟動正式版伺服器。
- `yarn lint` 執行 Next.js ESLint 檢查（`next/core-web-vitals`）。

## 程式碼風格與命名慣例
- 使用 TypeScript + React 函式型元件。
- 縮排 2 個空白；字串盡量使用單引號。
- 樣式以 Tailwind utility classes 為主，自訂 CSS 放在 `src/index.css`。
- 元件與檔名使用具描述性的 PascalCase（如 `SiteShell`、`PostCard`）。

## 測試指引
- 目前專案尚未建立專屬測試套件。
- 若新增邏輯密集功能，請一併補上測試並文件化執行方式。
- 現階段以 `yarn lint` 與 `yarn dev` 手動驗證為基準。

## 內容與 MDX 備註
- 新文章請放在 `src/content/posts`，包含 frontmatter 與 `.mdx` 內容。
- 請延續既有的 slug 與檔名規則，避免影響路由。

## Commit 與 Pull Request 指南
- Commit 訊息偏向簡短、祈使語氣、具體描述（歷史例：`Add ...`、`Remove ...`、`fix: ...`）。
- 可視需要使用慣例前綴，但整體語氣請與專案一致。
- PR 請包含摘要、關聯議題連結，且 UI 變更需附截圖或錄影。

## 設定檔提示
- 主要設定檔為 `next.config.mjs`、`tsconfig.json`、`tailwind.config.js`。
- 若新增或調整開發指令，請同步更新 `README.md`。
