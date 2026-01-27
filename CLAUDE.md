# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用指令

```bash
yarn dev      # 啟動開發伺服器
yarn build    # 生產環境建置
yarn lint     # 執行 ESLint 檢查
```

## 架構概覽

這是一個使用 Next.js 14 (Pages Router) + TypeScript + Tailwind CSS 的繁體中文部落格。

### 內容管理

MDX 文章存放在 `src/content/posts/`，每篇文章需：

1. 建立 `.mdx` 檔案，包含 frontmatter：
   ```yaml
   ---
   title: "文章標題"
   description: "描述"
   date: "2026-01-01"
   readTime: "5"  # 只需輸入數字，「分鐘」會自動帶入
   tags:
     - 標籤一
   featured: false
   ---
   ```

2. 在 `src/content/posts/index.ts` 手動註冊文章（import 組件並加入 `posts` 陣列）

### 核心組件

- `SiteShell` - 全站共用佈局（header、footer、導航）
- `PostLayout` - 文章頁面佈局（標題、日期、標籤、prose 區塊）
- `Seo` - SEO meta 標籤

### 樣式系統

- Tailwind CSS 搭配 `@tailwindcss/typography` 處理 prose 內容
- CSS 變數定義在 `src/index.css`（`--background`、`--foreground`、`--border` 等）
- 自訂色彩：`brand-*`（品牌紫藍色）、`neutral-*`（中性灰）
- 常用樣式類別：`.page-shell`、`.section-stack`、`.link-primary`

### 設定檔

- 網站資訊（名稱、描述、URL）在 `src/config/site.ts`
- MDX 解析設定在 `next.config.mjs`（使用 remark-frontmatter）
