import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface UpgradePromptProps {
	description: string
	/** Override the default action (navigate to /pricing). */
	onUpgrade?: () => void
	title: string
}

/**
 * M5 — Reusable upgrade nudge. Shown when a free user hits a metered limit
 * (e.g. draft quota in the editor) or views a paywalled capability.
 */
const UpgradePrompt = ({ description, onUpgrade, title }: UpgradePromptProps) => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const handleUpgrade = onUpgrade ?? (() => navigate('/pricing'))

	return (
		<Card className="border-amber-500/50 bg-amber-500/5">
			<CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
				<div className="space-y-1">
					<p className="font-medium">{title}</p>
					<p className="text-muted-foreground text-sm">{description}</p>
				</div>
				<Button onClick={handleUpgrade}>{t('pricing.upgrade')}</Button>
			</CardContent>
		</Card>
	)
}

export default UpgradePrompt
