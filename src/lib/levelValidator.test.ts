import { describe, expect, it } from 'vitest'
import type { Branch, GitCommit, GitState } from '@/types/git'
import type { UgcLevel, ValidationRule } from '@/types/level'
import {
	evaluateRules,
	getLevelValidator,
	toRuntimeLevel,
	validateLevelSchema,
} from './levelValidator'

const makeCommit = (hash: string, parents: string[] = []): GitCommit => ({
	author: 'tester',
	hash,
	message: 'msg',
	parents,
	timestamp: 0,
	tree: {},
})

const makeBranch = (name: string, headCommitHash: string): Branch => ({
	color: '#000000',
	headCommitHash,
	name,
})

const makeState = (overrides: Partial<GitState> = {}): GitState => ({
	branches: {},
	commandHistory: [],
	commits: {},
	HEAD: { ref: 'main', type: 'branch' },
	lastOutput: '',
	stagingArea: {},
	tags: {},
	workingDirectory: {},
	...overrides,
})

describe('evaluateRules', () => {
	it('minCommits checks commit count', () => {
		const state = makeState({ commits: { a: makeCommit('a'), b: makeCommit('b') } })
		expect(evaluateRules([{ type: 'minCommits', value: 2 }], state)).toBe(true)
		expect(evaluateRules([{ type: 'minCommits', value: 3 }], state)).toBe(false)
	})

	it('commandRun matches command history substrings', () => {
		const state = makeState({ commandHistory: ['git status', 'git log'] })
		expect(evaluateRules([{ type: 'commandRun', value: 'git status' }], state)).toBe(true)
		expect(evaluateRules([{ type: 'commandRun', value: 'git commit' }], state)).toBe(false)
	})

	it('branchExists / tagExists', () => {
		const state = makeState({
			branches: { feature: makeBranch('feature', 'x') },
			tags: { v1: 'x' },
		})
		expect(evaluateRules([{ type: 'branchExists', value: 'feature' }], state)).toBe(true)
		expect(evaluateRules([{ type: 'branchExists', value: 'missing' }], state)).toBe(false)
		expect(evaluateRules([{ type: 'tagExists', value: 'v1' }], state)).toBe(true)
	})

	it('detachedHead reflects HEAD type', () => {
		expect(evaluateRules([{ type: 'detachedHead' }], makeState())).toBe(false)
		expect(
			evaluateRules(
				[{ type: 'detachedHead' }],
				makeState({ HEAD: { ref: 'abc', type: 'detached' } })
			)
		).toBe(true)
	})

	it('branchAheadOf and headEquals', () => {
		const state = makeState({
			branches: {
				feature: makeBranch('feature', 'f'),
				main: makeBranch('main', 'm'),
			},
			commits: {
				f: makeCommit('f', ['m']),
				m: makeCommit('m'),
			},
		})
		expect(evaluateRules([{ branch: 'feature', of: 'main', type: 'branchAheadOf' }], state)).toBe(
			true
		)
		expect(evaluateRules([{ branch: 'main', of: 'feature', type: 'branchAheadOf' }], state)).toBe(
			false
		)
		expect(evaluateRules([{ branch: 'feature', equals: 'main', type: 'headEquals' }], state)).toBe(
			false
		)
	})

	it('mergeCommit detects two-parent head commit', () => {
		const state = makeState({
			branches: { main: makeBranch('main', 'merge') },
			commits: { merge: makeCommit('merge', ['a', 'b']) },
		})
		expect(evaluateRules([{ type: 'mergeCommit' }], state)).toBe(true)
	})

	it('fileModified checks working directory status', () => {
		const state = makeState({
			workingDirectory: { 'README.md': { content: 'x', path: 'README.md', status: 'modified' } },
		})
		expect(evaluateRules([{ type: 'fileModified', value: 'README.md' }], state)).toBe(true)
		expect(evaluateRules([{ type: 'fileModified', value: 'other.md' }], state)).toBe(false)
	})

	it('composes with allOf / anyOf / not', () => {
		const state = makeState({ commandHistory: ['git reset --soft HEAD~1'] })
		const rules: ValidationRule[] = [
			{
				rules: [
					{ type: 'commandRun', value: 'git reset --soft' },
					{
						rule: { type: 'commandRun', value: 'git reset --hard' },
						type: 'not',
					},
				],
				type: 'allOf',
			},
		]
		expect(evaluateRules(rules, state)).toBe(true)
		expect(
			evaluateRules([{ rules: [{ type: 'tagExists', value: 'v1' }], type: 'anyOf' }], state)
		).toBe(false)
	})
})

describe('validateLevelSchema', () => {
	const validUgc: UgcLevel = {
		commands: ['git init', 'git commit'],
		description: 'desc',
		goal: 'goal',
		hints: ['hint'],
		id: 'custom-1',
		phase: 1,
		subtitle: 'sub',
		title: 'Title',
		titleZh: '标题',
		validationRules: [{ type: 'minCommits', value: 1 }],
	}

	it('accepts a well-formed UGC level', () => {
		const result = validateLevelSchema(validUgc)
		expect(result.ok).toBe(true)
		if (result.ok) expect(result.data.id).toBe('custom-1')
	})

	it('rejects missing required string fields', () => {
		const bad = { ...validUgc, title: '' }
		const result = validateLevelSchema(bad)
		expect(result.ok).toBe(false)
		if (!result.ok) expect(result.errors.some((e) => e.includes('title'))).toBe(true)
	})

	it('rejects invalid id format', () => {
		const result = validateLevelSchema({ ...validUgc, id: 'Bad ID!' })
		expect(result.ok).toBe(false)
	})

	it('rejects out-of-range phase', () => {
		const result = validateLevelSchema({ ...validUgc, phase: 9 })
		expect(result.ok).toBe(false)
	})

	it('rejects empty validationRules and unknown rule type', () => {
		const empty = validateLevelSchema({ ...validUgc, validationRules: [] })
		expect(empty.ok).toBe(false)
		const unknown = validateLevelSchema({
			...validUgc,
			validationRules: [{ type: 'bogus' } as unknown as UgcLevel['validationRules'][number]],
		})
		expect(unknown.ok).toBe(false)
	})
})

describe('toRuntimeLevel / getLevelValidator', () => {
	it('compiles UGC rules into a runnable Level validator', () => {
		const ugc: UgcLevel = {
			commands: ['git branch'],
			description: 'd',
			goal: 'g',
			hints: [],
			id: 'ugc-x',
			phase: 2,
			subtitle: 's',
			title: 'T',
			titleZh: '中',
			validationRules: [{ type: 'branchExists', value: 'feature' }],
		}
		const level = toRuntimeLevel(ugc)
		expect(getLevelValidator(level)(makeState())).toBe(false)
		expect(
			getLevelValidator(level)(makeState({ branches: { feature: makeBranch('feature', 'x') } }))
		).toBe(true)
		expect(level.isUgc).toBe(true)
	})
})
