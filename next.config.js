const { remarkCodeHike } = require("@code-hike/mdx");
const theme = require("shiki/themes/dark-plus.json");
const nextConfig = {
  assetPrefix: "/build-your-own-react/",
  images: {
    unoptimized: true,
  },
};
const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [[remarkCodeHike, { theme }]],
  },
  ...nextConfig,
});

module.exports = withMDX({
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  eslint: { ignoreDuringBuilds: true },
});
