import { GitStore } from '@/types/git'

const STORAGE_PREFIX = 'gitmaster-level-'

export const saveLevelState = (levelId: string, state: Partial<GitStore>) => {
	try {
		// Only save the data parts of the state, not functions
		const stateToSave = {
			commits: state.commits,
			branches: state.branches,
			tags: state.tags,
			HEAD: state.HEAD,
			stagingArea: state.stagingArea,
			workingDirectory: state.workingDirectory,
			commandHistory: state.commandHistory,
			lastOutput: state.lastOutput,
		}
		localStorage.setItem(
			`${STORAGE_PREFIX}${levelId}`,
			JSON.stringify(stateToSave)
		)
	} catch (error) {
		console.error('Failed to save level state:', error)
	}
}

export const loadLevelState = (levelId: string): Partial<GitStore> | null => {
	try {
		const saved = localStorage.getItem(`${STORAGE_PREFIX}${levelId}`)
		return saved ? JSON.parse(saved) : null
	} catch (error) {
		console.error('Failed to load level state:', error)
		return null
	}
}

export const clearLevelState = (levelId: string) => {
	try {
		localStorage.removeItem(`${STORAGE_PREFIX}${levelId}`)
	} catch (error) {
		console.error('Failed to clear level state:', error)
	}
}
