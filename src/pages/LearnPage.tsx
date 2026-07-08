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
import { getLevelById, levels } from '@/data/levels'
import { useToast } from '@/hooks/use-toast'
import { restartTour, useTour } from '@/hooks/useTour'
import { loadLevelState, saveLevelState } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { useGitStore } from '@/store/gitStore'
import { useProgressStore } from '@/store/progressStore'
import type { Level } from '@/types/git'

function LearnPageContent() {
	const { levelId } = useParams<{ levelId: string }>()
	const navigate = useNavigate()
	const { toast } = useToast()
	const { t } = useTranslation()

	const [sidebarOpen, setSidebarOpen] = useState(true)
	const [terminalExpanded, setTerminalExpanded] = useState(true)
	const [showSuccess, setShowSuccess] = useState(false)
	const [terminalInput, setTerminalInput] = useState('')
	const [activeMobileTab, setActiveMobileTab] = useState<'terminal' | 'files'>('terminal')

	const gitState = useGitStore()
	const { resetState, loadScenario } = gitState
	const { markLevelCompleted, completedLevels } = useProgressStore()
	const { startTour } = useTour({
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
			return translated === key ? level.title : translated
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
				description: t('learn.levelCompleteDesc', { title }),
				title: t('learn.levelComplete'),
			})
		}
	}, [gitState, currentLevel, showSuccess, toast, t, getLevelTitle, markLevelCompleted])

	// Reset success state when the level changes (not only on mount),
	// otherwise the "Next Level" success button stays visible on later,
	// not-yet-completed levels and lets the user skip ahead.
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
			description: t('learn.resetDesc'),
			title: t('learn.resetTitle'),
		})
	}

	const handleNodeClick = (hash: string) => {
		gitState.checkout(hash)
		toast({
			description: t('learn.headAt', { hash: hash.slice(0, 7) }),
			title: t('learn.checkedOut'),
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

	// Enforce linear progression: if a level is reached without its predecessor
	// being completed, send the user back to the first not-yet-completed level
	// (the natural resume point) instead of always jumping to the first level.
	useEffect(() => {
		if (currentIndex > 0) {
			const prevLevelId = levels[currentIndex - 1].id
			if (!completedLevels.includes(prevLevelId)) {
				const resumeLevel = levels.find((l) => !completedLevels.includes(l.id)) || levels[0]
				navigate(`/learn/${resumeLevel.id}`, { replace: true })
				toast({
					description: t('learn.levelLocked'),
					title: t('common.locked'),
					variant: 'destructive',
				})
			}
		}
	}, [currentIndex, completedLevels, navigate, toast, t])

	return (
		<PageTransition className="relative flex h-screen w-full overflow-hidden bg-background">
			{/* Mobile Sidebar Overlay */}
			<AnimatePresence>
				{sidebarOpen && window.innerWidth < 768 && (
					<motion.div
						animate={{ opacity: 1 }}
						className="absolute inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						onClick={() => setSidebarOpen(false)}
					/>
				)}
			</AnimatePresence>

			{/* Sidebar */}
			<AnimatePresence mode="wait">
				{sidebarOpen && (
					<motion.div
						animate={{ opacity: 1, width: 320, x: 0 }}
						className={cn(
							'z-50 h-full flex-shrink-0 border-border border-r bg-sidebar',
							'absolute top-0 left-0 shadow-xl md:static md:shadow-none'
						)}
						exit={{ opacity: 0, width: 0, x: -320 }}
						initial={{ opacity: 0, width: 0, x: -320 }}
						transition={{ duration: 0.2 }}
					>
						<LevelSidebar
							className="h-full w-80"
							currentLevel={currentLevel}
							onClose={() => setSidebarOpen(false)}
							onCommandClick={(cmd) => setTerminalInput(cmd)}
							onLevelSelect={handleLevelSelect}
						/>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Main Content */}
			<div className="relative z-0 flex h-full min-w-0 flex-1 flex-col">
				{/* Top Bar */}
				<header className="flex flex-shrink-0 items-center justify-between border-border border-b bg-card/50 px-4 py-3">
					<div className="flex items-center gap-3">
						<Button onClick={() => setSidebarOpen(!sidebarOpen)} size="icon" variant="ghost">
							{sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
						</Button>

						<div className="flex items-center gap-2">
							<Button
								className="hidden sm:flex"
								disabled={!hasPrev}
								onClick={handlePrevLevel}
								size="icon"
								variant="ghost"
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<span className="whitespace-nowrap font-medium text-muted-foreground text-sm">
								{t('common.level')} {currentIndex + 1}
								<span className="hidden sm:inline">
									{' '}
									{t('common.of')} {levels.length}
								</span>
							</span>
							<Button
								className="hidden sm:flex"
								disabled={!hasNext}
								onClick={handleNextLevel}
								size="icon"
								variant="ghost"
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>

					<div className="flex items-center gap-2">
						{showSuccess && hasNext && (
							<motion.div
								animate={{ scale: 1 }}
								className="flex items-center gap-2"
								initial={{ scale: 0 }}
							>
								<Button className="gap-2" onClick={handleNextLevel} size="sm">
									<PartyPopper className="h-4 w-4" />
									<span className="hidden sm:inline">{t('learn.nextLevel')}</span>
									<ChevronRight className="h-4 w-4 sm:hidden" />
								</Button>
							</motion.div>
						)}
						<Button className="hidden sm:flex" onClick={handleReset} size="sm" variant="outline">
							<RotateCcw className="mr-2 h-4 w-4" />
							{t('learn.resetBtn')}
						</Button>
						<Button className="sm:hidden" onClick={handleReset} size="icon" variant="outline">
							<RotateCcw className="h-4 w-4" />
						</Button>
						<div className="hidden sm:block">
							<LanguageSwitch />
						</div>
						<Button
							className="hidden sm:flex"
							onClick={() => {
								restartTour()
								startTour()
							}}
							size="icon"
							title={t('tour.buttons.restart')}
							variant="ghost"
						>
							<HelpCircle className="h-4 w-4" />
						</Button>
						<ThemeToggle />
					</div>
				</header>

				{/* Graph Area */}
				<div className="relative flex-1 overflow-hidden" data-tour="git-graph">
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
								animate={{ opacity: 1 }}
								className="pointer-events-none absolute inset-0 flex items-center justify-center"
								exit={{ opacity: 0 }}
								initial={{ opacity: 0 }}
							>
								<motion.div
									animate={{ scale: 1 }}
									className="rounded-full bg-success/20 p-8 backdrop-blur-sm"
									initial={{ scale: 0 }}
									transition={{ damping: 20, stiffness: 300, type: 'spring' }}
								>
									<PartyPopper className="h-16 w-16 text-success" />
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Mobile Tab Switcher */}
				<div className="flex border-border border-t bg-card md:hidden">
					<button
						className={cn(
							'flex flex-1 items-center justify-center p-3 font-medium text-sm transition-colors',
							activeMobileTab === 'terminal'
								? 'border-primary border-b-2 bg-primary/10 text-primary'
								: 'text-muted-foreground hover:bg-muted/50'
						)}
						onClick={() => setActiveMobileTab('terminal')}
						type="button"
					>
						<TerminalSquare className="mr-2 inline-block h-4 w-4" />
						Terminal
					</button>
					<button
						className={cn(
							'flex flex-1 items-center justify-center p-3 font-medium text-sm transition-colors',
							activeMobileTab === 'files'
								? 'border-primary border-b-2 bg-primary/10 text-primary'
								: 'text-muted-foreground hover:bg-muted/50'
						)}
						onClick={() => setActiveMobileTab('files')}
						type="button"
					>
						<FolderOpen className="mr-2 inline-block h-4 w-4" />
						{t('learn.tabs.files')}
					</button>
				</div>

				{/* Bottom Panel */}
				<div className="flex h-64 flex-shrink-0 border-border border-t bg-card/50 md:h-64">
					{/* Terminal Section */}
					<div
						className={cn(
							'flex min-w-0 flex-col transition-all duration-300',
							'md:flex-[0.7] md:border-border md:border-r',
							'w-full md:w-auto', // Mobile full width
							activeMobileTab === 'terminal' ? 'flex' : 'hidden md:flex' // Mobile toggle
						)}
						data-tour="terminal"
					>
						<Terminal
							className="h-full flex-1 rounded-none border-0"
							externalInput={terminalInput}
							isExpanded={terminalExpanded}
							onInputChange={setTerminalInput}
							onToggle={() => setTerminalExpanded(!terminalExpanded)}
						/>
					</div>

					{/* Files Section */}
					<div
						className={cn(
							'flex min-w-0 flex-col bg-card transition-all duration-300',
							'md:flex-[0.3]',
							'w-full md:w-auto', // Mobile full width
							activeMobileTab === 'files' ? 'flex' : 'hidden md:flex' // Mobile toggle
						)}
						data-tour="files"
					>
						<div className="hidden h-10 items-center gap-2 border-border border-b bg-secondary/50 px-4 py-2 md:flex">
							<FolderOpen className="h-4 w-4 text-primary" />
							<span className="font-medium text-sm">{t('learn.tabs.files')}</span>
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
			<div className="flex min-h-screen flex-col items-center justify-center p-4">
				<h1 className="mb-4 font-bold text-2xl">Something went wrong</h1>
				<p className="mb-4 text-muted-foreground">
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
