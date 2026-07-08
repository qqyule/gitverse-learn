import { motion } from 'framer-motion'
import {
	BookOpen,
	CheckCircle2,
	ChevronRight,
	Circle,
	Lightbulb,
	Lock,
	Target,
	X,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { levels } from '@/data/levels'
import { staggerChildren } from '@/lib/animations'
import { cn } from '@/lib/utils'
import { useGitStore } from '@/store/gitStore'
import { useProgressStore } from '@/store/progressStore'
import type { Level } from '@/types/git'

interface LevelSidebarProps {
	className?: string
	currentLevel: Level
	onClose?: () => void
	onCommandClick?: (command: string) => void
	onLevelSelect: (level: Level) => void
}

export function LevelSidebar({
	currentLevel,
	onLevelSelect,
	onCommandClick,
	onClose,
	className,
}: LevelSidebarProps) {
	const gitState = useGitStore()
	const { t } = useTranslation()
	const completedLevels = useProgressStore((state) => state.completedLevels)
	const listRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (listRef.current) {
			staggerChildren(listRef.current.querySelectorAll('.level-btn'))
		}
	}, [])

	/**
	 * 获取关卡的翻译文本
	 */
	const getLevelText = (levelId: string, field: string, fallback: string): string => {
		const key = `levels.${levelId}.${field}`
		const translated = t(key, { returnObjects: true })
		// 检查是否返回了翻译 key 本身（未找到翻译）
		if (typeof translated === 'string' && translated !== key) {
			return translated
		}
		return fallback
	}

	/**
	 * 获取关卡的翻译提示数组
	 */
	const getLevelHints = (levelId: string, fallbackHints: string[]): string[] => {
		const key = `levels.${levelId}.hints`
		const translated = t(key, { returnObjects: true })
		if (Array.isArray(translated)) {
			return translated as string[]
		}
		return fallbackHints
	}

	/**
	 * 获取阶段标题的翻译
	 */
	const getPhaseTitle = (phase: number): string => {
		const phaseKey = `phases.${phase}`
		return t(phaseKey)
	}

	// Group levels by phase
	const phases = levels.reduce(
		(acc, level) => {
			if (!acc[level.phase]) {
				acc[level.phase] = []
			}
			acc[level.phase].push(level)
			return acc
		},
		{} as Record<number, Level[]>
	)

	return (
		<div
			className={cn('flex h-full flex-col border-sidebar-border border-r bg-sidebar', className)}
		>
			{/* Header */}
			<div
				className="flex items-center justify-between border-sidebar-border border-b p-4"
				data-tour="sidebar-header"
			>
				<div>
					<h2 className="gradient-text font-bold text-lg">GitMaster Visual</h2>
					<p className="mt-1 text-muted-foreground text-xs">{t('home.badge')}</p>
				</div>
				{onClose && (
					<button
						aria-label="Close sidebar"
						className="rounded-full p-2 transition-colors hover:bg-muted/50 md:hidden"
						onClick={onClose}
						type="button"
					>
						<X className="h-5 w-5 text-muted-foreground" />
					</button>
				)}
			</div>

			{/* Current Level Info */}
			<div className="space-y-4 border-sidebar-border border-b p-4" data-tour="level-info">
				<div className="space-y-2">
					<div className="level-badge">
						<BookOpen className="h-3.5 w-3.5" />
						<span>
							{t('common.level')} {levels.indexOf(currentLevel) + 1}
						</span>
					</div>
					<h3 className="font-semibold text-lg">
						{getLevelText(currentLevel.id, 'title', currentLevel.title)}
					</h3>
					<p className="text-primary/70 text-xs">
						{getLevelText(currentLevel.id, 'subtitle', currentLevel.subtitle)}
					</p>
				</div>

				<p className="text-muted-foreground text-sm leading-relaxed">
					{getLevelText(currentLevel.id, 'description', currentLevel.description)}
				</p>

				{/* Goal */}
				<div className="rounded-lg border border-border bg-secondary/50 p-3">
					<div className="mb-2 flex items-center gap-2 text-primary">
						<Target className="h-4 w-4" />
						<span className="font-medium text-sm">{t('sidebar.goal')}</span>
					</div>
					<p className="text-foreground text-sm">
						{getLevelText(currentLevel.id, 'goal', currentLevel.goal)}
					</p>
				</div>
			</div>

			{/* Hints */}
			<div className="border-sidebar-border border-b p-4">
				<div className="mb-3 flex items-center gap-2 text-warning">
					<Lightbulb className="h-4 w-4" />
					<span className="font-medium text-sm">{t('sidebar.hints')}</span>
				</div>
				<ul className="space-y-2">
					{getLevelHints(currentLevel.id, currentLevel.hints).map((hint, i) => {
						// Extract command from hint if possible (simple heuristic: text inside quotes or mimicking command structure)
						// For now, let's just make the whole hint clickable if it looks like it contains a command or just rely on the user passing specific commands in a future update.
						// Actually, the user asked for "git init etc commands can be clicked".
						// The level data has `commands` array! We should probably use that or try to parse the hint.
						// Let's use the explicit `commands` array from the level data for a "Suggested Commands" section,
						// OR just check if the hint contains a code block style or quotes.
						// Simpler approach requested: "git init etc commands user can directly click in help bar".
						// Let's look at `currentLevel.commands`.

						return (
							<motion.li
								animate={{ opacity: 1, x: 0 }}
								className="group flex items-start gap-2 text-muted-foreground text-xs"
								initial={{ opacity: 0, x: -10 }}
								key={i}
								transition={{ delay: i * 0.1 }}
							>
								<ChevronRight className="mt-0.5 h-3 w-3 text-primary" />
								<span>{hint}</span>
							</motion.li>
						)
					})}
				</ul>

				{/* Suggested Commands */}
				{currentLevel.commands && currentLevel.commands.length > 0 && (
					<div className="mt-4">
						<span className="mb-2 block font-medium text-muted-foreground text-xs">
							{t('sidebar.commands', 'Commands')}:
						</span>
						<div className="flex flex-wrap gap-2">
							{currentLevel.commands.map((cmd) => (
								<button
									className="rounded border border-primary/20 bg-primary/10 px-2 py-1 text-primary text-xs transition-colors hover:bg-primary/20"
									key={cmd}
									onClick={() => onCommandClick?.(cmd)}
									title={t('sidebar.clickToFill', 'Click to fill')}
									type="button"
								>
									{cmd}
								</button>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Level List */}
			<div className="flex-1 overflow-y-auto p-4" data-tour="level-list" ref={listRef}>
				<h4 className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
					{t('sidebar.levels')}
				</h4>
				<div className="space-y-4">
					{Object.entries(phases).map(([phase, phaseLevels]) => (
						<div key={phase}>
							<p className="mb-2 text-muted-foreground text-xs">{getPhaseTitle(Number(phase))}</p>
							<div className="space-y-1">
								{phaseLevels.map((level) => {
									const isActive = level.id === currentLevel.id
									// Check persistence store first, fall back to current validation for immediate feedback
									const isCompleted =
										completedLevels.includes(level.id) || level.validation(gitState)

									const index = levels.findIndex((l) => l.id === level.id)
									const isLocked = index > 0 && !completedLevels.includes(levels[index - 1].id)

									return (
										<button
											className={cn(
												'level-btn flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
												isActive
													? 'bg-primary/20 text-primary'
													: isLocked
														? 'cursor-not-allowed text-muted-foreground opacity-50'
														: 'text-foreground hover:bg-secondary/50'
											)}
											disabled={isLocked}
											key={level.id}
											onClick={() => !isLocked && onLevelSelect(level)}
											style={{ opacity: 0 }} // Initial state
											type="button"
										>
											{isLocked ? (
												<Lock className="h-4 w-4 text-muted-foreground" />
											) : isCompleted ? (
												<CheckCircle2 className="h-4 w-4 text-success" />
											) : (
												<Circle className="h-4 w-4 text-muted-foreground" />
											)}
											<span className="truncate">
												{getLevelText(level.id, 'title', level.title)}
											</span>
										</button>
									)
								})}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
