/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { ComponentType } from 'react'
  import type { Frontmatter } from './content/posts'
  const MDXComponent: ComponentType
  export const frontmatter: Frontmatter
  export default MDXComponent
}
