import type { GitStore } from '@/types/git'

const STORAGE_PREFIX = 'gitmaster-level-'
const MAX_STORAGE_SIZE = 5 * 1024 * 1024 // 5MB limit

// Sanitize string to prevent XSS
const sanitizeString = (str: unknown): string => {
	if (typeof str !== 'string') return ''
	return str
		.replace(/[<>]/g, '')
		.replace(/javascript:/gi, '')
		.replace(/on\w+=/gi, '')
		.substring(0, 10000)
}

// Validate levelId
const isValidLevelId = (id: unknown): id is string => {
	return (
		typeof id === 'string' &&
		id.length > 0 &&
		id.length < 100 &&
		/^[a-zA-Z0-9_-]+$/.test(id)
	)
}

// Validate commit data structure
const isValidCommit = (data: unknown): boolean => {
	if (!data || typeof data !== 'object') return false
	const commit = data as Record<string, unknown>
	return (
		typeof commit.hash === 'string' &&
		typeof commit.message === 'string' &&
		typeof commit.author === 'string' &&
		typeof commit.timestamp === 'number'
	)
}

export const saveLevelState = (levelId: string, state: Partial<GitStore>) => {
	try {
		if (!isValidLevelId(levelId)) {
			console.error('Invalid levelId:', levelId)
			return
		}

		// Check storage quota before saving
		if (navigator.storage && navigator.storage.estimate) {
			navigator.storage.estimate().then((estimate) => {
				if (estimate.usage && estimate.usage > MAX_STORAGE_SIZE) {
					console.warn('Storage quota nearly exceeded')
				}
			})
		}

		// Only save the data parts of the state, not functions
		const stateToSave = {
			commits: state.commits,
			branches: state.branches,
			tags: state.tags,
			HEAD: state.HEAD,
			stagingArea: state.stagingArea,
			workingDirectory: state.workingDirectory,
			commandHistory: state.commandHistory,
			lastOutput: sanitizeString(state.lastOutput),
		}

		const serialized = JSON.stringify(stateToSave)
		if (serialized.length > MAX_STORAGE_SIZE) {
			console.error('State too large to save')
			return
		}

		localStorage.setItem(`${STORAGE_PREFIX}${levelId}`, serialized)
	} catch (error) {
		console.error('Failed to save level state:', error)
	}
}

export const loadLevelState = (levelId: string): Partial<GitStore> | null => {
	try {
		if (!isValidLevelId(levelId)) {
			console.error('Invalid levelId:', levelId)
			return null
		}

		const saved = localStorage.getItem(`${STORAGE_PREFIX}${levelId}`)
		if (!saved) return null

		// Validate JSON structure before parsing
		if (!saved.startsWith('{') || !saved.endsWith('}')) {
			console.error('Invalid storage format')
			return null
		}

		const parsed = JSON.parse(saved)

		// Validate commits structure
		if (parsed.commits && typeof parsed.commits === 'object') {
			const commits = parsed.commits as Record<string, unknown>
			for (const key of Object.keys(commits)) {
				if (!isValidCommit(commits[key])) {
					console.error('Invalid commit data:', key)
					return null
				}
			}
		}

		return parsed
	} catch (error) {
		console.error('Failed to load level state:', error)
		return null
	}
}

export const clearLevelState = (levelId: string) => {
	try {
		if (!isValidLevelId(levelId)) {
			console.error('Invalid levelId:', levelId)
			return
		}
		localStorage.removeItem(`${STORAGE_PREFIX}${levelId}`)
	} catch (error) {
		console.error('Failed to clear level state:', error)
	}
}
