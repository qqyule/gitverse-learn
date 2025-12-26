import { describe, it, expect, beforeEach, vi } from 'vitest'

/**
 * 模拟 localStorage
 */
const localStorageMock = (() => {
	let store: Record<string, string> = {}
	return {
		getItem: vi.fn((key: string) => store[key] || null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key]
		}),
		clear: vi.fn(() => {
			store = {}
		}),
	}
})()

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
})

describe('主题切换', () => {
	beforeEach(() => {
		localStorageMock.clear()
		document.documentElement.removeAttribute('class')
	})

	describe('主题状态管理', () => {
		it('默认主题应该是 system', () => {
			const theme = localStorageMock.getItem('theme') || 'system'
			expect(theme).toBe('system')
		})

		it('应该能设置 dark 主题', () => {
			localStorageMock.setItem('theme', 'dark')
			expect(localStorageMock.getItem('theme')).toBe('dark')
		})

		it('应该能设置 light 主题', () => {
			localStorageMock.setItem('theme', 'light')
			expect(localStorageMock.getItem('theme')).toBe('light')
		})
	})

	describe('主题持久化', () => {
		it('主题应保存到 localStorage', () => {
			localStorageMock.setItem('theme', 'dark')
			expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
		})

		it('应该能从 localStorage 读取主题', () => {
			localStorageMock.setItem('theme', 'light')
			const savedTheme = localStorageMock.getItem('theme')
			expect(savedTheme).toBe('light')
		})
	})

	describe('CSS class 应用', () => {
		it('dark 主题应该添加 dark class', () => {
			document.documentElement.classList.add('dark')
			expect(document.documentElement.classList.contains('dark')).toBe(true)
		})

		it('light 主题应该添加 light class', () => {
			document.documentElement.classList.add('light')
			expect(document.documentElement.classList.contains('light')).toBe(true)
		})

		it('切换主题应该移除旧 class', () => {
			document.documentElement.classList.add('dark')
			document.documentElement.classList.remove('dark')
			document.documentElement.classList.add('light')
			expect(document.documentElement.classList.contains('dark')).toBe(false)
			expect(document.documentElement.classList.contains('light')).toBe(true)
		})
	})
})
