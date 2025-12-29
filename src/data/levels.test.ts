import { describe, it, expect } from 'vitest'
import { levels } from './levels'
import type { GitState, GitCommit, Branch } from '../types/git'

// Helper to create a minimal valid GitState
const createMockState = (overrides?: Partial<GitState>): GitState => {
	const defaultState: GitState = {
		commits: {},
		branches: {
			main: {
				name: 'main',
				headCommitHash: 'init-hash',
				color: 'blue',
			},
		},
		tags: {},
		HEAD: { type: 'branch', ref: 'main' },
		stagingArea: {},
		workingDirectory: {},
		commandHistory: [],
		lastOutput: '',
	}
	return { ...defaultState, ...overrides }
}

const createCommit = (hash: string, parents: string[] = []): GitCommit => ({
	hash,
	parents,
	message: 'test',
	author: 'test',
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
				HEAD: { type: 'detached', ref: 'init-hash' },
			})
			expect(level.validation(state)).toBe(false)
		})

		it('should fail if not detached HEAD', () => {
			const state = createMockState({
				commits: {
					'init-hash': createCommit('init-hash'),
					'second-hash': createCommit('second-hash', ['init-hash']),
				},
				HEAD: { type: 'branch', ref: 'main' },
			})
			expect(level.validation(state)).toBe(false)
		})

		it('should pass if commits >= 2 and detached HEAD', () => {
			const state = createMockState({
				commits: {
					'init-hash': createCommit('init-hash'),
					'second-hash': createCommit('second-hash', ['init-hash']),
				},
				HEAD: { type: 'detached', ref: 'init-hash' },
			})
			expect(level.validation(state)).toBe(true)
		})
	})

	describe('Level 3: Branching Timeline', () => {
		const level = levels.find((l) => l.id === 'level-3')!

		it('should fail if feature branch does not exist', () => {
			const state = createMockState()
			expect(level.validation(state)).toBe(false)
		})

		it('should fail if feature branch equals main branch', () => {
			const state = createMockState({
				branches: {
					main: { name: 'main', headCommitHash: 'c1', color: 'blue' },
					feature: { name: 'feature', headCommitHash: 'c1', color: 'red' },
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
					main: { name: 'main', headCommitHash: 'c1', color: 'blue' },
					feature: { name: 'feature', headCommitHash: 'c2', color: 'red' },
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
					main: { name: 'main', headCommitHash: 'c1', color: 'blue' },
					feature: { name: 'feature', headCommitHash: 'c2', color: 'red' },
				},
				commits: {
					c1: createCommit('c1'),
					c2: createCommit('c2', ['c1']), // c2 is child of c1
				},
			})
			expect(level.validation(state)).toBe(true)
		})
	})

	describe('Level 4: Merging Paths', () => {
		const level = levels.find((l) => l.id === 'level-4')!

		it('should pass if fast-forward (hashes equal)', () => {
			const state = createMockState({
				branches: {
					main: { name: 'main', headCommitHash: 'c2', color: 'blue' },
					feature: { name: 'feature', headCommitHash: 'c2', color: 'red' },
				},
				commits: {
					c2: createCommit('c2', ['c1']),
				},
			})
			expect(level.validation(state)).toBe(true)
		})

		it('should pass if merge commit (2 parents)', () => {
			const state = createMockState({
				branches: {
					main: { name: 'main', headCommitHash: 'merge-commit', color: 'blue' },
					feature: { name: 'feature', headCommitHash: 'c2', color: 'red' },
				},
				commits: {
					'merge-commit': createCommit('merge-commit', ['c1', 'c2']),
				},
			})
			expect(level.validation(state)).toBe(true)
		})
	})

	describe('Level 5: Soft Landing', () => {
		const level = levels.find((l) => l.id === 'level-5')!

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
