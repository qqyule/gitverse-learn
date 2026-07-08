import type { GitState, Level } from '@/types/git'
import type { UgcLevel, ValidationRule } from '@/types/level'

// 判断 descendantHash 是否以 ancestorHash 为祖先（DFS，处理多父节点）
const isAncestor = (
	commits: Record<string, { hash: string; parents: string[] }>,
	ancestorHash: string,
	descendantHash: string
): boolean => {
	const start = commits[descendantHash]
	if (!start) return false
	const queue: { hash: string; parents: string[] }[] = [start]
	const visited = new Set<string>()
	while (queue.length > 0) {
		const commit = queue.shift()
		if (!commit) continue
		if (visited.has(commit.hash)) continue
		visited.add(commit.hash)
		if (commit.hash === ancestorHash) return true
		for (const parentHash of commit.parents) {
			const parent = commits[parentHash]
			if (parent) queue.push(parent)
		}
	}
	return false
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value)

/** 解释单条声明式规则 */
export function evaluateRule(rule: ValidationRule, state: GitState): boolean {
	switch (rule.type) {
		case 'minCommits':
			return Object.keys(state.commits).length >= rule.value
		case 'commandRun':
			return state.commandHistory.some((cmd) => cmd.includes(rule.value))
		case 'branchExists':
			return state.branches[rule.value] !== undefined
		case 'tagExists':
			return state.tags[rule.value] !== undefined
		case 'detachedHead':
			return state.HEAD.type === 'detached'
		case 'branchAheadOf': {
			const branch = state.branches[rule.branch]
			const base = state.branches[rule.of]
			if (!(branch && base)) return false
			return (
				branch.headCommitHash !== base.headCommitHash &&
				isAncestor(state.commits, base.headCommitHash, branch.headCommitHash)
			)
		}
		case 'headEquals': {
			const branch = state.branches[rule.branch]
			const target = state.branches[rule.equals]
			if (!(branch && target)) return false
			return branch.headCommitHash === target.headCommitHash
		}
		case 'mergeCommit': {
			if (state.HEAD.type !== 'branch') return false
			const headHash = state.branches[state.HEAD.ref]?.headCommitHash
			const head = headHash ? state.commits[headHash] : undefined
			return (head?.parents.length ?? 0) >= 2
		}
		case 'fileModified':
			return Object.values(state.workingDirectory).some(
				(file) => file.path === rule.value && file.status === 'modified'
			)
		case 'not':
			return !evaluateRule(rule.rule, state)
		case 'allOf':
			return rule.rules.every((child) => evaluateRule(child, state))
		case 'anyOf':
			return rule.rules.some((child) => evaluateRule(child, state))
		default:
			return false
	}
}

/** 解释一组规则（AND 关系） */
export function evaluateRules(rules: ValidationRule[], state: GitState): boolean {
	return rules.every((rule) => evaluateRule(rule, state))
}

/**
 * 取得关卡校验器：优先使用声明式 `validationRules`，
 * 否则回退到官方关卡的 `validation` 函数。
 */
export function getLevelValidator(level: Level): (state: GitState) => boolean {
	if (level.validationRules && level.validationRules.length > 0) {
		return (state) => evaluateRules(level.validationRules as ValidationRule[], state)
	}
	return level.validation
}

/** 将 UGC 关卡编译为运行时 `Level`（把 rules 编译成 validation 函数） */
export function toRuntimeLevel(ugc: UgcLevel): Level {
	return {
		author: ugc.author,
		commands: ugc.commands,
		description: ugc.description,
		goal: ugc.goal,
		hints: ugc.hints,
		id: ugc.id,
		isUgc: true,
		phase: ugc.phase,
		shareId: ugc.shareId,
		subtitle: ugc.subtitle,
		title: ugc.title,
		titleZh: ugc.titleZh,
		validation: (state) => evaluateRules(ugc.validationRules, state),
		validationRules: ugc.validationRules,
	}
}

/**
 * 轻量级关卡 Schema 校验（不引入新依赖）。
 * 返回通过的数据或错误信息列表。用于编辑器实时校验与分享导入。
 */
