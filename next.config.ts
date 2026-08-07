import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Emits a minimal, self-contained `.next/standalone` build (only the files
  // required at runtime) so the Docker image can stay small. See Dockerfile.
  output: "standalone",
  // Pins the workspace root to this project so Turbopack doesn't get
  // confused by an unrelated lockfile higher up in the filesystem.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
