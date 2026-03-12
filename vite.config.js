import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
// Use Vite's `mode` (not process.env.NODE_ENV) so @cloudflare/vite-plugin is always
// included during production builds, regardless of any externally set NODE_ENV.
export default defineConfig(({ mode }) => ({
  plugins: [base44({
    // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
    // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
    legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
    hmrNotifier: true,
    navigationNotifier: true,
    visualEditAgent: true
  }), react(), ...(mode !== 'test' ? [cloudflare()] : [])],
  build: {
    rollupOptions: {
      output: {
        format: 'esm',
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },
}));
