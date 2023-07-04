import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from 'remark-gfm';
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import mdx from "@next/mdx";

const withMDX = mdx({
    extension: /\.mdx?$/,
    options: {
        remarkPlugins: [remarkMath, remarkGfm, remarkRehype],
        rehypePlugins: [rehypeKatex, rehypeStringify],
    }
});

/** @type {import('next').NextConfig} */
const nextConfig = withMDX({
    reactStrictMode: true,
    transpilePackages: ['packages/private-market-utils'],
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
});

export default nextConfig;