import type { GitState } from './git'

/**
 * 声明式关卡校验规则。UGC（用户生成内容）关卡不能携带函数，
 * 因此用可序列化、可编辑的规则树来描述"通关条件"。
 * 官方关卡仍可保留 `validation` 函数；运行时优先使用 `validationRules`。
 */
export type ValidationRule =
	| { type: 'minCommits'; value: number }
	| { type: 'commandRun'; value: string }
	| { type: 'branchExists'; value: string }
	| { type: 'tagExists'; value: string }
	| { type: 'detachedHead' }
	| { type: 'branchAheadOf'; branch: string; of: string }
	| { type: 'headEquals'; branch: string; equals: string }
	| { type: 'mergeCommit' }
	| { type: 'fileModified'; value: string }
	| { type: 'not'; rule: ValidationRule }
	| { type: 'allOf'; rules: ValidationRule[] }
	| { type: 'anyOf'; rules: ValidationRule[] }

/**
 * UGC 关卡：用于编辑、本地存储与分享传输。
 * `validationRules` 必填（运行时编译为 `Level.validation`）。
 * `author` / `shareId` 用于归属与分享定位。
 */
export interface UgcLevel {
	author?: string
	commands: string[]
	description: string
	goal: string
	hints: string[]
	id: string
	isUgc?: boolean
	phase: number
	shareId?: string
	subtitle: string
	title: string
	titleZh: string
	validationRules: ValidationRule[]
}

export type { GitState }
