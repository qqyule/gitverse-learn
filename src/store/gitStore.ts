import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
	GitStore,
	GitHash,
	GitCommit,
	FileStructure,
	Branch,
	FileEntry,
} from '@/types/git'

// Utility to generate short hash
const generateHash = (): GitHash => {
	return Math.random().toString(36).substring(2, 9)
}

// Branch colors
const BRANCH_COLORS = [
	'hsl(199, 89%, 48%)', // main - sky
	'hsl(280, 68%, 60%)', // feature - purple
	'hsl(142, 76%, 36%)', // develop - green
	'hsl(38, 92%, 50%)', // release - amber
	'hsl(0, 84%, 60%)', // hotfix - red
	'hsl(172, 66%, 50%)', // accent - teal
]

let colorIndex = 0
const getNextColor = (): string => {
	const color = BRANCH_COLORS[colorIndex % BRANCH_COLORS.length]
	colorIndex++
	return color
}

// Initial state
const createInitialState = () => ({
	commits: {} as Record<GitHash, GitCommit>,
	branches: {} as Record<string, Branch>,
	tags: {} as Record<string, GitHash>,
	HEAD: { type: 'branch' as const, ref: 'main' },
	stagingArea: {} as FileStructure,
	workingDirectory: {} as FileStructure,
	commandHistory: [] as string[],
	lastOutput: '',
})

