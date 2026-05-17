import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg", "bcryptjs"],
  outputFileTracingIncludes: {
    "/**/*": [
      "./node_modules/@prisma/adapter-pg/**/*",
      "./node_modules/@prisma/client/**/*",
      "./node_modules/.prisma/**/*",
      "./node_modules/pg/**/*",
      "./node_modules/bcryptjs/**/*",
    ],
  },
};

export default nextConfig;
