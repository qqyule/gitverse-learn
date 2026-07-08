import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import AccountPage from './pages/AccountPage'
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
				<BrowserRouter>
					<Routes>
						<Route element={<Index />} path="/" />
						<Route element={<LearnPage />} path="/learn/:levelId" />
						<Route element={<AccountPage />} path="/account" />
						{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
						<Route element={<NotFound />} path="*" />
					</Routes>
				</BrowserRouter>
			</TooltipProvider>
		</QueryClientProvider>
	</ThemeProvider>
)

export default App
