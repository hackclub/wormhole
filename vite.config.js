import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command }) => ({
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
              target: "http://localhost:3000",
              changeOrigin: true,
            },
          },
        }
      : undefined,
}));
