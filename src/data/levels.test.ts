import { describe, expect, it } from 'vitest'
import type { GitCommit, GitState } from '../types/git'
import { levels } from './levels'

// Helper to create a minimal valid GitState
const createMockState = (overrides?: Partial<GitState>): GitState => {
	const defaultState: GitState = {
		branches: {
			main: {
				color: 'blue',
				headCommitHash: 'init-hash',
				name: 'main',
			},
		},
		commandHistory: [],
		commits: {},
		HEAD: { ref: 'main', type: 'branch' },
		lastOutput: '',
		stagingArea: {},
		tags: {},
		workingDirectory: {},
	}
	return { ...defaultState, ...overrides }
}

const createCommit = (hash: string, parents: string[] = []): GitCommit => ({
	author: 'test',
	hash,
	message: 'test',
	parents,
	timestamp: Date.now(),
	tree: {},
})

describe('Level Validation Logic', () => {
	describe('Level 1: First Snapshot', () => {
		const level = levels.find((l) => l.id === 'level-1')!

		it('should fail with less than 2 commits', () => {
			const state = createMockState({
				commits: {
					'init-hash': createCommit('init-hash'),
				},
			})
			expect(level.validation(state)).toBe(false)
		})

		it('should pass with 2 or more commits', () => {
			const state = createMockState({
				commits: {
					'init-hash': createCommit('init-hash'),
					'second-hash': createCommit('second-hash', ['init-hash']),
				},
			})
			expect(level.validation(state)).toBe(true)
		})
	})

	describe('Level 2: Time Traveler', () => {
		const level = levels.find((l) => l.id === 'level-2')!

		it('should fail if commits < 2', () => {
			const state = createMockState({
				commits: { 'init-hash': createCommit('init-hash') },
				HEAD: { ref: 'init-hash', type: 'detached' },
			})
			expect(level.validation(state)).toBe(false)
		})

		it('should fail if not detached HEAD', () => {
			const state = createMockState({
				commits: {
					'init-hash': createCommit('init-hash'),
					'second-hash': createCommit('second-hash', ['init-hash']),
				},
				HEAD: { ref: 'main', type: 'branch' },
			})
			expect(level.validation(state)).toBe(false)
		})

		it('should pass if commits >= 2 and detached HEAD', () => {
			const state = createMockState({
				commits: {
					'init-hash': createCommit('init-hash'),
					'second-hash': createCommit('second-hash', ['init-hash']),
				},
				HEAD: { ref: 'init-hash', type: 'detached' },
			})
			expect(level.validation(state)).toBe(true)
		})
	})

	describe('Level 4: Branching Timeline', () => {
		const level = levels.find((l) => l.id === 'level-4')!

		it('should fail if feature branch does not exist', () => {
			const state = createMockState()
			expect(level.validation(state)).toBe(false)
		})

		it('should fail if feature branch equals main branch', () => {
			const state = createMockState({
				branches: {
					feature: { color: 'red', headCommitHash: 'c1', name: 'feature' },
					main: { color: 'blue', headCommitHash: 'c1', name: 'main' },
				},
				commits: {
					c1: createCommit('c1'),
				},
			})
			expect(level.validation(state)).toBe(false)
		})

		it('should fail if feature not an ancestor of main', () => {
			// This simulates random unrelated commit
			const state = createMockState({
				branches: {
					feature: { color: 'red', headCommitHash: 'c2', name: 'feature' },
					main: { color: 'blue', headCommitHash: 'c1', name: 'main' },
				},
				commits: {
					c1: createCommit('c1'),
					c2: createCommit('c2'), // No parent relationship to c1
				},
			})
			expect(level.validation(state)).toBe(false)
		})

		it('should pass if feature is ahead of main', () => {
			const state = createMockState({
				branches: {
					feature: { color: 'red', headCommitHash: 'c2', name: 'feature' },
					main: { color: 'blue', headCommitHash: 'c1', name: 'main' },
				},
				commits: {
					c1: createCommit('c1'),
					c2: createCommit('c2', ['c1']), // c2 is child of c1
				},
			})
			expect(level.validation(state)).toBe(true)
		})
	})

	describe('Level 6: Merging Paths (Fast-Forward)', () => {
		const level = levels.find((l) => l.id === 'level-6')!

		it('should pass if fast-forward (hashes equal)', () => {
			const state = createMockState({
				branches: {
					'feature-a': { color: 'red', headCommitHash: 'c2', name: 'feature-a' },
					main: { color: 'blue', headCommitHash: 'c2', name: 'main' },
				},
				commits: {
					c1: createCommit('c1'),
					c2: createCommit('c2', ['c1']),
				},
			})
			expect(level.validation(state)).toBe(true)
		})
	})

	describe('Level 7: Spacetime Intersection (Merge Commit)', () => {
		const level = levels.find((l) => l.id === 'level-7')!

		it('should pass if merge commit (2 parents)', () => {
			const state = createMockState({
				branches: {
					feature: { color: 'red', headCommitHash: 'c2', name: 'feature' },
					main: { color: 'blue', headCommitHash: 'merge-commit', name: 'main' },
				},
				commits: {
					'merge-commit': createCommit('merge-commit', ['c1', 'c2']),
				},
			})
			expect(level.validation(state)).toBe(true)
		})
	})

	describe('Level 8: Soft Landing', () => {
		const level = levels.find((l) => l.id === 'level-8')!

		it('should fail if no reset command', () => {
			const state = createMockState({
				commandHistory: ['git init', 'git commit -m "msg"'],
			})
			expect(level.validation(state)).toBe(false)
		})

		it('should pass if reset --soft command exists exact match', () => {
			const state = createMockState({
				commandHistory: ['git commit', 'git reset --soft HEAD~1'],
			})
			expect(level.validation(state)).toBe(true)
		})

		it('should pass if reset --soft command exists partial match', () => {
			const state = createMockState({
				commandHistory: ['git commit', 'git reset --soft'],
			})
			expect(level.validation(state)).toBe(true)
		})
	})

	describe('Level 3: Status Report', () => {
		const level = levels.find((l) => l.id === 'level-3')!

		it('should fail without git status and git log', () => {
			const state = createMockState({ commandHistory: ['git commit -m "x"'] })
			expect(level.validation(state)).toBe(false)
		})

		it('should pass when git status and git log were used', () => {
			const state = createMockState({ commandHistory: ['git status', 'git log'] })
			expect(level.validation(state)).toBe(true)
		})
	})

	describe('Level 5: Shadow Clones', () => {
		const level = levels.find((l) => l.id === 'level-5')!

		it('should fail if feature-b is missing', () => {
			const state = createMockState({
				branches: {
					'feature-a': { color: '', headCommitHash: 'ca', name: 'feature-a' },
					main: { color: '', headCommitHash: 'cm', name: 'main' },
				},
				commits: { ca: createCommit('ca', ['cm']), cm: createCommit('cm') },
			})
			expect(level.validation(state)).toBe(false)
		})

		it('should pass if both branches are ahead of main', () => {
			const state = createMockState({
				branches: {
					'feature-a': { color: '', headCommitHash: 'ca', name: 'feature-a' },
					'feature-b': { color: '', headCommitHash: 'cb', name: 'feature-b' },
					main: { color: '', headCommitHash: 'cm', name: 'main' },
				},
				commits: {
					ca: createCommit('ca', ['cm']),
					cb: createCommit('cb', ['cm']),
					cm: createCommit('cm'),
				},
			})
			expect(level.validation(state)).toBe(true)
		})
	})

	describe('Level 9: Hard Landing', () => {
		const level = levels.find((l) => l.id === 'level-9')!

		it('should fail without reset --hard', () => {
			const state = createMockState({ commandHistory: ['git commit'] })
			expect(level.validation(state)).toBe(false)
		})

		it('should pass with reset --hard command', () => {
			const state = createMockState({ commandHistory: ['git reset --hard HEAD~1'] })
			expect(level.validation(state)).toBe(true)
		})
	})

	describe('Level 10: Selective Amnesia', () => {
		const level = levels.find((l) => l.id === 'level-10')!

		it('should fail for reset --soft or reset --hard', () => {
			const state = createMockState({ commandHistory: ['git reset --soft HEAD~1'] })
			expect(level.validation(state)).toBe(false)
		})

		it('should pass for plain reset HEAD~1', () => {
			const state = createMockState({ commandHistory: ['git reset HEAD~1'] })
			expect(level.validation(state)).toBe(true)
		})
	})

	describe('Level 11: Milestone', () => {
		const level = levels.find((l) => l.id === 'level-11')!

		it('should fail without the v1.0 tag', () => {
			const state = createMockState({ tags: {} })
			expect(level.validation(state)).toBe(false)
		})

		it('should pass when v1.0 tag exists', () => {
			const state = createMockState({ tags: { 'v1.0': 'c1' } })
			expect(level.validation(state)).toBe(true)
		})
	})

	describe('Level 12: The Journey Continues (M1 fix)', () => {
		const level = levels.find((l) => l.id === 'level-12')!

		it('should fail without next-chapter branch', () => {
			const state = createMockState({
				branches: { main: { color: '', headCommitHash: 'c1', name: 'main' } },
			})
			expect(level.validation(state)).toBe(false)
		})

		it('should pass when next-chapter branch exists', () => {
			const state = createMockState({
				branches: {
					main: { color: '', headCommitHash: 'c1', name: 'main' },
					'next-chapter': { color: '', headCommitHash: 'c2', name: 'next-chapter' },
				},
			})
			expect(level.validation(state)).toBe(true)
		})
	})
})
