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
})
