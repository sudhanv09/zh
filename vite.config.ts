import { defineConfig } from 'vite'
import viteTsConfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/solid-start/plugin/vite'

export default defineConfig({
  plugins: [

    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart(),
  ],
})
