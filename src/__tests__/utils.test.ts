import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('utils', () => {
	describe('cn', () => {
		it('should merge class names correctly', () => {
			expect(cn('c-1', 'c-2')).toBe('c-1 c-2')
		})

		it('should handle conditional classes', () => {
			expect(cn('c-1', true && 'c-2', false && 'c-3')).toBe('c-1 c-2')
		})

		it('should handle objects', () => {
			expect(cn({ 'c-1': true, 'c-2': false })).toBe('c-1')
		})

		it('should merge tailwind classes correctly', () => {
			expect(cn('px-2 py-1', 'p-4')).toBe('p-4')
		})
	})
})
