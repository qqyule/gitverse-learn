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

export const levels: Level[] = [
	// ============ Phase 1: Genesis（创世纪）- 基础操作 ============
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
		phase: 1,
		title: 'Status Report',
		titleZh: '状态报告',
		subtitle: 'Genesis',
		description:
			'Before committing, check what has changed. Git status shows the state of your working directory and staging area.',
		goal: 'Use git status to see modified files, then check your commit history with git log.',
		hints: [
			'Modify a file in the working directory',
			'Run "git status" to see the changes',
			'Stage with "git add ." and run status again',
			'After committing, run "git log" to see history',
		],
		commands: ['git status', 'git log'],
		validation: (state) => {
			return (
				state.commandHistory.some((cmd: string) =>
					cmd.includes('git status')
				) && state.commandHistory.some((cmd: string) => cmd.includes('git log'))
			)
		},
	},

	// ============ Phase 2: Multiverse（平行宇宙）- 分支操作 ============
	{
		id: 'level-4',
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
			return (
				state.branches['feature'] !== undefined &&
				state.branches['feature'].headCommitHash !==
					state.branches['main']?.headCommitHash
			)
		},
	},
	{
		id: 'level-5',
		phase: 2,
		title: 'Shadow Clones',
		titleZh: '多重影分身',
		subtitle: 'Multiverse',
		description:
			'Real projects often have multiple branches: features, bugfixes, experiments. Each branch is an independent line of development.',
		goal: 'Create two branches: "feature-a" and "feature-b", and make a commit on each.',
		hints: [
			'Create first branch: "git checkout -b feature-a"',
			'Make a commit on feature-a',
			'Go back to main: "git checkout main"',
			'Create second branch: "git checkout -b feature-b"',
			'Make a commit on feature-b',
		],
		commands: ['git branch', 'git checkout -b', 'git checkout'],
		validation: (state) => {
			const hasFeatureA = state.branches['feature-a'] !== undefined
			const hasFeatureB = state.branches['feature-b'] !== undefined
			if (!hasFeatureA || !hasFeatureB) return false

			// 两个分支的 commit 都应该不同于 main
			const mainHash = state.branches['main']?.headCommitHash
			const aHash = state.branches['feature-a'].headCommitHash
			const bHash = state.branches['feature-b'].headCommitHash

			return aHash !== mainHash && bHash !== mainHash
		},
	},
	{
		id: 'level-6',
		phase: 2,
		title: 'Merging Paths',
		titleZh: '殊途同归',
		subtitle: 'Multiverse',
		description:
			'Merge brings changes from one branch into another. When one branch is directly ahead, Git performs a "fast-forward" merge.',
		goal: 'Merge feature-a into main using fast-forward.',
		hints: [
			'First, checkout main: "git checkout main"',
			'Then merge: "git merge feature-a"',
			'Watch the graph update!',
			'Notice main now points to the same commit as feature-a',
		],
		commands: ['git merge', 'git checkout'],
		validation: (state) => {
			if (!state.branches['main'] || !state.branches['feature-a']) return false
			// Fast-forward: main 现在应该指向 feature-a 的 commit
			return (
				state.branches['main'].headCommitHash ===
				state.branches['feature-a'].headCommitHash
			)
		},
	},
	{
		id: 'level-7',
		phase: 2,
		title: 'Spacetime Intersection',
		titleZh: '时空交汇',
		subtitle: 'Multiverse',
		description:
			'When branches have diverged, Git creates a merge commit with two parents. This is called a 3-way merge.',
		goal: 'Merge feature-b into main to create a merge commit.',
		hints: [
			'Make sure you are on main: "git checkout main"',
			'Merge feature-b: "git merge feature-b"',
			'A merge commit will be created',
			'Notice the commit has two parent lines in the graph',
		],
		commands: ['git merge'],
		validation: (state) => {
			if (!state.branches['main']) return false
			const mainCommit = state.commits[state.branches['main'].headCommitHash]
			// 3-way merge 会产生一个有两个 parent 的 commit
			return mainCommit?.parents.length === 2
		},
	},

	// ============ Phase 3: Regret & Rewrite（后悔药）- 撤销与修改 ============
	{
		id: 'level-8',
		phase: 3,
		title: 'Soft Landing',
		titleZh: '软着陆',
		subtitle: 'Regret & Rewrite',
		description:
			'Made a commit too early? Reset --soft undoes the commit but keeps all your changes staged.',
		goal: 'Make a commit, then reset it with --soft to keep your changes.',
		hints: [
			'Make a change and commit it',
			'Run "git reset --soft HEAD~1"',
			'Your changes are still staged!',
			'Try "git status" to verify',
		],
		commands: ['git reset --soft'],
		validation: (state) => {
			return state.commandHistory.some((cmd: string) =>
				cmd.includes('git reset --soft')
			)
		},
	},
	{
		id: 'level-9',
		phase: 3,
		title: 'Hard Landing',
		titleZh: '硬着陆',
		subtitle: 'Regret & Rewrite',
		description:
			'Sometimes you want to completely discard changes. Reset --hard throws away everything and restores the previous state.',
		goal: 'Make a commit, then reset it with --hard to discard all changes.',
		hints: [
			'Make a change and commit it',
			'Run "git reset --hard HEAD~1"',
			'Your changes are completely gone!',
			'Use with caution in real projects',
		],
		commands: ['git reset --hard'],
		validation: (state) => {
			return state.commandHistory.some((cmd: string) =>
				cmd.includes('git reset --hard')
			)
		},
	},
	{
		id: 'level-10',
		phase: 3,
		title: 'Selective Amnesia',
		titleZh: '选择性失忆',
		subtitle: 'Regret & Rewrite',
		description:
			'You can also reset without specifying --soft or --hard. The default --mixed mode unstages changes but keeps them in your working directory.',
		goal: 'Commit a change, then use git reset HEAD~1 (mixed mode).',
		hints: [
			'Make a change and commit it',
			'Run "git reset HEAD~1" (no --soft or --hard)',
			'Check status: changes are in working dir but not staged',
			'This is the default reset behavior',
		],
		commands: ['git reset'],
		validation: (state) => {
			// 检查是否执行了不带 --soft 或 --hard 的 reset
			return state.commandHistory.some(
				(cmd: string) =>
					cmd.includes('git reset HEAD') &&
					!cmd.includes('--soft') &&
					!cmd.includes('--hard')
			)
		},
	},

	// ============ Phase 4: The Ensemble（团队协作）- 进阶操作 ============
	{
		id: 'level-11',
		phase: 4,
		title: 'Milestone',
		titleZh: '里程碑',
		subtitle: 'The Ensemble',
		description:
			'Tags mark important points in history like releases. Unlike branches, tags never move - they always point to the same commit.',
		goal: 'Create a tag called "v1.0" on the current commit.',
		hints: [
			'Make sure you have at least one commit',
			'Run "git tag v1.0" to create a tag',
			'Tags are like permanent bookmarks',
			'Use "git tag" to list all tags',
		],
		commands: ['git tag'],
		validation: (state) => {
			return state.tags && state.tags['v1.0'] !== undefined
		},
	},
	{
		id: 'level-12',
		phase: 4,
		title: 'The Journey Continues',
		titleZh: '旅程继续',
		subtitle: 'The Ensemble',
		description:
			'Congratulations! You have learned the core concepts of Git. The real power of Git comes from collaboration with remote repositories.',
		goal: 'Create a new branch called "next-chapter" to symbolize your continued learning.',
		hints: [
			'You have mastered: init, add, commit, log, status',
			'You have mastered: branch, checkout, merge',
			'You have mastered: reset (soft, hard, mixed)',
			'Create "next-chapter" branch to complete your journey!',
		],
		commands: ['git branch', 'git checkout -b'],
		validation: (state) => {
			return state.branches['next-chapter'] !== undefined
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