export const useGitStore = create<GitStore>()(
	immer((set, get) => ({
		...createInitialState(),

		init: () => {
			set((state) => {
				const hash = generateHash()
				const initialFile: FileEntry = {
					path: 'README.md',
					content: '# My Project\n\nWelcome to my Git repository!',
					status: 'unmodified',
				}

				const initialCommit: GitCommit = {
					hash,
					parents: [],
					message: 'Initial commit',
					author: 'You',
					timestamp: Date.now(),
					tree: { 'README.md': { ...initialFile } },
				}

				state.commits[hash] = initialCommit
				state.branches['main'] = {
					name: 'main',
					headCommitHash: hash,
					color: BRANCH_COLORS[0],
				}
				state.HEAD = { type: 'branch', ref: 'main' }
				state.workingDirectory = { 'README.md': { ...initialFile } }
				state.stagingArea = {}
				state.lastOutput = 'Initialized empty Git repository'
				state.commandHistory.push('git init')
			})
		},

		add: (files) => {
			set((state) => {
				const filesToAdd =
					files === 'all' ? Object.keys(state.workingDirectory) : files

				filesToAdd.forEach((filePath) => {
					const file = state.workingDirectory[filePath]
					if (file && file.status !== 'unmodified') {
						state.stagingArea[filePath] = { ...file, status: 'staged' }
						state.workingDirectory[filePath].status = 'staged'
					}
				})

				state.lastOutput = `Added ${filesToAdd.length} file(s) to staging area`
				state.commandHistory.push(
					`git add ${files === 'all' ? '.' : files.join(' ')}`
				)
			})
		},

		modifyFile: (path, content) => {
			set((state) => {
				const file = state.workingDirectory[path]
				if (!file) return

				if (content !== undefined) {
					state.workingDirectory[path].content = content
				} else {
					state.workingDirectory[path].content += '\n// Modified'
				}

				if (file.status !== 'added') {
					state.workingDirectory[path].status = 'modified'
				}

				state.lastOutput = `Modified file: ${path}`
			})
		},

		commit: (message) => {
			const state = get()
			const stagedFiles = Object.keys(state.stagingArea)

			if (stagedFiles.length === 0) {
				set((s) => {
					s.lastOutput = 'Nothing to commit (no staged changes)'
				})
				return false
			}

			set((state) => {
				const currentBranch = state.branches[state.HEAD.ref]
				const parentHash =
					currentBranch?.headCommitHash ||
					(state.HEAD.type === 'detached' ? state.HEAD.ref : null)
				const hash = generateHash()

				// Merge working directory with staged changes
				const newTree: FileStructure = {}
				Object.entries(state.workingDirectory).forEach(([path, file]) => {
					newTree[path] = { ...file, status: 'unmodified' }
				})

				const newCommit: GitCommit = {
					hash,
					parents: parentHash ? [parentHash] : [],
					message,
					author: 'You',
					timestamp: Date.now(),
					tree: newTree,
				}

				state.commits[hash] = newCommit

				// Update branch pointer
				if (state.HEAD.type === 'branch') {
					state.branches[state.HEAD.ref].headCommitHash = hash
				} else {
					state.HEAD.ref = hash
				}

				// Clear staging area and reset file statuses
				state.stagingArea = {}
				Object.keys(state.workingDirectory).forEach((path) => {
					state.workingDirectory[path].status = 'unmodified'
				})

				state.lastOutput = `[${state.HEAD.ref} ${hash.slice(0, 7)}] ${message}`
				state.commandHistory.push(`git commit -m \\"${message}\\"`)
			})

			return true
		},

		checkout: (ref) => {
			set((state) => {
				// Check if it's a branch
				if (state.branches[ref]) {
					state.HEAD = { type: 'branch', ref }
					const branch = state.branches[ref]
					const commit = state.commits[branch.headCommitHash]
					if (commit) {
						state.workingDirectory = JSON.parse(JSON.stringify(commit.tree))
					}
					state.lastOutput = `Switched to branch '${ref}'`
				}
				// Check if it's a commit hash
				else if (state.commits[ref]) {
					state.HEAD = { type: 'detached', ref }
					const commit = state.commits[ref]
					state.workingDirectory = JSON.parse(JSON.stringify(commit.tree))
					state.lastOutput = `HEAD is now at ${ref.slice(0, 7)} (detached)`
				} else {
					state.lastOutput = `error: pathspec '${ref}' did not match any file(s) known to git`
					return
				}

				state.stagingArea = {}
				state.commandHistory.push(`git checkout ${ref}`)
			})

			return true
		},

		branch: (name) => {
			const state = get()

			if (state.branches[name]) {
				set((s) => {
					s.lastOutput = `fatal: A branch named '${name}' already exists`
				})
				return false
			}

			set((state) => {
				const currentCommitHash =
					state.HEAD.type === 'branch'
						? state.branches[state.HEAD.ref].headCommitHash
						: state.HEAD.ref

				state.branches[name] = {
					name,
					headCommitHash: currentCommitHash,
					color: getNextColor(),
				}

				state.lastOutput = `Created branch '${name}'`
				state.commandHistory.push(`git branch ${name}`)
			})

			return true
		},

		merge: (sourceBranch) => {
			const state = get()
			const sourceBranchObj = state.branches[sourceBranch]

			if (!sourceBranchObj) {
				set((s) => {
					s.lastOutput = `fatal: '${sourceBranch}' is not a valid branch`
				})
				return { success: false, conflict: false }
			}

			if (state.HEAD.type !== 'branch') {
				set((s) => {
					s.lastOutput = 'Cannot merge into detached HEAD state'
				})
				return { success: false, conflict: false }
			}

			set((state) => {
				const targetBranch = state.branches[state.HEAD.ref]
				const sourceCommit = state.commits[sourceBranchObj.headCommitHash]
				const targetCommit = state.commits[targetBranch.headCommitHash]

				// Check for fast-forward possibility
				let canFastForward = false
				let current = sourceCommit
				while (current) {
					if (current.hash === targetBranch.headCommitHash) {
						canFastForward = true
						break
					}
					current = current.parents[0]
						? state.commits[current.parents[0]]
						: (undefined as unknown as GitCommit)
				}

				if (canFastForward) {
					// Fast-forward merge
					targetBranch.headCommitHash = sourceBranchObj.headCommitHash
					state.workingDirectory = JSON.parse(JSON.stringify(sourceCommit.tree))
					state.lastOutput = `Fast-forward merge: ${state.HEAD.ref} -> ${sourceBranch}`
				} else {
					// Three-way merge (create merge commit)
					const hash = generateHash()
					const mergedTree: FileStructure = {
						...JSON.parse(JSON.stringify(targetCommit.tree)),
						...JSON.parse(JSON.stringify(sourceCommit.tree)),
					}

					const mergeCommit: GitCommit = {
						hash,
						parents: [
							targetBranch.headCommitHash,
							sourceBranchObj.headCommitHash,
						],
						message: `Merge branch '${sourceBranch}' into ${state.HEAD.ref}`,
						author: 'You',
						timestamp: Date.now(),
						tree: mergedTree,
					}

					state.commits[hash] = mergeCommit
					targetBranch.headCommitHash = hash
					state.workingDirectory = JSON.parse(JSON.stringify(mergedTree))
					state.lastOutput = `Merge made by the 'ort' strategy`
				}

				state.commandHistory.push(`git merge ${sourceBranch}`)
			})

			return { success: true, conflict: false }
		},

		reset: (mode, ref) => {
			set((state) => {
				const targetRef =
					ref ||
					(state.HEAD.type === 'branch'
						? state.branches[state.HEAD.ref].headCommitHash
						: state.HEAD.ref)

				const targetCommit = state.commits[targetRef]
				if (!targetCommit) {
					state.lastOutput = `fatal: '${targetRef}' is not a valid commit`
					return
				}

				// Find parent commit
				const parentHash = targetCommit.parents[0]
				if (!parentHash) {
					state.lastOutput = 'Cannot reset: this is the root commit'
					return
				}

				const parentCommit = state.commits[parentHash]

				if (state.HEAD.type === 'branch') {
					state.branches[state.HEAD.ref].headCommitHash = parentHash
				}

				if (mode === 'hard') {
					state.workingDirectory = JSON.parse(JSON.stringify(parentCommit.tree))
					state.stagingArea = {}
					state.lastOutput = `HEAD is now at ${parentHash.slice(0, 7)}`
				} else {
					// Soft reset - keep changes in working directory
					state.lastOutput = `Unstaged changes after reset:\n\t${Object.keys(
						state.workingDirectory
					).join('\n\t')}`
				}

				state.commandHistory.push(`git reset --${mode} HEAD~1`)
			})

			return true
		},

		log: () => {
			const state = get()
			const logs: GitCommit[] = []
			let currentHash =
				state.HEAD.type === 'branch'
					? state.branches[state.HEAD.ref]?.headCommitHash
					: state.HEAD.ref

			while (currentHash && state.commits[currentHash]) {
				logs.push(state.commits[currentHash])
				currentHash = state.commits[currentHash].parents[0]
			}

			return logs
		},

		status: () => {
			const state = get()
			const staged: string[] = []
			const modified: string[] = []
			const untracked: string[] = []

			Object.entries(state.workingDirectory).forEach(([path, file]) => {
				if (file.status === 'staged') {
					staged.push(path)
				} else if (file.status === 'modified') {
					modified.push(path)
				} else if (file.status === 'added') {
					untracked.push(path)
				}
			})

			return { staged, modified, untracked }
		},

		executeCommand: (command) => {
			const parts = command.trim().split(/\s+/)
			const cmd = parts[0]
			const args = parts.slice(1)

			if (cmd !== 'git') {
				set((s) => {
					s.lastOutput = `Command not found: ${cmd}`
				})
				return get().lastOutput
			}

			const gitCmd = args[0]
			const gitArgs = args.slice(1)

			switch (gitCmd) {
				case 'init':
					get().init()
					break
				case 'add':
					if (gitArgs[0] === '.') {
						get().add('all')
					} else {
						get().add(gitArgs)
					}
					break
				case 'commit':
					if (gitArgs[0] === '-m' && gitArgs[1]) {
						const message = gitArgs
							.slice(1)
							.join(' ')
							.replace(/^["']|["']$/g, '')
						get().commit(message)
					} else {
						set((s) => {
							s.lastOutput = 'Usage: git commit -m \\"message\\"'
						})
					}
					break
				case 'checkout':
					if (gitArgs[0] === '-b' && gitArgs[1]) {
						get().branch(gitArgs[1])
						get().checkout(gitArgs[1])
					} else if (gitArgs[0]) {
						get().checkout(gitArgs[0])
					}
					break
				case 'branch':
					if (gitArgs[0]) {
						get().branch(gitArgs[0])
					} else {
						const branches = Object.keys(get().branches)
						const current = get().HEAD.type === 'branch' ? get().HEAD.ref : null
						set((s) => {
							s.lastOutput = branches
								.map((b) => (b === current ? `* ${b}` : `  ${b}`))
								.join('\n')
						})
					}
					break
				case 'merge':
					if (gitArgs[0]) {
						get().merge(gitArgs[0])
					}
					break
				case 'reset': {
					const mode = gitArgs.includes('--hard') ? 'hard' : 'soft'
					get().reset(mode)
					break
				}
				case 'log': {
					const logs = get().log()
					set((s) => {
						s.lastOutput = logs
							.map(
								(c) =>
									`commit ${c.hash}\nAuthor: ${c.author}\nDate: ${new Date(
										c.timestamp
									).toLocaleString()}\n\n    ${c.message}`
							)
							.join('\n\n')
					})
					break
				}
				case 'status': {
					const status = get().status()
					set((s) => {
						let output = `On branch ${get().HEAD.ref}\n`
						if (status.staged.length) {
							output +=
								'\nChanges to be committed:\n' +
								status.staged.map((f) => `  staged: ${f}`).join('\n')
						}
						if (status.modified.length) {
							output +=
								'\nChanges not staged:\n' +
								status.modified.map((f) => `  modified: ${f}`).join('\n')
						}
						if (status.untracked.length) {
							output +=
								'\nUntracked files:\n' +
								status.untracked.map((f) => `  ${f}`).join('\n')
						}
						if (
							!status.staged.length &&
							!status.modified.length &&
							!status.untracked.length
						) {
							output += '\nnothing to commit, working tree clean'
						}
						s.lastOutput = output
					})
					break
				}
				case 'tag':
					if (gitArgs[0]) {
						// 创建新标签
						const tagName = gitArgs[0]
						const currentHash =
							get().HEAD.type === 'branch'
								? get().branches[get().HEAD.ref]?.headCommitHash
								: get().HEAD.ref
						if (currentHash) {
							set((s) => {
								s.tags[tagName] = currentHash
								s.lastOutput = `Created tag '${tagName}' at ${currentHash.slice(
									0,
									7
								)}`
								s.commandHistory.push(`git tag ${tagName}`)
							})
						}
					} else {
						// 列出所有标签
						const tags = Object.keys(get().tags)
						set((s) => {
							s.lastOutput = tags.length > 0 ? tags.join('\n') : 'No tags found'
							s.commandHistory.push('git tag')
						})
					}
					break
				default:
					set((s) => {
						s.lastOutput = `git: '${gitCmd}' is not a git command`
					})
			}

			return get().lastOutput
		},

		resetState: () => {
			set(createInitialState())
		},

		loadScenario: (scenario) => {
			set((state) => {
				Object.assign(state, scenario)
			})
		},

		getCurrentBranch: () => {
			const state = get()
			return state.HEAD.type === 'branch' ? state.HEAD.ref : null
		},

		getHeadCommit: () => {
			const state = get()
			const hash =
				state.HEAD.type === 'branch'
					? state.branches[state.HEAD.ref]?.headCommitHash
					: state.HEAD.ref
			return hash ? state.commits[hash] : null
		},
	}))
)
