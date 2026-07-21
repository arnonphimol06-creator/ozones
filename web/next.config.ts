import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev route indicator/devtools bundle should be dev-only, but this
  // Next.js version ships it in `next build` output too unless disabled here.
  ...(process.env.NODE_ENV === "production" ? { devIndicators: false } : {}),
};

export default nextConfig;
