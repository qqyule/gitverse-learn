import { motion } from 'framer-motion'
import { FileEdit, FilePlus, FileText, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useGitStore } from '@/store/gitStore'

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
				return <FilePlus className="h-4 w-4 text-success" />
			case 'modified':
				return <FileEdit className="h-4 w-4 text-warning" />
			case 'deleted':
				return <Trash2 className="h-4 w-4 text-destructive" />
			default:
				return <FileText className="h-4 w-4 text-muted-foreground" />
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
			<div className={cn('flex items-center justify-center text-muted-foreground', className)}>
				<p className="text-sm">{t('file.noFiles')}</p>
			</div>
		)
	}

	return (
		<div className={cn('space-y-2', className)}>
			<div className="mb-4 flex items-center justify-between">
				<h3 className="font-medium text-muted-foreground text-sm">{t('file.workingDirectory')}</h3>
				{files.some(([_, f]) => f.status === 'modified') && (
					<button
						className="text-primary text-xs transition-colors hover:text-primary/80"
						onClick={() => add('all')}
						type="button"
					>
						{t('file.stageAll')}
					</button>
				)}
			</div>

			<div className="grid gap-2">
				{files.map(([path, file], index) => (
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className={cn(
							'file-card flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
							getStatusColor(file.status)
						)}
						initial={{ opacity: 0, y: 20 }}
						key={path}
						onClick={() => {
							if (file.status === 'unmodified') {
								modifyFile(path)
							}
							onFileClick?.(path)
						}}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								if (file.status === 'unmodified') {
									modifyFile(path)
								}
								onFileClick?.(path)
							}
						}}
						role="button"
						tabIndex={0}
						transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
					>
						{getStatusIcon(file.status)}
						<div className="min-w-0 flex-1">
							<p className="truncate font-medium text-foreground text-sm">{path}</p>
							<p className="text-muted-foreground text-xs capitalize">{file.status}</p>
						</div>
						{file.status === 'modified' && (
							<button
								className="rounded border border-border bg-background px-2 py-1 text-foreground text-xs transition-colors hover:bg-accent"
								onClick={(e) => {
									e.stopPropagation()
									add([path])
								}}
								type="button"
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
					<h3 className="mb-2 font-medium text-muted-foreground text-sm">
						{t('file.stagingArea')}
					</h3>
					<div className="grid gap-2">
						{Object.entries(stagingArea).map(([path]) => (
							<motion.div
								animate={{ opacity: 1, y: 0 }}
								className="flex items-center gap-3 rounded-lg border border-success/50 bg-success/10 p-3"
								initial={{ opacity: 0, y: 10 }}
								key={`staged-${path}`}
							>
								<FilePlus className="h-4 w-4 text-success" />
								<p className="font-medium text-foreground text-sm">{path}</p>
							</motion.div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
