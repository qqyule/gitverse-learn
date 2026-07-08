import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

// SVG Sanitization utilities for GitGraphSvg
const DANGEROUS_ATTRIBUTES = [
	'onload',
	'onerror',
	'onmouseover',
	'onmouseout',
	'onclick',
	'onkeydown',
	'onkeyup',
	'onfocus',
	'onblur',
	'javascript:',
	'vbscript:',
	'data:',
]

/**
 * Sanitize SVG attributes to prevent XSS attacks
 */
export function sanitizeSvgAttribute(value: string): string {
	if (typeof value !== 'string') return ''

	let sanitized = value
	for (const attr of DANGEROUS_ATTRIBUTES) {
		const regex = new RegExp(`${attr}=`, 'gi')
		sanitized = sanitized.replace(regex, `${attr}_blocked=`)
	}

	// Remove javascript: and vbscript: protocols
	sanitized = sanitized.replace(/javascript:/gi, 'blocked:')
	sanitized = sanitized.replace(/vbscript:/gi, 'blocked:')

	return sanitized
}

/**
 * Validate and sanitize SVG element ID
 */
export function sanitizeSvgId(id: string): string {
	if (typeof id !== 'string') return ''
	// Only allow alphanumeric, dash, underscore
	return id.replace(/[^a-zA-Z0-9-_]/g, '_')
}

/**
 * Check if a string is safe for use in SVG
 */
export function isSvgSafe(str: string): boolean {
	if (typeof str !== 'string') return false

	for (const danger of DANGEROUS_ATTRIBUTES) {
		if (str.toLowerCase().includes(danger.toLowerCase())) {
			return false
		}
	}

	return true
}
