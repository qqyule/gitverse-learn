import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import LearnPage from './pages/LearnPage'
import NotFound from './pages/NotFound'

const queryClient = new QueryClient()

const App = () => (
	<ThemeProvider>
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<Toaster />
				<Sonner />
				<HashRouter>
					<Routes>
						<Route path="/" element={<Index />} />
						<Route path="/learn/:levelId" element={<LearnPage />} />
						{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
						<Route path="*" element={<NotFound />} />
					</Routes>
				</HashRouter>
			</TooltipProvider>
		</QueryClientProvider>
	</ThemeProvider>
)

export default App
