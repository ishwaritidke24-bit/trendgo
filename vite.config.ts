// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig as lovableConfig } from "@lovable.dev/vite-tanstack-config";

export default async function configure(env: any) {
  const configFn = lovableConfig({
    tanstackStart: {
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      // nitro/vite builds from this
      server: { entry: "server" },
    },
  });
  const config = await configFn(env);

  // In Vite 8+, native resolve.tsconfigPaths is preferred over the legacy vite-tsconfig-paths plugin
  if (Array.isArray(config.plugins)) {
    config.plugins = config.plugins
      .flat(Infinity)
      .filter((p: any) => p && p.name !== "vite-tsconfig-paths" && p.name !== "vite-plugin-tsconfig-paths");
  }
  config.resolve = {
    ...config.resolve,
    tsconfigPaths: true,
  };

  return config;
}
