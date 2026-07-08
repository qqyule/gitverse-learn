import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { GitGraphSvg } from '@/components/git/GitGraphSvg'
import { Terminal } from '@/components/terminal/Terminal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getLevelValidator, toRuntimeLevel } from '@/lib/levelValidator'
import { useGitStore } from '@/store/gitStore'
import { type ImportResult, useUgcStore } from '@/store/ugcStore'
import type { Level } from '@/types/git'

const SharedLevelPage = () => {
	const { t } = useTranslation()
	const [params] = useSearchParams()
	const decodeShare = useUgcStore((s) => s.decodeShare)
	const saveDraft = useUgcStore((s) => s.saveDraft)

	const encoded = params.get('l')
	const decoded: ImportResult = encoded ? decodeShare(encoded) : { error: 'missing', ok: false }
	const ugcLevel = decoded.ok ? decoded.level : null
	const level: Level | null = ugcLevel ? toRuntimeLevel(ugcLevel) : null

	const git = useGitStore()
	const { resetState } = git
	const passed = level ? getLevelValidator(level)(git) : false
	const [saved, setSaved] = useState(false)

	// OG meta 注入（SPA 限制：社交爬虫需 SSR/预渲染才能真正抓取，此处对人可见）
	useEffect(() => {
		if (!level) return
		document.title = `${level.title} · GitMaster`
		const setMeta = (property: string, content: string) => {
			let el = document.querySelector(`meta[property="${property}"]`)
			if (!el) {
				el = document.createElement('meta')
				el.setAttribute('property', property)
				document.head.appendChild(el)
			}
			el.setAttribute('content', content)
		}
		setMeta('og:title', level.title)
		setMeta('og:description', level.description)
		setMeta('og:type', 'website')
	}, [level])

	if (!level) {
		return (
			<div className="container mx-auto max-w-md py-12">
				<Card>
					<CardHeader>
						<CardTitle>{t('shared.invalid')}</CardTitle>
						<CardDescription>{t('shared.invalidDesc')}</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild>
							<Link to="/editor">{t('shared.backToEditor')}</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="container mx-auto max-w-4xl space-y-4 py-8">
			<div className="flex items-start justify-between gap-4">
				<div>
					<div className="flex items-center gap-2">
						<h1 className="font-bold text-2xl">{level.title}</h1>
						{level.isUgc && (
							<span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
								UGC
							</span>
						)}
					</div>
					<p className="text-muted-foreground text-sm">{level.titleZh}</p>
					{level.author && <p className="text-muted-foreground text-xs">@{level.author}</p>}
				</div>
				<div className="flex flex-shrink-0 gap-2">
					<Button onClick={resetState} variant="outline">
						{t('learn.resetBtn')}
					</Button>
					<Button asChild variant="ghost">
						<Link to="/editor">{t('shared.edit')}</Link>
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{level.goal}</CardTitle>
					<CardDescription>{level.description}</CardDescription>
				</CardHeader>
				<CardContent>
					<ul className="list-disc space-y-1 pl-5 text-sm">
						{level.hints.map((hint, index) => (
							<li key={index}>{hint}</li>
						))}
					</ul>
					<div className="mt-3 flex flex-wrap gap-1.5">
						{level.commands.map((cmd) => (
							<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs" key={cmd}>
								{cmd}
							</code>
						))}
					</div>
				</CardContent>
			</Card>

			<div className="h-64 overflow-hidden rounded-lg border bg-card">
				<GitGraphSvg className="h-full p-4" onNodeClick={(hash) => git.checkout(hash)} />
			</div>

			<div className="h-72 overflow-hidden rounded-lg border bg-card">
				<Terminal
					className="h-full"
					externalInput=""
					isExpanded
					onInputChange={() => undefined}
					onToggle={() => undefined}
				/>
			</div>

			{passed && ugcLevel && (
				<Card className="border-success">
					<CardContent className="flex items-center justify-between py-4">
						<span className="font-medium text-success">🎉 {t('shared.completed')}</span>
						<Button
							onClick={() => {
								saveDraft(ugcLevel)
								setSaved(true)
							}}
							variant="outline"
						>
							{saved ? t('shared.saved') : t('shared.saveDraft')}
						</Button>
					</CardContent>
				</Card>
			)}
		</div>
	)
}

export default SharedLevelPage
