import { defineConfig } from 'bunup'

export default defineConfig({
	entry: ['src/index.ts', 'src/cli/index.ts'],
	format: ['esm', 'cjs'],
})
