import path from "path";
import type { NextConfig } from "next";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Prefer this app as tracing root when other lockfiles exist on the machine.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
