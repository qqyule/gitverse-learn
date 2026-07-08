/// <reference types="vitest" />

import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src'),
		},
	},
	test: {
		coverage: {
			exclude: ['node_modules/', 'src/test/', '**/*.d.ts'],
			reporter: ['text', 'json', 'html'],
		},
		environment: 'jsdom',
		globals: true,
		include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		setupFiles: ['./src/test/setup.ts'],
	},
})
