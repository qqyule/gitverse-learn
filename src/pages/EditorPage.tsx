import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import UpgradePrompt from '@/components/UpgradePrompt'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { validateLevelSchema } from '@/lib/levelValidator'
import { getQuota } from '@/lib/quota'
import { useAccountStore } from '@/store/accountStore'
import { useUgcStore } from '@/store/ugcStore'
import type { UgcLevel, ValidationRule } from '@/types/level'

// 可视化模式支持的叶子规则（组合类 not/allOf/anyOf 通过 JSON 模式编辑）
const LEAF_RULE_TYPES = [
	'minCommits',
	'commandRun',
	'branchExists',
	'tagExists',
	'detachedHead',
	'branchAheadOf',
	'headEquals',
	'mergeCommit',
	'fileModified',
] as const

type LeafRuleType = (typeof LEAF_RULE_TYPES)[number]

const blankForm = (): UgcLevel => ({
	commands: [],
	description: '',
	goal: '',
	hints: [],
	id: '',
	phase: 1,
	subtitle: '',
	title: '',
	titleZh: '',
	validationRules: [],
})

const linesToArray = (text: string): string[] =>
	text
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)

const ruleValue = (rule: ValidationRule): string =>
	((rule as { value?: string | number }).value ?? '').toString()

const ruleExtra = (rule: ValidationRule): { branch?: string; equals?: string; of?: string } =>
	rule as { branch?: string; equals?: string; of?: string }

const downloadJson = (filename: string, content: string): void => {
	const blob = new Blob([content], { type: 'application/json' })
	const url = URL.createObjectURL(blob)
	const anchor = document.createElement('a')
	anchor.href = url
	anchor.download = filename
	document.body.appendChild(anchor)
	anchor.click()
	document.body.removeChild(anchor)
	URL.revokeObjectURL(url)
}

