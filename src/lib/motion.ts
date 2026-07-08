import type { Transition, Variants } from 'framer-motion'

/**
 * M2 — Motion design tokens.
 *
 * Single source of truth for animation timing / easing so framer-motion usage
 * stays consistent across the app.
 *
 * Convention: `animejs` (see lib/animations.ts) is LEGACY only. All new
 * animations MUST use framer-motion together with these tokens.
 */

export const motionTokens = {
	duration: {
		base: 0.2,
		fast: 0.15,
		slow: 0.3,
	},
	ease: {
		emphasized: [0.2, 0, 0, 1] as [number, number, number, number],
		spring: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
		standard: [0.4, 0, 0.2, 1] as [number, number, number, number],
	},
	spring: {
		damping: 20,
		stiffness: 300,
	},
}

export const fadeInUp: Variants = {
	hidden: { opacity: 0, y: 20 },
	show: {
		opacity: 1,
		transition: { duration: motionTokens.duration.base, ease: motionTokens.ease.standard },
		y: 0,
	},
}

export const staggerContainer: Variants = {
	hidden: {},
	show: { transition: { staggerChildren: 0.08 } },
}

export const defaultTransition: Transition = {
	duration: motionTokens.duration.base,
	ease: motionTokens.ease.standard,
}
