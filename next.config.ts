// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;


// import type { NextConfig } from "next";
// import path from "path";

// const isProd = process.env.NODE_ENV === "production";


// const nextConfig: NextConfig = {
//   webpack: (config, { isServer }) => {
//     if (!isServer) {
//       config.resolve.alias = {
//         ...config.resolve.alias,
//         fs: path.resolve(__dirname, 'mocks/fs.js'),
//       };
//     }
//     return config;
//   },
//   output: "export", // Required for GitHub Pages
//   basePath: isProd ? "/memory-haven" : "", // Change to your actual GitHub repo name
//   assetPrefix: isProd ? "/memory-haven/" : "", // Ensures assets load properly
//   images: {
//     unoptimized: true, // Required for static exports
//   },
// };

// export default nextConfig;


import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        fs: path.resolve(__dirname, "mocks/fs.js"),
      };
    }
    return config;
  },
  reactStrictMode: true,
};

export default nextConfig;
