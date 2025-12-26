import React, { useState, useEffect } from 'react'
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

	const gitState = useGitStore()
	const { init, resetState } = gitState

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
			const title = getLevelTitle(currentLevel)
			toast({
				title: t('learn.levelComplete'),
				description: t('learn.levelCompleteDesc', { title }),
			})
		}
	}, [gitState, currentLevel, showSuccess, toast, t, getLevelTitle])

	// Reset success state when level changes
	useEffect(() => {
		setShowSuccess(false)
	}, [levelId])

	const handleLevelSelect = (level: Level) => {
		navigate(`/learn/${level.id}`)
		resetState()
	}

	const handleNextLevel = () => {
		if (hasNext) {
			const nextLevel = levels[currentIndex + 1]
			navigate(`/learn/${nextLevel.id}`)
			resetState()
		}
	}

	const handlePrevLevel = () => {
		if (hasPrev) {
			const prevLevel = levels[currentIndex - 1]
			navigate(`/learn/${prevLevel.id}`)
			resetState()
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
				<div className="border-t border-border bg-card/50">
					<Tabs defaultValue="terminal" className="w-full">
						<div className="flex items-center justify-between px-4 py-2 border-b border-border">
							<TabsList className="bg-secondary/50">
								<TabsTrigger value="terminal" className="gap-2">
									<TerminalSquare className="w-4 h-4" />
									{t('learn.tabs.terminal')}
								</TabsTrigger>
								<TabsTrigger value="files" className="gap-2">
									<FolderOpen className="w-4 h-4" />
									{t('learn.tabs.files')}
								</TabsTrigger>
							</TabsList>
						</div>

						<TabsContent value="terminal" className="m-0">
							<Terminal
								className="border-0 rounded-none"
								isExpanded={terminalExpanded}
								onToggle={() => setTerminalExpanded(!terminalExpanded)}
							/>
						</TabsContent>

						<TabsContent value="files" className="m-0 p-4 h-64 overflow-y-auto">
							<FileDeck />
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	)
}
