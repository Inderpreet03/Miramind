// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// DEPLOY_TARGET is set explicitly by the buildCommand in vercel.json, so it does not depend on
// Vercel's "Automatically expose System Environment Variables" project setting. VERCEL=1 is a
// fallback for `vercel build` run locally.
const isVercel =
  process.env.DEPLOY_TARGET === "vercel" || Boolean(process.env.VERCEL);

// On Vercel the app is built as a static SPA: `spa.enabled` prerenders dist/client/_shell.html,
// which vercel.json serves for every non-asset path. This app has no server functions and no
// route loaders, so SSR buys nothing here, and a static build removes the serverless runtime
// entirely — the deploy cannot 404 on a missing function or an unsupported node runtime.
// `nitro: false` skips the deploy plugin, which would otherwise target Cloudflare Workers.
//
// Off Vercel nothing changes: the Lovable sandbox keeps its cloudflare-module nitro build and a
// plain `vite build` still emits dist/client + dist/server with SSR intact.
export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
    server: { entry: "server" },
    ...(isVercel ? { spa: { enabled: true } } : {}),
  },
  ...(isVercel ? { nitro: false as const } : {}),
});
