import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Repo is served from https://<user>.github.io/drum_practice/ on GitHub Pages,
// so assets need that path prefix. Local dev/preview stay at "/".
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/drum_practice/" : "/",
  plugins: [react()],
});
