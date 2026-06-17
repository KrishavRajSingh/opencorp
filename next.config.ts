import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@duckdb/node-bindings",
    "@duckdb/node-api",
    "@duckdb/node-bindings-darwin-arm64",
    "@duckdb/node-bindings-darwin-x64",
    "@duckdb/node-bindings-linux-arm64",
    "@duckdb/node-bindings-linux-x64",
    "@duckdb/node-bindings-win32-arm64",
    "@duckdb/node-bindings-win32-x64",
  ],
};

export default nextConfig;
