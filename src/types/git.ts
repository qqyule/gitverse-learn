export type GitHash = string

export type FileStatus =
	| 'unmodified'
	| 'modified'
	| 'staged'
	| 'deleted'
	| 'added'

export interface FileEntry {
	path: string
	content: string
	status: FileStatus
}

export interface FileStructure {
	[filePath: string]: FileEntry
}

export interface GitCommit {
	hash: GitHash
	parents: GitHash[]
	message: string
	author: string
	timestamp: number
	tree: FileStructure
}

export interface Branch {
	name: string
	headCommitHash: GitHash
	color: string
}

export interface HeadState {
	type: 'branch' | 'detached'
	ref: string
}

export interface GitState {
	commits: Record<GitHash, GitCommit>
	branches: Record<string, Branch>
	tags: Record<string, GitHash>
	HEAD: HeadState
	stagingArea: FileStructure
	workingDirectory: FileStructure
	commandHistory: string[]
	lastOutput: string
}

export interface GitActions {
	init: () => void
	add: (files: string[] | 'all') => void
	modifyFile: (path: string, content?: string) => void
	commit: (message: string) => boolean
	checkout: (ref: string) => boolean
	branch: (name: string) => boolean
	merge: (sourceBranch: string) => { success: boolean; conflict: boolean }
	reset: (mode: 'soft' | 'hard', ref?: string) => boolean
	log: () => GitCommit[]
	status: () => { staged: string[]; modified: string[]; untracked: string[] }
	executeCommand: (command: string) => string
	resetState: () => void
	loadScenario: (scenario: Partial<GitState>) => void
	getCurrentBranch: () => string | null
	getHeadCommit: () => GitCommit | null
}

export type GitStore = GitState & GitActions

// Graph visualization types
export interface GraphNode {
	id: GitHash
	commit: GitCommit
	x: number
	y: number
	lane: number
	color: string
	branches: string[]
	isHead: boolean
}

export interface GraphEdge {
	id: string
	source: GitHash
	target: GitHash
	sourceX: number
	sourceY: number
	targetX: number
	targetY: number
	color: string
	isMerge: boolean
}

export interface GraphLayout {
	nodes: GraphNode[]
	edges: GraphEdge[]
	width: number
	height: number
}
