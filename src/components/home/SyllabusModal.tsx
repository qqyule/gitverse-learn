import anime from 'animejs'
import { Circle, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { type Level, levels } from '@/data/levels'

interface SyllabusModalProps {
	isOpen: boolean
	onClose: () => void
}

export function SyllabusModal({ isOpen, onClose }: SyllabusModalProps) {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const overlayRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const listRef = useRef<HTMLDivElement>(null)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
		return () => setMounted(false)
	}, [])

	useEffect(() => {
		if (isOpen) {
			// Lock body scroll
			document.body.style.overflow = 'hidden'

			// Animate Overlay
			if (overlayRef.current) {
				// Reset opacity
				overlayRef.current.style.opacity = '0'
				anime({
					targets: overlayRef.current,
					opacity: [0, 1],
					duration: 400,
					easing: 'easeOutQuad',
				})
			}

			// Animate Content
			if (contentRef.current) {
				contentRef.current.style.opacity = '0'
				anime({
					targets: contentRef.current,
					opacity: [0, 1],
					scale: [0.9, 1],
					translateY: [20, 0],
					duration: 500,
					delay: 100,
					easing: 'easeOutElastic(1, .8)',
				})
			}

			// Stagger List Items
			if (listRef.current) {
				// Select all items with class .syllabus-item
				const items = listRef.current.querySelectorAll('.syllabus-item')
				if (items.length > 0) {
					// Reset opacity first just in case
					items.forEach((el) => {
						;(el as HTMLElement).style.opacity = '0'
					})

					setTimeout(() => {
						anime({
							targets: items,
							opacity: [0, 1],
							translateY: [20, 0],
							delay: anime.stagger(50),
							duration: 600,
							easing: 'easeOutExpo',
						})
					}, 200)
				}
			}
		} else {
			document.body.style.overflow = ''
		}

		return () => {
			document.body.style.overflow = ''
		}
	}, [isOpen])

	const handleClose = () => {
		// Animate Out
		if (overlayRef.current && contentRef.current) {
			const timeline = anime.timeline({
				complete: onClose,
			})

			timeline
				.add({
					targets: contentRef.current,
					opacity: 0,
					scale: 0.9,
					translateY: 20,
					duration: 300,
					easing: 'easeInQuad',
				})
				.add(
					{
						targets: overlayRef.current,
						opacity: 0,
						duration: 300,
						easing: 'easeInQuad',
					},
					'-=200'
				)
		} else {
			onClose()
		}
	}

	if (!isOpen || !mounted) return null

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

	const getLevelText = (id: string, field: string, fallback: string) => {
		const key = `levels.${id}.${field}`
		const val = t(key)
		return val !== key ? val : fallback
	}

	const getPhaseTitle = (phase: number) => t(`phases.${phase}`)

	// Use Portal to escape parent transforms
	return createPortal(
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
			{/* Backdrop */}
			<div
				ref={overlayRef}
				className="absolute inset-0 bg-background/80 backdrop-blur-sm"
				onClick={handleClose}
				style={{ opacity: 0 }}
			/>

			{/* Modal Content */}
			<div
				ref={contentRef}
				className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
				style={{ opacity: 0 }}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50">
					<h2 className="text-xl font-bold">{t('home.syllabusButton')}</h2>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleClose}
						className="rounded-full hover:bg-secondary"
					>
						<X className="w-5 h-5" />
					</Button>
				</div>

				{/* Scrollable List */}
				<div className="flex-1 overflow-y-auto p-6">
					<div ref={listRef} className="space-y-8">
						{Object.entries(phases).map(([phase, phaseLevels]) => (
							<div key={phase} className="space-y-4">
								<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
									<span className="w-1.5 h-1.5 rounded-full bg-primary" />
									{getPhaseTitle(Number(phase))}
								</h3>
								<div className="grid gap-3 sm:grid-cols-2">
									{phaseLevels.map((level, index) => (
										<div
											key={level.id}
											style={{ opacity: 0 }} // Initial state for stagger
											className="syllabus-item group relative p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-default"
										>
											<div className="flex items-start gap-3">
												<div className="mt-1">
													<Circle className="w-4 h-4 text-primary/40" />
												</div>
												<div>
													<h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
														{getLevelText(level.id, 'title', level.title)}
													</h4>
													<p className="text-xs text-muted-foreground mt-1 line-clamp-2">
														{getLevelText(level.id, 'description', level.description)}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Footer */}
				<div className="p-4 border-t border-border bg-muted/20 flex justify-end">
					<Button onClick={handleClose}>{t('common.close')}</Button>
				</div>
			</div>
		</div>,
		document.body
	)
}
