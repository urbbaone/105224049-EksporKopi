import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Opsi root-level untuk outputFileTracingRoot
  outputFileTracingRoot: path.join(__dirname, "./"),
  
  // Opsi konfigurasi Turbopack (opsional jika dibutuhkan)
  turbopack: {
    root: path.join(__dirname, "./"),
  },
};

export default nextConfig;