export interface Level {
	id: string
	phase: number
	title: string
	titleZh: string
	subtitle: string
	description: string
	goal: string
	hints: string[]
	commands: string[]
	validation: (state: any) => boolean
	setup?: () => void
}

const isAncestor = (
	commits: Record<string, any>,
	ancestorHash: string,
	descendantHash: string
): boolean => {
	let current = commits[descendantHash]
	// DFS or simple parent traversal (linear history for now, but handling multiple parents is safer)
	const queue = [current]
	const visited = new Set<string>()

	while (queue.length > 0) {
		const commit = queue.shift()
		if (!commit) continue
		if (visited.has(commit.hash)) continue
		visited.add(commit.hash)

		if (commit.hash === ancestorHash) return true

		commit.parents.forEach((parentHash: string) => {
			if (commits[parentHash]) {
				queue.push(commits[parentHash])
			}
		})
	}
	return false
}

export const levels: Level[] = [
	{
		id: 'level-1',
		phase: 1,
		title: 'First Snapshot',
		titleZh: '第一次快照',
		subtitle: 'Genesis',
		description:
			'Git saves snapshots of your project, not just changes. Each commit is a complete picture of all your files at that moment.',
		goal: 'Initialize a repository and make your first commit.',
		hints: [
			'Run "git init" to create a new repository',
			'Modify a file to see it change status',
			'Use "git add ." to stage all changes',
			'Run "git commit -m message" to save',
		],
		commands: ['git init', 'git add', 'git commit'],
		validation: (state) => {
			const commits = Object.values(state.commits)
			// 需要至少 2 个 commit：init 自动创建的 + 用户手动 commit 的
			return commits.length >= 2
		},
	},
	{
		id: 'level-2',
		phase: 1,
		title: 'Time Traveler',
		titleZh: '时间旅行者',
		subtitle: 'Genesis',
		description:
			'Git lets you travel through time! Use checkout to visit any commit and see your project as it was.',
		goal: 'Create 2 commits, then checkout the first one (detached HEAD).',
		hints: [
			'Make a change and commit it',
			'Run "git log" to see commit history',
			'Use "git checkout <hash>" with the first commit\'s hash',
			'Notice HEAD is now "detached"',
		],
		commands: ['git log', 'git checkout'],
		validation: (state) => {
			const commits = Object.values(state.commits)
			return commits.length >= 2 && state.HEAD.type === 'detached'
		},
	},
	{
		id: 'level-3',
		phase: 2,
		title: 'Branching Timeline',
		titleZh: '分裂的时间线',
		subtitle: 'Multiverse',
		description:
			'Branches are lightweight pointers to commits. They let you work on features without affecting the main code.',
		goal: 'Create a new branch called "feature" and make a commit on it.',
		hints: [
			'Use "git branch feature" to create a branch',
			'Run "git checkout feature" to switch to it',
			'Or use "git checkout -b feature" for both steps',
			'Make a commit on the new branch',
		],
		commands: ['git branch', 'git checkout -b'],
		validation: (state) => {
			const featureBranch = state.branches['feature']
			const mainBranch = state.branches['main']
			if (!featureBranch || !mainBranch) return false

			// Feature branch must be ahead of main (main is ancestor of feature)
			// And they must not point to the same commit
			return (
				featureBranch.headCommitHash !== mainBranch.headCommitHash &&
				isAncestor(
					state.commits,
					mainBranch.headCommitHash,
					featureBranch.headCommitHash
				)
			)
		},
	},
	{
		id: 'level-4',
		phase: 2,
		title: 'Merging Paths',
		titleZh: '殊途同归',
		subtitle: 'Multiverse',
		description:
			'Merge brings changes from one branch into another. Fast-forward is simple, but sometimes you need a merge commit.',
		goal: 'Merge your feature branch back into main.',
		hints: [
			'First, checkout main: "git checkout main"',
			'Then merge: "git merge feature"',
			'Watch the graph update!',
			"Notice if it's a fast-forward or merge commit",
		],
		commands: ['git merge'],
		validation: (state) => {
			if (!state.branches['main'] || !state.branches['feature']) return false
			const mainCommit = state.commits[state.branches['main'].headCommitHash]
			return (
				mainCommit?.parents.length === 2 ||
				state.branches['main'].headCommitHash ===
					state.branches['feature'].headCommitHash
			)
		},
	},
	{
		id: 'level-5',
		phase: 3,
		title: 'Soft Landing',
		titleZh: '软着陆与硬着陆',
		subtitle: 'Regret & Rewrite',
		description:
			'Made a mistake? Reset lets you undo commits. Soft keeps changes, hard throws them away.',
		goal: 'Make a commit, then reset it with --soft to keep your changes.',
		hints: [
			'Make a change and commit it',
			'Run "git reset --soft HEAD~1"',
			'Your changes are still in the working directory!',
			'Try "git status" to see',
		],
		commands: ['git reset --soft', 'git reset --hard'],
		validation: (state) => {
			return state.commandHistory.some((cmd: string) =>
				cmd.includes('git reset --soft')
			)
		},
	},
]

export function getLevelById(id: string): Level | undefined {
	return levels.find((level) => level.id === id)
}

export function getPhaseTitle(phase: number): string {
	switch (phase) {
		case 1:
			return 'Genesis - 创世纪'
		case 2:
			return 'Multiverse - 平行宇宙'
		case 3:
			return 'Regret & Rewrite - 后悔药'
		case 4:
			return 'The Ensemble - 团队协作'
		default:
			return ''
	}
}