const EditorPage = () => {
	const { t } = useTranslation()
	const encodeShare = useUgcStore((s) => s.encodeShare)
	const saveDraft = useUgcStore((s) => s.saveDraft)
	const drafts = useUgcStore((s) => s.drafts)
	const tier = useAccountStore((s) => s.profile?.tier ?? 'free')
	const draftLimit = getQuota(tier).drafts
	const draftLimitReached = tier === 'free' && drafts.length >= getQuota('free').drafts
	const [form, setForm] = useState<UgcLevel>(blankForm())
	const [jsonText, setJsonText] = useState('')
	const [jsonError, setJsonError] = useState<string | null>(null)

	const update = (patch: Partial<UgcLevel>) => setForm((prev) => ({ ...prev, ...patch }))

	const updateRule = (index: number, patch: Partial<ValidationRule>) =>
		setForm((prev) => ({
			...prev,
			validationRules: prev.validationRules.map((rule, i) =>
				i === index ? ({ ...rule, ...patch } as ValidationRule) : rule
			),
		}))

	const addRule = () =>
		setForm((prev) => ({
			...prev,
			validationRules: [...prev.validationRules, { type: 'commandRun', value: '' }],
		}))

	const removeRule = (index: number) =>
		setForm((prev) => ({
			...prev,
			validationRules: prev.validationRules.filter((_, i) => i !== index),
		}))

	const onRuleTypeChange = (index: number, type: LeafRuleType) =>
		setForm((prev) => ({
			...prev,
			validationRules: prev.validationRules.map((rule, i) => {
				if (i !== index) return rule
				switch (type) {
					case 'minCommits':
						return { type, value: 1 }
					case 'commandRun':
					case 'branchExists':
					case 'tagExists':
					case 'fileModified':
						return { type, value: '' }
					case 'detachedHead':
					case 'mergeCommit':
						return { type }
					case 'branchAheadOf':
						return { branch: '', of: '', type }
					case 'headEquals':
						return { branch: '', equals: '', type }
					default:
						return rule
				}
			}),
		}))

	const syncToJson = () => {
		setJsonText(JSON.stringify(form, null, 2))
		setJsonError(null)
	}

	const applyJson = () => {
		try {
			const parsed: unknown = JSON.parse(jsonText)
			const result = validateLevelSchema(parsed)
			if (!result.ok) {
				setJsonError(result.errors.join('; '))
				return
			}
			setForm(result.data)
			setJsonError(null)
			toast.success(t('editor.jsonApplied'))
		} catch {
			setJsonError(t('editor.invalidJson'))
		}
	}

	const handleSaveDraft = () => {
		const result = validateLevelSchema(form)
		if (!result.ok) {
			toast.error(result.errors.join('; '))
			return
		}
		// M5 — free tier is capped on the number of saved drafts.
		const isExisting = drafts.some((d) => d.id === result.data.id)
		if (!isExisting && drafts.length >= draftLimit) {
			toast.error(t('editor.draftsLimitDesc', { limit: draftLimit }))
			return
		}
		saveDraft(result.data)
		toast.success(t('editor.draftSaved'))
	}

	const handleExport = () => {
		const result = validateLevelSchema(form)
		if (!result.ok) {
			toast.error(result.errors.join('; '))
			return
		}
		downloadJson(`${form.id || 'level'}.json`, JSON.stringify(result.data, null, 2))
	}

	const handleShare = () => {
		const result = validateLevelSchema(form)
		if (!result.ok) {
			toast.error(result.errors.join('; '))
			return
		}
		const encoded = encodeShare(result.data)
		const url = `${window.location.origin}/learn/shared?l=${encoded}`
		navigator.clipboard
			.writeText(url)
			.then(() => toast.success(t('editor.shareCopied')))
			.catch(() => toast.error(t('editor.shareFailed')))
	}

	const handleClear = () => {
		setForm(blankForm())
		setJsonText('')
		setJsonError(null)
	}

	return (
		<div className="container mx-auto max-w-3xl py-12">
			<Card>
				<CardHeader>
					<CardTitle>{t('editor.pageTitle')}</CardTitle>
					<CardDescription>{t('editor.pageDescription')}</CardDescription>
				</CardHeader>
				<CardContent>
					{draftLimitReached && (
						<div className="mb-4">
							<UpgradePrompt
								description={t('editor.draftsLimitDesc', { limit: getQuota('free').drafts })}
								title={t('editor.draftsLimitTitle')}
							/>
						</div>
					)}
					<Tabs
						defaultValue="visual"
						onValueChange={(value) => {
							if (value === 'json') syncToJson()
						}}
					>
						<TabsList className="mb-4">
							<TabsTrigger value="visual">{t('editor.visual')}</TabsTrigger>
							<TabsTrigger value="json">JSON</TabsTrigger>
						</TabsList>

						<TabsContent className="space-y-4" value="visual">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1">
									<Label htmlFor="level-id">{t('editor.id')}</Label>
									<Input
										id="level-id"
										onChange={(e) => update({ id: e.target.value })}
										placeholder="my-custom-level"
										value={form.id}
									/>
								</div>
								<div className="space-y-1">
									<Label htmlFor="level-phase">{t('editor.phase')}</Label>
									<Select
										onValueChange={(v) => update({ phase: Number(v) })}
										value={String(form.phase)}
									>
										<SelectTrigger id="level-phase">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="1">1</SelectItem>
											<SelectItem value="2">2</SelectItem>
											<SelectItem value="3">3</SelectItem>
											<SelectItem value="4">4</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1">
									<Label htmlFor="level-title">{t('editor.title')}</Label>
									<Input
										id="level-title"
										onChange={(e) => update({ title: e.target.value })}
										value={form.title}
									/>
								</div>
								<div className="space-y-1">
									<Label htmlFor="level-titleZh">{t('editor.titleZh')}</Label>
									<Input
										id="level-titleZh"
										onChange={(e) => update({ titleZh: e.target.value })}
										value={form.titleZh}
									/>
								</div>
							</div>

							<div className="space-y-1">
								<Label htmlFor="level-subtitle">{t('editor.subtitle')}</Label>
								<Input
									id="level-subtitle"
									onChange={(e) => update({ subtitle: e.target.value })}
									value={form.subtitle}
								/>
							</div>

							<div className="space-y-1">
								<Label htmlFor="level-desc">{t('editor.description')}</Label>
								<Textarea
									id="level-desc"
									onChange={(e) => update({ description: e.target.value })}
									rows={2}
									value={form.description}
								/>
							</div>

							<div className="space-y-1">
								<Label htmlFor="level-goal">{t('editor.goal')}</Label>
								<Textarea
									id="level-goal"
									onChange={(e) => update({ goal: e.target.value })}
									rows={2}
									value={form.goal}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1">
									<Label htmlFor="level-commands">{t('editor.commands')}</Label>
									<Textarea
										id="level-commands"
										onChange={(e) => update({ commands: linesToArray(e.target.value) })}
										placeholder="git init\n  git commit"
										rows={3}
										value={form.commands.join('\n')}
									/>
								</div>
								<div className="space-y-1">
									<Label htmlFor="level-hints">{t('editor.hints')}</Label>
									<Textarea
										id="level-hints"
										onChange={(e) => update({ hints: linesToArray(e.target.value) })}
										placeholder="hint one\n  hint two"
										rows={3}
										value={form.hints.join('\n')}
									/>
								</div>
							</div>

							<div className="space-y-1">
								<Label htmlFor="level-author">{t('editor.author')}</Label>
								<Input
									id="level-author"
									onChange={(e) => update({ author: e.target.value })}
									value={form.author ?? ''}
								/>
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label>{t('editor.rules')}</Label>
									<Button onClick={addRule} size="sm" variant="outline">
										{t('editor.addRule')}
									</Button>
								</div>
								<p className="text-muted-foreground text-xs">{t('editor.rulesHint')}</p>
								{form.validationRules.map((rule, index) => (
									<div className="flex items-center gap-2" key={index}>
										<Select
											onValueChange={(v) => onRuleTypeChange(index, v as LeafRuleType)}
											value={rule.type}
										>
											<SelectTrigger className="w-44">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{LEAF_RULE_TYPES.map((type) => (
													<SelectItem key={type} value={type}>
														{type}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{rule.type === 'minCommits' && (
											<Input
												className="w-24"
												onChange={(e) => updateRule(index, { value: Number(e.target.value) })}
												type="number"
												value={ruleValue(rule)}
											/>
										)}
										{(rule.type === 'commandRun' ||
											rule.type === 'branchExists' ||
											rule.type === 'tagExists' ||
											rule.type === 'fileModified') && (
											<Input
												className="flex-1"
												onChange={(e) => updateRule(index, { value: e.target.value })}
												placeholder={t('editor.value')}
												value={ruleValue(rule)}
											/>
										)}
										{rule.type === 'branchAheadOf' && (
											<>
												<Input
													className="w-32"
													onChange={(e) =>
														updateRule(index, { branch: e.target.value } as Partial<ValidationRule>)
													}
													placeholder="branch"
													value={ruleExtra(rule).branch ?? ''}
												/>
												<Input
													className="w-32"
													onChange={(e) =>
														updateRule(index, { of: e.target.value } as Partial<ValidationRule>)
													}
													placeholder="of"
													value={ruleExtra(rule).of ?? ''}
												/>
											</>
										)}
										{rule.type === 'headEquals' && (
											<>
												<Input
													className="w-32"
													onChange={(e) =>
														updateRule(index, { branch: e.target.value } as Partial<ValidationRule>)
													}
													placeholder="branch"
													value={ruleExtra(rule).branch ?? ''}
												/>
												<Input
													className="w-32"
													onChange={(e) =>
														updateRule(index, { equals: e.target.value } as Partial<ValidationRule>)
													}
													placeholder="equals"
													value={ruleExtra(rule).equals ?? ''}
												/>
											</>
										)}
										<Button onClick={() => removeRule(index)} size="sm" variant="ghost">
											✕
										</Button>
									</div>
								))}
								{form.validationRules.length === 0 && (
									<p className="text-muted-foreground text-sm">{t('editor.noRules')}</p>
								)}
							</div>
						</TabsContent>

						<TabsContent className="space-y-2" value="json">
							<Textarea onChange={(e) => setJsonText(e.target.value)} rows={16} value={jsonText} />
							{jsonError && <p className="text-destructive text-sm">{jsonError}</p>}
							<Button onClick={applyJson} variant="outline">
								{t('editor.applyJson')}
							</Button>
						</TabsContent>
					</Tabs>

					<div className="mt-6 flex flex-wrap gap-2">
						<Button onClick={handleSaveDraft}>{t('editor.saveDraft')}</Button>
						<Button onClick={handleExport} variant="outline">
							{t('editor.export')}
						</Button>
						<Button onClick={handleShare} variant="outline">
							{t('editor.share')}
						</Button>
						<Button onClick={handleClear} variant="ghost">
							{t('editor.clear')}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default EditorPage
