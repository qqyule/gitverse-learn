import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveLevelState, loadLevelState, clearLevelState } from '@/lib/storage'
import { GitStore } from '@/types/git'

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

describe('storage', () => {
	beforeEach(() => {
		localStorageMock.clear()
		vi.clearAllMocks()
	})

	const mockState: Partial<GitStore> = {
		commits: [],
		branches: {},
		tags: {},
		HEAD: { type: 'branch', value: 'main' },
		stagingArea: {},
		workingDirectory: {},
		commandHistory: [],
		lastOutput: '',
	}
	const levelId = 'test-level'

	describe('saveLevelState', () => {
		it('should save state to localStorage', () => {
			saveLevelState(levelId, mockState)
			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				`gitmaster-level-${levelId}`,
				JSON.stringify(mockState)
			)
		})

		it('should handle errors gracefully', () => {
			localStorageMock.setItem.mockImplementationOnce(() => {
				throw new Error('Storage full')
			})
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

			saveLevelState(levelId, mockState)

			expect(consoleSpy).toHaveBeenCalled()
			consoleSpy.mockRestore()
		})
	})

	describe('loadLevelState', () => {
		it('should load state from localStorage', () => {
			localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockState))
			const loaded = loadLevelState(levelId)
			expect(loaded).toEqual(mockState)
			expect(localStorageMock.getItem).toHaveBeenCalledWith(
				`gitmaster-level-${levelId}`
			)
		})

		it('should return null if no state exists', () => {
			localStorageMock.getItem.mockReturnValueOnce(null)
			const loaded = loadLevelState(levelId)
			expect(loaded).toBeNull()
		})

		it('should handle JSON parse errors', () => {
			localStorageMock.getItem.mockReturnValueOnce('invalid json')
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

			const loaded = loadLevelState(levelId)

			expect(loaded).toBeNull()
			expect(consoleSpy).toHaveBeenCalled()
			consoleSpy.mockRestore()
		})
	})

	describe('clearLevelState', () => {
		it('should remove state from localStorage', () => {
			clearLevelState(levelId)
			expect(localStorageMock.removeItem).toHaveBeenCalledWith(
				`gitmaster-level-${levelId}`
			)
		})
	})
})
