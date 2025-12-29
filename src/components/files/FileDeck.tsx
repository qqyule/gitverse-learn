import React from 'react'
import { motion } from 'framer-motion'
import { FileText, FilePlus, FileEdit, Trash2 } from 'lucide-react'
import { useGitStore } from '@/store/gitStore'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface FileDeckProps {
	className?: string
	onFileClick?: (path: string) => void
}

export function FileDeck({ className, onFileClick }: FileDeckProps) {
	const { workingDirectory, stagingArea, add, modifyFile } = useGitStore()

	const { t } = useTranslation()

	const files = Object.entries(workingDirectory)

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'staged':
				return <FilePlus className="w-4 h-4 text-success" />
			case 'modified':
				return <FileEdit className="w-4 h-4 text-warning" />
			case 'deleted':
				return <Trash2 className="w-4 h-4 text-destructive" />
			default:
				return <FileText className="w-4 h-4 text-muted-foreground" />
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'staged':
				return 'border-success/50 bg-success/10'
			case 'modified':
				return 'border-warning/50 bg-warning/10'
			case 'deleted':
				return 'border-destructive/50 bg-destructive/10'
			default:
				return 'border-border bg-card hover:bg-accent/50'
		}
	}

	if (files.length === 0) {
		return (
			<div
				className={cn(
					'flex items-center justify-center text-muted-foreground',
					className
				)}
			>
				<p className="text-sm">{t('file.noFiles')}</p>
			</div>
		)
	}

	return (
		<div className={cn('space-y-2', className)}>
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-medium text-muted-foreground">
					{t('file.workingDirectory')}
				</h3>
				{files.some(([_, f]) => f.status === 'modified') && (
					<button
						onClick={() => add('all')}
						className="text-xs text-primary hover:text-primary/80 transition-colors"
					>
						{t('file.stageAll')}
					</button>
				)}
			</div>

			<div className="grid gap-2">
				{files.map(([path, file], index) => (
					<motion.div
						key={path}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.05 }}
						onClick={() => {
							if (file.status === 'unmodified') {
								modifyFile(path)
							}
							onFileClick?.(path)
						}}
						className={cn(
							'file-card flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
							getStatusColor(file.status)
						)}
					>
						{getStatusIcon(file.status)}
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium truncate text-foreground">
								{path}
							</p>
							<p className="text-xs text-muted-foreground capitalize">
								{file.status}
							</p>
						</div>
						{file.status === 'modified' && (
							<button
								onClick={(e) => {
									e.stopPropagation()
									add([path])
								}}
								className="text-xs px-2 py-1 rounded bg-background border border-border hover:bg-accent transition-colors text-foreground"
							>
								{t('file.stage')}
							</button>
						)}
					</motion.div>
				))}
			</div>

			{/* Staging Area */}
			{Object.keys(stagingArea).length > 0 && (
				<div className="mt-6">
					<h3 className="text-sm font-medium text-muted-foreground mb-2">
						{t('file.stagingArea')}
					</h3>
					<div className="grid gap-2">
						{Object.entries(stagingArea).map(([path, file]) => (
							<motion.div
								key={`staged-${path}`}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								className="flex items-center gap-3 p-3 rounded-lg border border-success/50 bg-success/10"
							>
								<FilePlus className="w-4 h-4 text-success" />
								<p className="text-sm font-medium text-foreground">{path}</p>
							</motion.div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
