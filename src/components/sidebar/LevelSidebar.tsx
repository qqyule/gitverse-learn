import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
	BookOpen,
	Target,
	Lightbulb,
	CheckCircle2,
	Circle,
	ChevronRight,
	Lock,
} from 'lucide-react'
import { Level, levels } from '@/data/levels'
import { cn } from '@/lib/utils'
import { useGitStore } from '@/store/gitStore'
import { useProgressStore } from '@/store/progressStore'

interface LevelSidebarProps {
	currentLevel: Level
	onLevelSelect: (level: Level) => void
	onCommandClick?: (command: string) => void
	className?: string
}

export function LevelSidebar({
	currentLevel,
	onLevelSelect,
	onCommandClick,
	className,
}: LevelSidebarProps) {
	const gitState = useGitStore()
	const { t, i18n } = useTranslation()
	const completedLevels = useProgressStore((state) => state.completedLevels)

	/**
	 * 获取关卡的翻译文本
	 */
	const getLevelText = (
		levelId: string,
		field: string,
		fallback: string
	): string => {
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
	const getLevelHints = (
		levelId: string,
		fallbackHints: string[]
	): string[] => {
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
	const phases = levels.reduce((acc, level) => {
		if (!acc[level.phase]) {
			acc[level.phase] = []
		}
		acc[level.phase].push(level)
		return acc
	}, {} as Record<number, Level[]>)

	return (
		<div
			className={cn(
				'flex flex-col h-full bg-sidebar border-r border-sidebar-border',
				className
			)}
		>
			{/* Header */}
			<div
				className="p-4 border-b border-sidebar-border"
				data-tour="sidebar-header"
			>
				<h2 className="text-lg font-bold gradient-text">GitMaster Visual</h2>
				<p className="text-xs text-muted-foreground mt-1">{t('home.badge')}</p>
			</div>

			{/* Current Level Info */}
			<div
				className="p-4 border-b border-sidebar-border space-y-4"
				data-tour="level-info"
			>
				<div className="space-y-2">
					<div className="level-badge">
						<BookOpen className="w-3.5 h-3.5" />
						<span>
							{t('common.level')} {levels.indexOf(currentLevel) + 1}
						</span>
					</div>
					<h3 className="text-lg font-semibold">
						{getLevelText(currentLevel.id, 'title', currentLevel.title)}
					</h3>
					<p className="text-xs text-primary/70">
						{getLevelText(currentLevel.id, 'subtitle', currentLevel.subtitle)}
					</p>
				</div>

				<p className="text-sm text-muted-foreground leading-relaxed">
					{getLevelText(
						currentLevel.id,
						'description',
						currentLevel.description
					)}
				</p>

				{/* Goal */}
				<div className="p-3 rounded-lg bg-secondary/50 border border-border">
					<div className="flex items-center gap-2 text-primary mb-2">
						<Target className="w-4 h-4" />
						<span className="text-sm font-medium">{t('sidebar.goal')}</span>
					</div>
					<p className="text-sm text-foreground">
						{getLevelText(currentLevel.id, 'goal', currentLevel.goal)}
					</p>
				</div>
			</div>

			{/* Hints */}
			<div className="p-4 border-b border-sidebar-border">
				<div className="flex items-center gap-2 text-warning mb-3">
					<Lightbulb className="w-4 h-4" />
					<span className="text-sm font-medium">{t('sidebar.hints')}</span>
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
								key={i}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: i * 0.1 }}
								className="group flex items-start gap-2 text-xs text-muted-foreground"
							>
								<ChevronRight className="w-3 h-3 mt-0.5 text-primary" />
								<span>{hint}</span>
							</motion.li>
						)
					})}
				</ul>

				{/* Suggested Commands */}
				{currentLevel.commands && currentLevel.commands.length > 0 && (
					<div className="mt-4">
						<span className="text-xs font-medium text-muted-foreground block mb-2">
							{t('sidebar.commands', 'Commands')}:
						</span>
						<div className="flex flex-wrap gap-2">
							{currentLevel.commands.map((cmd) => (
								<button
									key={cmd}
									onClick={() => onCommandClick?.(cmd)}
									className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded transition-colors border border-primary/20"
									title={t('sidebar.clickToFill', 'Click to fill')}
								>
									{cmd}
								</button>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Level List */}
			<div className="flex-1 overflow-y-auto p-4" data-tour="level-list">
				<h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
					{t('sidebar.levels')}
				</h4>
				<div className="space-y-4">
					{Object.entries(phases).map(([phase, phaseLevels]) => (
						<div key={phase}>
							<p className="text-xs text-muted-foreground mb-2">
								{getPhaseTitle(Number(phase))}
							</p>
							<div className="space-y-1">
								{phaseLevels.map((level) => {
									const isActive = level.id === currentLevel.id
									// Check persistence store first, fall back to current validation for immediate feedback
									const isCompleted =
										completedLevels.includes(level.id) ||
										level.validation(gitState)

									const index = levels.findIndex((l) => l.id === level.id)
									const isLocked =
										index > 0 && !completedLevels.includes(levels[index - 1].id)

									return (
										<button
											key={level.id}
											disabled={isLocked}
											onClick={() => !isLocked && onLevelSelect(level)}
											className={cn(
												'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors',
												isActive
													? 'bg-primary/20 text-primary'
													: isLocked
													? 'opacity-50 cursor-not-allowed text-muted-foreground'
													: 'hover:bg-secondary/50 text-foreground'
											)}
										>
											{isLocked ? (
												<Lock className="w-4 h-4 text-muted-foreground" />
											) : isCompleted ? (
												<CheckCircle2 className="w-4 h-4 text-success" />
											) : (
												<Circle className="w-4 h-4 text-muted-foreground" />
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
