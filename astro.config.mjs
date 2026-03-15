// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  vite: {
    // @ts-expect-error - @tailwindcss/vite type is incompatible with Astro 6's bundled Vite type
    plugins: [tailwindcss()],
    ssr: {
      external: ['node:async_hooks']
    }
  },

  integrations: [react()],
  adapter: cloudflare({
    imageService: 'compile'
  }),
  output: 'server',
  image: {
    remotePatterns: [{ protocol: 'https' }],
  }
});
