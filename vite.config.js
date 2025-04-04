import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command, mode }) => ({
  plugins: [react(), tailwindcss()],
  server:
    command === "serve"
      ? {
          https: {
            key: fs.readFileSync("localhost+2-key.pem"),
            cert: fs.readFileSync("localhost+2.pem"),
          },
          port: 5173,
          proxy: {
            "/api": {
              target: "http://localhost:3001",
              changeOrigin: true,
            },
          },
        }
      : undefined,
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: mode === "development",
  },
  // Define environment variables that should be exposed to the client
  define: {
    "process.env.VITE_SLACK_CLIENT_ID": JSON.stringify(
      process.env.VITE_SLACK_CLIENT_ID
    ),
  },
}));