export function validateLevelSchema(
	raw: unknown
): { ok: true; data: UgcLevel } | { ok: false; errors: string[] } {
	const errors: string[] = []
	if (!isRecord(raw)) {
		return { errors: ['Level must be an object'], ok: false }
	}

	const id = raw.id
	if (typeof id !== 'string' || id.trim().length === 0) {
		errors.push('id is required and must be a non-empty string')
	} else if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
		errors.push('id must match /^[a-z0-9][a-z0-9-]*$/ (lowercase, digits, hyphens)')
	}

	const stringFields: (keyof UgcLevel)[] = ['title', 'titleZh', 'description', 'goal', 'subtitle']
	for (const field of stringFields) {
		const value = raw[field]
		if (typeof value !== 'string' || value.trim().length === 0) {
			errors.push(`${String(field)} is required and must be a non-empty string`)
		}
	}

	const phase = raw.phase
	if (typeof phase !== 'number' || phase < 1 || phase > 6) {
		errors.push('phase must be a number between 1 and 6')
	}

	const commands = raw.commands
	if (!(Array.isArray(commands) && commands.every((c) => typeof c === 'string'))) {
		errors.push('commands must be an array of strings')
	}

	const hints = raw.hints
	if (!(Array.isArray(hints) && hints.every((h) => typeof h === 'string'))) {
		errors.push('hints must be an array of strings')
	}

	const rules = raw.validationRules
	if (!Array.isArray(rules) || rules.length === 0) {
		errors.push('validationRules must be a non-empty array')
	} else {
		const ruleErrors = validateRules(rules)
		errors.push(...ruleErrors.map((e) => `validationRules: ${e}`))
	}

	if (errors.length > 0) {
		return { errors, ok: false }
	}

	return {
		data: {
			author: typeof raw.author === 'string' ? raw.author : undefined,
			commands: commands as string[],
			description: raw.description as string,
			goal: raw.goal as string,
			hints: hints as string[],
			id: id as string,
			isUgc: true,
			phase: phase as number,
			shareId: typeof raw.shareId === 'string' ? raw.shareId : undefined,
			subtitle: raw.subtitle as string,
			title: raw.title as string,
			titleZh: raw.titleZh as string,
			validationRules: rules as ValidationRule[],
		},
		ok: true,
	}
}

function validateRules(rules: unknown[]): string[] {
	const errors: string[] = []
	for (let i = 0; i < rules.length; i += 1) {
		const rule = rules[i]
		if (!isRecord(rule)) {
			errors.push(`[${i}] rule must be an object`)
			continue
		}
		const type = rule.type
		if (typeof type !== 'string') {
			errors.push(`[${i}] rule.type is required`)
			continue
		}
		switch (type) {
			case 'minCommits':
			case 'commandRun':
			case 'branchExists':
			case 'tagExists':
			case 'fileModified':
				if (typeof rule.value !== 'string' && type !== 'minCommits') {
					errors.push(`[${i}] ${type} requires a string "value"`)
				} else if (type === 'minCommits' && typeof rule.value !== 'number') {
					errors.push(`[${i}] minCommits requires a numeric "value"`)
				}
				break
			case 'branchAheadOf':
				if (typeof rule.branch !== 'string' || typeof rule.of !== 'string') {
					errors.push(`[${i}] branchAheadOf requires "branch" and "of" strings`)
				}
				break
			case 'headEquals':
				if (typeof rule.branch !== 'string' || typeof rule.equals !== 'string') {
					errors.push(`[${i}] headEquals requires "branch" and "equals" strings`)
				}
				break
			case 'not':
				if (isRecord(rule.rule)) {
					errors.push(...validateRules([rule.rule]).map((e) => `[${i}] ${e}`))
				} else {
					errors.push(`[${i}] not requires a "rule" object`)
				}
				break
			case 'allOf':
			case 'anyOf':
				if (Array.isArray(rule.rules)) {
					errors.push(...validateRules(rule.rules).map((e) => `[${i}] ${e}`))
				} else {
					errors.push(`[${i}] ${type} requires a "rules" array`)
				}
				break
			case 'detachedHead':
			case 'mergeCommit':
				break
			default:
				errors.push(`[${i}] unknown rule type "${String(type)}"`)
		}
	}
	return errors
}
