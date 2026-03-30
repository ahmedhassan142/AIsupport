
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore TypeScript build errors
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  
  
  // Ignore ESLint errors during build
 
  // For development, you can also disable type checking
  // but the above will work for both dev and prod
};

export default nextConfig;