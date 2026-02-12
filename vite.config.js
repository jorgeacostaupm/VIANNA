import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";

const githubRepoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const githubPagesBase =
  process.env.GITHUB_ACTIONS && githubRepoName ? `/${githubRepoName}/` : null;
const defaultBasePath = githubPagesBase || "/VANA/";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || defaultBasePath,
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("src", import.meta.url)),
    },
  },
});
