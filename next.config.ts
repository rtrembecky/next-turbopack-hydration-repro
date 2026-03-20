import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // disabled so useEffect fires once on mount (avoids StrictMode double-fire noise)
};

export default nextConfig;
