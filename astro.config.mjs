// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
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
