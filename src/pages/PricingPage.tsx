import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/sonner'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { isFeatureEnabled, TIER_LABEL } from '@/lib/features'
import { getQuota } from '@/lib/quota'
import { isPaymentsConfigured } from '@/services/payments'
import { useAccountStore } from '@/store/accountStore'
import type { Tier } from '@/types/account'

const TIERS: Tier[] = ['free', 'pro', 'team']
const PRICES: Record<Tier, string> = { free: '$0', pro: '$9', team: '$29' }

interface FeatureRow {
	get: (tier: Tier) => string | number
	key: string
}

const FEATURE_ROWS: FeatureRow[] = [
	{ get: (t) => (isFeatureEnabled('cloudSync', t) ? '✓' : '—'), key: 'cloudSync' },
	{ get: (t) => getQuota(t).aiTutorPerDay, key: 'aiTutor' },
	{ get: (t) => (isFeatureEnabled('masterLevels', t) ? '✓' : '—'), key: 'masterLevels' },
	{ get: (t) => (isFeatureEnabled('leaderboard', t) ? '✓' : '—'), key: 'leaderboard' },
	{ get: (t) => (isFeatureEnabled('ugcEditor', t) ? '✓' : '—'), key: 'ugcEditor' },
	{ get: (t) => (isFeatureEnabled('unlimitedSync', t) ? '✓' : '—'), key: 'unlimitedSync' },
	{ get: (t) => (isFeatureEnabled('apiAccess', t) ? '✓' : '—'), key: 'apiAccess' },
	{ get: (t) => (isFeatureEnabled('teamSeats', t) ? '✓' : '—'), key: 'teamSeats' },
	{ get: (t) => String(getQuota(t).drafts), key: 'drafts' },
	{ get: (t) => String(getQuota(t).sharedLevels), key: 'sharedLevels' },
]

/**
 * M5 — Pricing & plans (skeleton). Real checkout is deferred until payment
 * keys + a backend exist; in the meantime selecting a paid plan applies a
 * local demo upgrade so the freemium UX is fully exercisable.
 */
const PricingPage = () => {
	const { t } = useTranslation()
	const profile = useAccountStore((s) => s.profile)
	const beginCheckout = useAccountStore((s) => s.beginCheckout)
	const setTier = useAccountStore((s) => s.setTier)
	const downgradeToFree = useAccountStore((s) => s.downgradeToFree)
	const signInWithEmail = useAccountStore((s) => s.signInWithEmail)
	const currentTier = profile?.tier ?? 'free'

	const handleSelect = async (tier: Tier) => {
		if (tier === currentTier) return
		if (tier === 'free') {
			downgradeToFree()
			toast.success(t('pricing.demoDowngraded'))
			return
		}
		const result = await beginCheckout(tier)
		if (result.ok) {
			// SKELETON: a real build would redirect to the provider's checkout.
			window.location.href = result.session.url
			return
		}
		// PAYMENT_KEYS_PENDING → local demo upgrade (no real charge).
		if (!profile) await signInWithEmail('demo@gitmaster.app')
		setTier(tier)
		toast.success(t('pricing.demoUpgraded'))
	}

	return (
		<div className="container mx-auto max-w-4xl space-y-6 py-12">
			<div className="space-y-2 text-center">
				<h1 className="font-bold text-3xl">{t('pricing.title')}</h1>
				<p className="text-muted-foreground">{t('pricing.description')}</p>
			</div>

			{!isPaymentsConfigured() && (
				<p className="text-center text-amber-600 text-sm dark:text-amber-400">
					{t('pricing.demoMode')}
				</p>
			)}

			<div className="grid gap-4 md:grid-cols-3">
				{TIERS.map((tier) => {
					const isCurrent = tier === currentTier
					return (
						<Card className={isCurrent ? 'border-primary' : ''} key={tier}>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle>{TIER_LABEL[tier]}</CardTitle>
									{isCurrent && <Badge>{t('pricing.current')}</Badge>}
								</div>
								<CardDescription className="font-semibold text-2xl">
									{PRICES[tier]}
									<span className="font-normal text-muted-foreground text-sm">
										{t('pricing.perMonth')}
									</span>
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button
									className="w-full"
									disabled={isCurrent}
									onClick={() => handleSelect(tier)}
									variant={tier === 'free' ? 'outline' : 'default'}
								>
									{isCurrent
										? t('pricing.current')
										: tier === 'free'
											? t('pricing.downgrade')
											: t('pricing.upgrade')}
								</Button>
							</CardContent>
						</Card>
					)
				})}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{t('pricing.compareTitle')}</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t('pricing.feature')}</TableHead>
								{TIERS.map((tier) => (
									<TableHead className="text-center" key={tier}>
										{TIER_LABEL[tier]}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{FEATURE_ROWS.map((row) => (
								<TableRow key={row.key}>
									<TableCell>{t(`pricing.features.${row.key}`)}</TableCell>
									{TIERS.map((tier) => (
										<TableCell className="text-center" key={tier}>
											{row.key === 'aiTutor'
												? `${row.get(tier)} ${t('pricing.perDay')}`
												: row.get(tier)}
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}

export default PricingPage
