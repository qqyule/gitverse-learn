import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GitGraphSvg } from '@/components/git/GitGraphSvg'
import { Terminal } from '@/components/terminal/Terminal'
import { FileDeck } from '@/components/files/FileDeck'
import { LevelSidebar } from '@/components/sidebar/LevelSidebar'
import { levels, getLevelById, Level } from '@/data/levels'
import { useGitStore } from '@/store/gitStore'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageSwitch } from '@/components/ui/language-switch'
import { loadLevelState, saveLevelState } from '@/lib/storage'
import { useProgressStore } from '@/store/progressStore'
import {
	Menu,
	X,
	PartyPopper,
	RotateCcw,
	ChevronRight,
	ChevronLeft,
	TerminalSquare,
	FolderOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export default function LearnPage() {
	const { levelId } = useParams<{ levelId: string }>()
	const navigate = useNavigate()
	const { toast } = useToast()
	const { t, i18n } = useTranslation()

	const [sidebarOpen, setSidebarOpen] = useState(true)
	const [terminalExpanded, setTerminalExpanded] = useState(true)
	const [showSuccess, setShowSuccess] = useState(false)
	const [terminalInput, setTerminalInput] = useState('')

	const gitState = useGitStore()
	const { init, resetState, loadScenario } = gitState
	const { markLevelCompleted, completedLevels } = useProgressStore()

	const currentLevel = getLevelById(levelId || 'level-1') || levels[0]
	const currentIndex = levels.findIndex((l) => l.id === currentLevel.id)
	const hasNext = currentIndex < levels.length - 1
	const hasPrev = currentIndex > 0

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
	}, [
		gitState,
		currentLevel,
		showSuccess,
		toast,
		t,
		getLevelTitle,
		markLevelCompleted,
	])

	// Reset success state when level changes
	useEffect(() => {
		setShowSuccess(false)
	}, [levelId])

	const handleLevelSelect = (level: Level) => {
		navigate(`/learn/${level.id}`)
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
		<div className="flex h-screen w-full bg-background overflow-hidden">
			{/* Sidebar */}
			<AnimatePresence mode="wait">
				{sidebarOpen && (
					<motion.div
						initial={{ width: 0, opacity: 0 }}
						animate={{ width: 320, opacity: 1 }}
						exit={{ width: 0, opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="flex-shrink-0"
					>
						<LevelSidebar
							currentLevel={currentLevel}
							onLevelSelect={handleLevelSelect}
							onCommandClick={(cmd) => setTerminalInput(cmd)}
							className="w-80 h-full"
						/>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Main Content */}
			<div className="flex-1 flex flex-col min-w-0">
				{/* Top Bar */}
				<header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
					<div className="flex items-center gap-3">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setSidebarOpen(!sidebarOpen)}
						>
							{sidebarOpen ? (
								<X className="w-5 h-5" />
							) : (
								<Menu className="w-5 h-5" />
							)}
						</Button>

						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								onClick={handlePrevLevel}
								disabled={!hasPrev}
							>
								<ChevronLeft className="w-4 h-4" />
							</Button>
							<span className="text-sm font-medium text-muted-foreground">
								{t('common.level')} {currentIndex + 1} {t('common.of')}{' '}
								{levels.length}
							</span>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleNextLevel}
								disabled={!hasNext}
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
								<Button onClick={handleNextLevel} className="gap-2">
									<PartyPopper className="w-4 h-4" />
									{t('learn.nextLevel')}
									<ChevronRight className="w-4 h-4" />
								</Button>
							</motion.div>
						)}
						<Button variant="outline" size="sm" onClick={handleReset}>
							<RotateCcw className="w-4 h-4 mr-2" />
							{t('learn.resetBtn')}
						</Button>
						<LanguageSwitch />
						<ThemeToggle />
					</div>
				</header>

				{/* Graph Area */}
				<div className="flex-1 relative overflow-hidden">
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

				{/* Bottom Panel */}
				<div className="border-t border-border bg-card/50 flex h-64">
					{/* Terminal Section (70%) */}
					<div className="flex-[0.7] border-r border-border flex flex-col min-w-0">
						<Terminal
							className="border-0 rounded-none h-full flex-1"
							isExpanded={terminalExpanded}
							onToggle={() => setTerminalExpanded(!terminalExpanded)}
							externalInput={terminalInput}
							onInputChange={setTerminalInput}
						/>
					</div>

					{/* Files Section (30%) */}
					<div className="flex-[0.3] flex flex-col min-w-0 bg-card">
						<div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-secondary/50 h-10">
							<FolderOpen className="w-4 h-4 text-primary" />
							<span className="text-sm font-medium">
								{t('learn.tabs.files')}
							</span>
						</div>
						<div className="flex-1 overflow-y-auto p-4">
							<FileDeck />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
