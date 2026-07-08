export type GitHash = string

export type FileStatus = 'unmodified' | 'modified' | 'staged' | 'deleted' | 'added'

export interface FileEntry {
	content: string
	path: string
	status: FileStatus
}

export interface FileStructure {
	[filePath: string]: FileEntry
}

export interface GitCommit {
	author: string
	hash: GitHash
	message: string
	parents: GitHash[]
	timestamp: number
	tree: FileStructure
}

export interface Branch {
	color: string
	headCommitHash: GitHash
	name: string
}

export interface HeadState {
	ref: string
	type: 'branch' | 'detached'
}

export interface GitState {
	branches: Record<string, Branch>
	commandHistory: string[]
	commits: Record<GitHash, GitCommit>
	HEAD: HeadState
	lastOutput: string
	stagingArea: FileStructure
	tags: Record<string, GitHash>
	workingDirectory: FileStructure
}

export interface GitActions {
	add: (files: string[] | 'all') => void
	branch: (name: string) => boolean
	checkout: (ref: string) => boolean
	commit: (message: string) => boolean
	executeCommand: (command: string) => string
	getCurrentBranch: () => string | null
	getHeadCommit: () => GitCommit | null
	init: () => void
	loadScenario: (scenario: Partial<GitState>) => void
	log: () => GitCommit[]
	merge: (sourceBranch: string) => { success: boolean; conflict: boolean }
	modifyFile: (path: string, content?: string) => void
	reset: (mode: 'soft' | 'hard', ref?: string) => boolean
	resetState: () => void
	status: () => { staged: string[]; modified: string[]; untracked: string[] }
}

export type GitStore = GitState & GitActions

export interface Level {
	commands: string[]
	description: string
	goal: string
	hints: string[]
	id: string
	phase: number
	setup?: () => void
	subtitle: string
	title: string
	titleZh: string
	validation: (state: GitState) => boolean
}

// Graph visualization types
export interface GraphNode {
	branches: string[]
	color: string
	commit: GitCommit
	id: GitHash
	isHead: boolean
	lane: number
	x: number
	y: number
}

export interface GraphEdge {
	color: string
	id: string
	isMerge: boolean
	source: GitHash
	sourceX: number
	sourceY: number
	target: GitHash
	targetX: number
	targetY: number
}

export interface GraphLayout {
	edges: GraphEdge[]
	height: number
	nodes: GraphNode[]
	width: number
}
