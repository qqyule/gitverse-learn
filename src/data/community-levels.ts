import type { UgcLevel } from '@/types/level'

/**
 * 社区精选关卡（示例 UGC 内容）。展示声明式 `validationRules` 关卡如何被
 * 定义、存储与分享：编辑器导出的关卡即用此结构，分享链接经 base64 编解码，
 * 在 /shared 页面用 getLevelValidator 实时校验。
 *
 * 真实规模化时，这部分应来自 M3 的 Supabase 后端（社区提交 + 审核流）。
 */
export const communityLevels: UgcLevel[] = [
	{
		author: 'community',
		commands: ['git commit', 'git tag'],
		description: 'A community challenge: tag your first release to mark a milestone.',
		goal: 'Create a tag called "release-1".',
		hints: ['Make at least one commit first', 'Run "git tag release-1"'],
		id: 'community-tag-release',
		phase: 4,
		subtitle: 'Community',
		title: 'Tag the Release',
		titleZh: '给版本打标签',
		validationRules: [{ type: 'tagExists', value: 'release-1' }],
	},
	{
		author: 'community',
		commands: ['git branch', 'git checkout -b'],
		description: 'A community challenge: practice isolated exploration with a branch.',
		goal: 'Create a branch "experiment" and make a commit on it.',
		hints: ['Run "git checkout -b experiment"', 'Modify a file and commit'],
		id: 'community-experiment',
		phase: 2,
		subtitle: 'Community',
		title: 'Experiment Branch',
		titleZh: '实验分支',
		validationRules: [{ type: 'branchExists', value: 'experiment' }],
	},
]
