import { AnimatePresence, motion } from 'framer-motion'
import {
	ChevronLeft,
	ChevronRight,
	FolderOpen,
	HelpCircle,
	Menu,
	PartyPopper,
	RotateCcw,
	TerminalSquare,
	X,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { FileDeck } from '@/components/files/FileDeck'
import { GitGraphSvg } from '@/components/git/GitGraphSvg'
import { PageTransition } from '@/components/layout/PageTransition'
import { LevelSidebar } from '@/components/sidebar/LevelSidebar'
import { Terminal } from '@/components/terminal/Terminal'
import { Button } from '@/components/ui/button'
import { LanguageSwitch } from '@/components/ui/language-switch'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { getLevelById, type Level, levels } from '@/data/levels'
import { useToast } from '@/hooks/use-toast'
import { restartTour, useTour } from '@/hooks/useTour'
import { loadLevelState, saveLevelState } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { useGitStore } from '@/store/gitStore'
import { useProgressStore } from '@/store/progressStore'

function LearnPageContent() {
	const { levelId } = useParams<{ levelId: string }>()
	const navigate = useNavigate()
	const { toast } = useToast()
	const { t, i18n } = useTranslation()

	const [sidebarOpen, setSidebarOpen] = useState(true)
	const [terminalExpanded, setTerminalExpanded] = useState(true)
	const [showSuccess, setShowSuccess] = useState(false)
	const [terminalInput, setTerminalInput] = useState('')
	const [activeMobileTab, setActiveMobileTab] = useState<'terminal' | 'files'>('terminal')

	const gitState = useGitStore()
	const { init, resetState, loadScenario } = gitState
	const { markLevelCompleted, completedLevels } = useProgressStore()
	const { startTour, isActive: isTourActive } = useTour({
		autoStart: true,
		autoStartDelay: 1000,
	})

	const currentLevel = getLevelById(levelId || 'level-1') || levels[0]
	const currentIndex = levels.findIndex((l) => l.id === currentLevel.id)
	const hasNext = currentIndex < levels.length - 1
	const hasPrev = currentIndex > 0

	// Handle initial sidebar state based on screen size
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) {
				setSidebarOpen(false)
			} else {
				setSidebarOpen(true)
			}
		}

		// Set initial state
		handleResize()

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	/**
	 * 获取当前关卡的翻译标题
	 */
	const getLevelTitle = React.useCallback(
		(level: Level): string => {
			const key = `levels.${level.id}.title`
			const translated = t(key)
			return translated !== key ? translated : level.title
		},
		[t]
	)

	// Check level completion
	useEffect(() => {
		if (currentLevel.validation(gitState) && !showSuccess) {
			setShowSuccess(true)
			markLevelCompleted(currentLevel.id)
			const title = getLevelTitle(currentLevel)
			toast({
				title: t('learn.levelComplete'),
				description: t('learn.levelCompleteDesc', { title }),
			})
		}
	}, [gitState, currentLevel, showSuccess, toast, t, getLevelTitle, markLevelCompleted])

	// Reset success state when level changes
	useEffect(() => {
		setShowSuccess(false)
	}, [])

	const handleLevelSelect = (level: Level) => {
		navigate(`/learn/${level.id}`)
		if (window.innerWidth < 768) {
			setSidebarOpen(false)
		}
	}

	const handleNextLevel = () => {
		if (hasNext) {
			const nextLevel = levels[currentIndex + 1]
			navigate(`/learn/${nextLevel.id}`)
		}
	}

	const handlePrevLevel = () => {
		if (hasPrev) {
			const prevLevel = levels[currentIndex - 1]
			navigate(`/learn/${prevLevel.id}`)
		}
	}

	const handleReset = () => {
		resetState()
		setShowSuccess(false)
		toast({
			title: t('learn.resetTitle'),
			description: t('learn.resetDesc'),
		})
	}

	const handleNodeClick = (hash: string) => {
		gitState.checkout(hash)
		toast({
			title: t('learn.checkedOut'),
			description: t('learn.headAt', { hash: hash.slice(0, 7) }),
		})
	}

	// Load state when level changes
	useEffect(() => {
		if (levelId) {
			const savedState = loadLevelState(levelId)
			if (savedState) {
				// 加载当前关卡已保存的状态
				loadScenario(savedState)
			} else if (currentIndex > 0) {
				// 无保存状态时，尝试继承前一关卡的状态
				const prevLevelId = levels[currentIndex - 1].id
				const prevState = loadLevelState(prevLevelId)
				if (prevState) {
					// 继承前一关卡的 Git 状态，但清空命令历史
					loadScenario({
						...prevState,
						commandHistory: [],
						lastOutput: '',
					})
				} else {
					resetState()
				}
			} else {
				// 第一关或无前置关卡
				resetState()
			}
		}
	}, [levelId, currentIndex, resetState, loadScenario])

	// Save state changes
	useEffect(() => {
		if (!levelId) return

		const unsubscribe = useGitStore.subscribe((state) => {
			saveLevelState(levelId, state)
		})

		return () => {
			unsubscribe()
		}
	}, [levelId])

	// Enforce linear progression
	useEffect(() => {
		if (currentIndex > 0) {
			const prevLevelId = levels[currentIndex - 1].id
			if (!completedLevels.includes(prevLevelId)) {
				navigate(`/learn/${levels[0].id}`, { replace: true })
				toast({
					title: t('common.locked'),
					description: t('learn.levelLocked'),
					variant: 'destructive',
				})
			}
		}
	}, [currentIndex, completedLevels, navigate, toast, t])

	return (
		<PageTransition className="flex h-screen w-full bg-background overflow-hidden relative">
			{/* Mobile Sidebar Overlay */}
			<AnimatePresence>
				{sidebarOpen && window.innerWidth < 768 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="absolute inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
						onClick={() => setSidebarOpen(false)}
					/>
				)}
			</AnimatePresence>

			{/* Sidebar */}
			<AnimatePresence mode="wait">
				{sidebarOpen && (
					<motion.div
						initial={{ width: 0, opacity: 0, x: -320 }}
						animate={{ width: 320, opacity: 1, x: 0 }}
						exit={{ width: 0, opacity: 0, x: -320 }}
						transition={{ duration: 0.2 }}
						className={cn(
							'flex-shrink-0 h-full border-r border-border bg-sidebar z-50',
							'absolute md:static top-0 left-0 shadow-xl md:shadow-none'
						)}
					>
						<LevelSidebar
							currentLevel={currentLevel}
							onLevelSelect={handleLevelSelect}
							onCommandClick={(cmd) => setTerminalInput(cmd)}
							onClose={() => setSidebarOpen(false)}
							className="w-80 h-full"
						/>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Main Content */}
			<div className="flex-1 flex flex-col min-w-0 h-full relative z-0">
				{/* Top Bar */}
				<header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
					<div className="flex items-center gap-3">
						<Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
							{sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
						</Button>

						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								onClick={handlePrevLevel}
								disabled={!hasPrev}
								className="hidden sm:flex"
							>
								<ChevronLeft className="w-4 h-4" />
							</Button>
							<span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
								{t('common.level')} {currentIndex + 1}
								<span className="hidden sm:inline">
									{' '}
									{t('common.of')} {levels.length}
								</span>
							</span>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleNextLevel}
								disabled={!hasNext}
								className="hidden sm:flex"
							>
								<ChevronRight className="w-4 h-4" />
							</Button>
						</div>
					</div>

					<div className="flex items-center gap-2">
						{showSuccess && hasNext && (
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								className="flex items-center gap-2"
							>
								<Button onClick={handleNextLevel} className="gap-2" size="sm">
									<PartyPopper className="w-4 h-4" />
									<span className="hidden sm:inline">{t('learn.nextLevel')}</span>
									<ChevronRight className="w-4 h-4 sm:hidden" />
								</Button>
							</motion.div>
						)}
						<Button variant="outline" size="sm" onClick={handleReset} className="hidden sm:flex">
							<RotateCcw className="w-4 h-4 mr-2" />
							{t('learn.resetBtn')}
						</Button>
						<Button variant="outline" size="icon" onClick={handleReset} className="sm:hidden">
							<RotateCcw className="w-4 h-4" />
						</Button>
						<div className="hidden sm:block">
							<LanguageSwitch />
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => {
								restartTour()
								startTour()
							}}
							title={t('tour.buttons.restart')}
							className="hidden sm:flex"
						>
							<HelpCircle className="w-4 h-4" />
						</Button>
						<ThemeToggle />
					</div>
				</header>

				{/* Graph Area */}
				<div className="flex-1 relative overflow-hidden" data-tour="git-graph">
					<div
						className="absolute inset-0"
						style={{
							background:
								'radial-gradient(ellipse at center, hsl(var(--primary) / 0.05), transparent 70%)',
						}}
					/>
					<GitGraphSvg className="h-full p-4" onNodeClick={handleNodeClick} />

					{/* Success Overlay */}
					<AnimatePresence>
						{showSuccess && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="absolute inset-0 pointer-events-none flex items-center justify-center"
							>
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ type: 'spring', stiffness: 300, damping: 20 }}
									className="bg-success/20 backdrop-blur-sm rounded-full p-8"
								>
									<PartyPopper className="w-16 h-16 text-success" />
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Mobile Tab Switcher */}
				<div className="md:hidden flex border-t border-border bg-card">
					<button
						type="button"
						className={cn(
							'flex-1 p-3 text-sm font-medium flex items-center justify-center transition-colors',
							activeMobileTab === 'terminal'
								? 'bg-primary/10 text-primary border-b-2 border-primary'
								: 'text-muted-foreground hover:bg-muted/50'
						)}
						onClick={() => setActiveMobileTab('terminal')}
					>
						<TerminalSquare className="w-4 h-4 inline-block mr-2" />
						Terminal
					</button>
					<button
						type="button"
						className={cn(
							'flex-1 p-3 text-sm font-medium flex items-center justify-center transition-colors',
							activeMobileTab === 'files'
								? 'bg-primary/10 text-primary border-b-2 border-primary'
								: 'text-muted-foreground hover:bg-muted/50'
						)}
						onClick={() => setActiveMobileTab('files')}
					>
						<FolderOpen className="w-4 h-4 inline-block mr-2" />
						{t('learn.tabs.files')}
					</button>
				</div>

				{/* Bottom Panel */}
				<div className="flex-shrink-0 border-t border-border bg-card/50 flex h-64 md:h-64">
					{/* Terminal Section */}
					<div
						className={cn(
							'flex flex-col min-w-0 transition-all duration-300',
							'md:flex-[0.7] md:border-r md:border-border',
							'w-full md:w-auto', // Mobile full width
							activeMobileTab === 'terminal' ? 'flex' : 'hidden md:flex' // Mobile toggle
						)}
						data-tour="terminal"
					>
						<Terminal
							className="border-0 rounded-none h-full flex-1"
							isExpanded={terminalExpanded}
							onToggle={() => setTerminalExpanded(!terminalExpanded)}
							externalInput={terminalInput}
							onInputChange={setTerminalInput}
						/>
					</div>

					{/* Files Section */}
					<div
						className={cn(
							'flex flex-col min-w-0 bg-card transition-all duration-300',
							'md:flex-[0.3]',
							'w-full md:w-auto', // Mobile full width
							activeMobileTab === 'files' ? 'flex' : 'hidden md:flex' // Mobile toggle
						)}
						data-tour="files"
					>
						<div className="hidden md:flex items-center gap-2 px-4 py-2 border-b border-border bg-secondary/50 h-10">
							<FolderOpen className="w-4 h-4 text-primary" />
							<span className="text-sm font-medium">{t('learn.tabs.files')}</span>
						</div>
						<div className="flex-1 overflow-y-auto p-4">
							<FileDeck />
						</div>
					</div>
				</div>
			</div>
		</PageTransition>
	)
}

// Wrap the main component with ErrorBoundary
const WrappedLearnPage = () => (
	<ErrorBoundary
		fallback={
			<div className="flex flex-col items-center justify-center min-h-screen p-4">
				<h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
				<p className="text-muted-foreground mb-4">
					An error occurred while loading the learning page.
				</p>
				<Button onClick={() => window.location.reload()}>Reload Page</Button>
			</div>
		}
	>
		<LearnPageContent />
	</ErrorBoundary>
)

export default WrappedLearnPage
