const remarkFrontmatter = require('remark-frontmatter')
const remarkMdxFrontmatter = require('remark-mdx-frontmatter')

const remarkFrontmatterPlugin = remarkFrontmatter.default ?? remarkFrontmatter
const remarkMdxFrontmatterPlugin =
  remarkMdxFrontmatter.default ?? remarkMdxFrontmatter
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      remarkFrontmatterPlugin,
      [remarkMdxFrontmatterPlugin, { name: 'frontmatter' }],
    ],
  },
})

module.exports = withMDX({
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
})
