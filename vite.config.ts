import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(() => ({
	// Relative base makes the build portable across any static host
	// (GitHub Pages project sites, sub-paths, custom domains) without extra config.
	base: './',
	build: {
		// Split heavy vendors into separate chunks for better caching & TTI.
		rollupOptions: {
			output: {
				manualChunks: {
					charts: ['recharts'],
					d3: ['d3'],
					framer: ['framer-motion'],
					radix: [
						'@radix-ui/react-dialog',
						'@radix-ui/react-dropdown-menu',
						'@radix-ui/react-select',
						'@radix-ui/react-tabs',
						'@radix-ui/react-tooltip',
					],
					react: ['react', 'react-dom', 'react-router-dom'],
				},
			},
		},
	},
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src'),
		},
	},
	server: {
		host: '::',
		port: 5173,
	},
}))
