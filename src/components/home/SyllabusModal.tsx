import anime from 'animejs'
import { Circle, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { levels } from '@/data/levels'
import type { Level } from '@/types/git'

interface SyllabusModalProps {
	isOpen: boolean
	onClose: () => void
}

export function SyllabusModal({ isOpen, onClose }: SyllabusModalProps) {
	const { t } = useTranslation()
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
					duration: 400,
					easing: 'easeOutQuad',
					opacity: [0, 1],
					targets: overlayRef.current,
				})
			}

			// Animate Content
			if (contentRef.current) {
				contentRef.current.style.opacity = '0'
				anime({
					delay: 100,
					duration: 500,
					easing: 'easeOutElastic(1, .8)',
					opacity: [0, 1],
					scale: [0.9, 1],
					targets: contentRef.current,
					translateY: [20, 0],
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
							delay: anime.stagger(50),
							duration: 600,
							easing: 'easeOutExpo',
							opacity: [0, 1],
							targets: items,
							translateY: [20, 0],
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
					duration: 300,
					easing: 'easeInQuad',
					opacity: 0,
					scale: 0.9,
					targets: contentRef.current,
					translateY: 20,
				})
				.add(
					{
						duration: 300,
						easing: 'easeInQuad',
						opacity: 0,
						targets: overlayRef.current,
					},
					'-=200'
				)
		} else {
			onClose()
		}
	}

	if (!(isOpen && mounted)) return null

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
		return val === key ? fallback : val
	}

	const getPhaseTitle = (phase: number) => t(`phases.${phase}`)

	// Use Portal to escape parent transforms
	return createPortal(
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
			{/* Backdrop */}
			<div
				aria-label="Close"
				className="absolute inset-0 bg-background/80 backdrop-blur-sm"
				onClick={handleClose}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						handleClose()
					}
				}}
				ref={overlayRef}
				role="button"
				style={{ opacity: 0 }}
				tabIndex={0}
			/>

			{/* Modal Content */}
			<div
				className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
				ref={contentRef}
				style={{ opacity: 0 }}
			>
				{/* Header */}
				<div className="flex items-center justify-between border-border border-b bg-card/50 px-6 py-4">
					<h2 className="font-bold text-xl">{t('home.syllabusButton')}</h2>
					<Button
						className="rounded-full hover:bg-secondary"
						onClick={handleClose}
						size="icon"
						variant="ghost"
					>
						<X className="h-5 w-5" />
					</Button>
				</div>

				{/* Scrollable List */}
				<div className="flex-1 overflow-y-auto p-6">
					<div className="space-y-8" ref={listRef}>
						{Object.entries(phases).map(([phase, phaseLevels]) => (
							<div className="space-y-4" key={phase}>
								<h3 className="flex items-center gap-2 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
									<span className="h-1.5 w-1.5 rounded-full bg-primary" />
									{getPhaseTitle(Number(phase))}
								</h3>
								<div className="grid gap-3 sm:grid-cols-2">
									{phaseLevels.map((level) => (
										<div
											className="syllabus-item group relative cursor-default rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent/50"
											key={level.id} // Initial state for stagger
											style={{ opacity: 0 }}
										>
											<div className="flex items-start gap-3">
												<div className="mt-1">
													<Circle className="h-4 w-4 text-primary/40" />
												</div>
												<div>
													<h4 className="font-medium text-foreground transition-colors group-hover:text-primary">
														{getLevelText(level.id, 'title', level.title)}
													</h4>
													<p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
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
				<div className="flex justify-end border-border border-t bg-muted/20 p-4">
					<Button onClick={handleClose}>{t('common.close')}</Button>
				</div>
			</div>
		</div>,
		document.body
	)
}
