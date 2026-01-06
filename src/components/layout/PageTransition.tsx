import type React from 'react'
import { useEffect, useRef } from 'react'
import { pageEnter } from '@/lib/animations'

interface PageTransitionProps {
	children: React.ReactNode
	className?: string
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (containerRef.current) {
			pageEnter(containerRef.current)
		}
	}, [])

	return (
		<div ref={containerRef} className={className}>
			{children}
		</div>
	)
}
