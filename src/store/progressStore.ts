import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProgressState {
	completedLevels: string[]
	isLevelCompleted: (levelId: string) => boolean
	markLevelCompleted: (levelId: string) => void
	resetProgress: () => void
}

export const useProgressStore = create<ProgressState>()(
	persist(
		(set, get) => ({
			completedLevels: [],
			isLevelCompleted: (levelId) => get().completedLevels.includes(levelId),
			markLevelCompleted: (levelId) => {
				const { completedLevels } = get()
				if (!completedLevels.includes(levelId)) {
					set({ completedLevels: [...completedLevels, levelId] })
				}
			},
			resetProgress: () => {
				set({ completedLevels: [] })
			},
		}),
		{
			name: 'gitmaster-progress',
		}
	)
)
