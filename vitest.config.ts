import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic', // Explicitly setting jsxRuntime
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true, // Commenting out globals: true again
    setupFiles: [path.resolve(__dirname, "./src/test/setup.ts")], // Explicitly resolve path
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    transformMode: {
      web: [/\.(ts|tsx)$/],
      ssr: [/\.(ts|tsx)$/],
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
