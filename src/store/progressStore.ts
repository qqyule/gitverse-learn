import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProgressState {
	completedLevels: string[]
	markLevelCompleted: (levelId: string) => void
	isLevelCompleted: (levelId: string) => boolean
	resetProgress: () => void
}

export const useProgressStore = create<ProgressState>()(
	persist(
		(set, get) => ({
			completedLevels: [],
			markLevelCompleted: (levelId) => {
				const { completedLevels } = get()
				if (!completedLevels.includes(levelId)) {
					set({ completedLevels: [...completedLevels, levelId] })
				}
			},
			isLevelCompleted: (levelId) => {
				return get().completedLevels.includes(levelId)
			},
			resetProgress: () => {
				set({ completedLevels: [] })
			},
		}),
		{
			name: 'gitverse-progress',
		}
	)
)
