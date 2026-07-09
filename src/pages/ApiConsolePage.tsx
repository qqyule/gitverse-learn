/**
 * M6 — API console (skeleton). Surfaces the open-API / SDK story: API key
 * management (local mock), the embed-code generator (fully functional via
 * services/embedSdk.ts), and endpoint documentation. Real key issuance +
 * endpoints activate once VITE_API_BASE_URL is configured.
 */

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { isApiConfigured } from '@/lib/apiClient'
import { getEmbedHtml, validateEmbedOptions } from '@/services/embedSdk'
import { useAccountStore } from '@/store/accountStore'
import type { ApiScope, EmbedOptions } from '@/types/api'

const SCOPES: ApiScope[] = ['read:progress', 'write:progress', 'read:lessons', 'embed:lessons']
const ENDPOINTS = [
	{ method: 'POST', path: '/api-keys' },
	{ method: 'GET', path: '/api-keys' },
	{ method: 'DELETE', path: '/api-keys/:display' },
	{ method: 'GET', path: '/lessons/:id' },
	{ method: 'GET', path: '/embed/:lessonId' },
]

const ApiConsolePage = () => {
	const { t } = useTranslation()
	const tier = useAccountStore((s) => s.profile?.tier ?? 'free')
	const [lessonId, setLessonId] = useState('level-1')
	const [height, setHeight] = useState('520')
	const [hideChrome, setHideChrome] = useState(true)
	const [copied, setCopied] = useState(false)

	const options: EmbedOptions = useMemo(
		() => ({
			height: Number(height) || undefined,
			hideChrome,
			lessonId,
		}),
		[lessonId, height, hideChrome]
	)

	const validation = validateEmbedOptions(options)
	const embed = useMemo(
		() => (validation.ok ? getEmbedHtml(lessonId, options) : null),
		[validation.ok, lessonId, options]
	)

	const handleCopy = () => {
		if (!embed) return
		navigator.clipboard?.writeText(embed.html).then(() => {
			setCopied(true)
			setTimeout(() => setCopied(false), 1500)
		})
	}

	return (
		<div className="container mx-auto max-w-4xl space-y-6 py-12">
			<div className="space-y-2">
				<h1 className="font-bold text-3xl">{t('api.title')}</h1>
				<p className="text-muted-foreground">{t('api.description')}</p>
				{tier === 'free' && <Badge variant="outline">{t('api.requiresPro')}</Badge>}
			</div>

			{!isApiConfigured() && (
				<p className="text-center text-amber-600 text-sm dark:text-amber-400">
					{t('api.demoMode')}
				</p>
			)}

			<Card>
				<CardHeader>
					<CardTitle>{t('api.embedTitle')}</CardTitle>
					<CardDescription>{t('api.embedDescription')}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-3">
						<div className="space-y-2">
							<Label htmlFor="lessonId">{t('api.lessonId')}</Label>
							<Input
								id="lessonId"
								onChange={(e) => setLessonId(e.target.value)}
								placeholder="level-1"
								value={lessonId}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="height">{t('api.height')}</Label>
							<Input
								id="height"
								onChange={(e) => setHeight(e.target.value)}
								placeholder="520"
								type="number"
								value={height}
							/>
						</div>
						<div className="flex items-end gap-2">
							<label className="flex items-center gap-2 text-sm">
								<input
									checked={hideChrome}
									onChange={(e) => setHideChrome(e.target.checked)}
									type="checkbox"
								/>
								{t('api.hideChrome')}
							</label>
						</div>
					</div>
					{!validation.ok && <p className="text-destructive text-sm">{validation.error}</p>}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label>{t('api.embedCode')}</Label>
							<Button disabled={!embed} onClick={handleCopy} size="sm" variant="outline">
								{copied ? t('api.copied') : t('api.copy')}
							</Button>
						</div>
						<Textarea className="font-mono text-xs" readOnly rows={5} value={embed?.html ?? ''} />
						{embed && (
							<p className="break-all text-muted-foreground text-xs">
								{t('api.embedSrc')}: {embed.src}
							</p>
						)}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t('api.keysTitle')}</CardTitle>
					<CardDescription>{t('api.keysDescription')}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="flex flex-wrap gap-2">
						{SCOPES.map((scope) => (
							<Badge key={scope} variant="secondary">
								{scope}
							</Badge>
						))}
					</div>
					<p className="text-muted-foreground text-sm">
						{isApiConfigured() ? t('api.keysLive') : t('api.keysPending')}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t('api.endpointsTitle')}</CardTitle>
				</CardHeader>
				<CardContent>
					<ul className="space-y-2 font-mono text-sm">
						{ENDPOINTS.map((e) => (
							<li className="flex items-center gap-3" key={`${e.method}-${e.path}`}>
								<Badge variant="outline">{e.method}</Badge>
								<span>{e.path}</span>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>
		</div>
	)
}

export default ApiConsolePage
