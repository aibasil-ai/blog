import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkBreaks from 'remark-breaks'
import createMDX from '@next/mdx'

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      remarkFrontmatter,
      [remarkMdxFrontmatter, { name: 'frontmatter' }],
      remarkBreaks,
    ],
  },
})

export default withMDX({
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
})
