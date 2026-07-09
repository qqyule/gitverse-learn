/**
 * M6 — Embeddable lesson target (the page an embed `<iframe>` points at).
 *
 * Renders a single official level in a chrome-less, self-contained widget so
 * third-party sites can embed real, interactive GitMaster lessons. It reuses
 * the same GitGraphSvg + Terminal + getLevelValidator pipeline as LearnPage /
 * SharedLevelPage. Community/shared levels are reached via the `?l=` share
 * param (same decode path as SharedLevelPage).
 */

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useSearchParams } from 'react-router-dom'
import { GitGraphSvg } from '@/components/git/GitGraphSvg'
import { Terminal } from '@/components/terminal/Terminal'
import { levels } from '@/data/levels'
import { getLevelValidator, toRuntimeLevel } from '@/lib/levelValidator'
import { useGitStore } from '@/store/gitStore'
import { useUgcStore } from '@/store/ugcStore'
import type { Level } from '@/types/git'

const EmbedPage = () => {
	const { t } = useTranslation()
	const { lessonId } = useParams<{ lessonId: string }>()
	const [params] = useSearchParams()
	const decodeShare = useUgcStore((s) => s.decodeShare)

	const official = levels.find((l) => l.id === lessonId) ?? null
	const shared = params.get('l') ? decodeShare(params.get('l')!) : null
	const sharedLevel = shared?.ok ? shared.level : null
	let runtimeShared: Level | null = null
	try {
		runtimeShared = sharedLevel ? toRuntimeLevel(sharedLevel) : null
	} catch {
		runtimeShared = null
	}
	const level: Level | null = official ?? runtimeShared

	const git = useGitStore()
	const { resetState } = git
	const passed = level ? getLevelValidator(level)(git) : false

	const hideChrome = params.get('chrome') === '0'

	useEffect(() => {
		if (!level) return
		document.title = `${level.title} · GitMaster`
		resetState()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [level?.id])

	if (!level) {
		return (
			<div className="flex h-full items-center justify-center p-6 text-muted-foreground text-sm">
				{t('shared.invalid')}
			</div>
		)
	}

	const header = (
		<div className="flex items-start justify-between gap-4 border-b px-5 py-3">
			<div>
				<h1 className="font-bold text-lg">{level.title}</h1>
				<p className="text-muted-foreground text-xs">{level.goal}</p>
			</div>
			{passed && (
				<span className="rounded-full bg-success/15 px-2 py-1 font-medium text-success text-xs">
					✓ {t('shared.completed')}
				</span>
			)}
		</div>
	)

	return (
		<div className="flex h-full flex-col bg-background">
			{hideChrome || header}
			<div className="grid flex-1 grid-rows-2 gap-px overflow-hidden bg-border">
				<div className="overflow-hidden bg-card">
					<GitGraphSvg className="h-full p-4" onNodeClick={(hash) => git.checkout(hash)} />
				</div>
				<div className="overflow-hidden bg-card">
					<Terminal
						className="h-full"
						externalInput=""
						isExpanded
						onInputChange={() => undefined}
						onToggle={() => undefined}
					/>
				</div>
			</div>
			{!hideChrome && (
				<div className="flex justify-end border-t px-5 py-2">
					<button
						className="text-muted-foreground text-xs hover:text-foreground"
						onClick={resetState}
						type="button"
					>
						{t('learn.resetBtn')}
					</button>
				</div>
			)}
		</div>
	)
}

export default EmbedPage
