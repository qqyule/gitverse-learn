import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import AccountPage from './pages/AccountPage'
import ApiConsolePage from './pages/ApiConsolePage'
import EditorPage from './pages/EditorPage'
import EducationPage from './pages/EducationPage'
import EmbedPage from './pages/EmbedPage'
import Index from './pages/Index'
import LeaderboardPage from './pages/LeaderboardPage'
import LearnPage from './pages/LearnPage'
import NotFound from './pages/NotFound'
import PricingPage from './pages/PricingPage'
import SharedLevelPage from './pages/SharedLevelPage'

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
						<Route element={<EditorPage />} path="/editor" />
						<Route element={<PricingPage />} path="/pricing" />
						<Route element={<LeaderboardPage />} path="/leaderboard" />
						<Route element={<SharedLevelPage />} path="/shared" />
						<Route element={<ApiConsolePage />} path="/api" />
						<Route element={<EducationPage />} path="/education" />
						<Route element={<EmbedPage />} path="/embed/:lessonId" />
						{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
						<Route element={<NotFound />} path="*" />
					</Routes>
				</BrowserRouter>
			</TooltipProvider>
		</QueryClientProvider>
	</ThemeProvider>
)

export default App
