import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  allowedDevOrigins: ["localhost:3000", "192.168.1.104:3000", "192.168.1.104:3001"],
};

export default nextConfig;
