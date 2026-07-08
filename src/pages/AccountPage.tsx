import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { TIER_LABEL } from '@/lib/features'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import { pullProgress, pushProgress } from '@/services/progressSync'
import { useAccountStore } from '@/store/accountStore'

const AccountPage = () => {
	const { t } = useTranslation()
	const { isAuthed, profile, signInWithEmail, signInWithProvider, signOut } = useAccountStore()
	const [email, setEmail] = useState('')

	const handleEmail = async () => {
		if (!email.trim()) return
		await signInWithEmail(email.trim())
		await pullProgress()
	}

	const handleProvider = async (provider: 'github' | 'google') => {
		await signInWithProvider(provider)
		if (isSupabaseConfigured) await pullProgress()
	}

	const handleSignOut = async () => {
		await pushProgress()
		await signOut()
	}

	return (
		<div className="container mx-auto max-w-md py-12">
			<Card>
				<CardHeader>
					<CardTitle>{t('account.title')}</CardTitle>
					<CardDescription>{t('account.description')}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{isAuthed ? (
						<>
							<div className="flex items-center justify-between">
								<span className="font-medium">{profile?.email ?? profile?.displayName}</span>
								<Badge>{TIER_LABEL[profile?.tier ?? 'free']}</Badge>
							</div>
							<p className="text-muted-foreground text-sm">
								{isSupabaseConfigured ? t('account.cloudReady') : t('account.localMode')}
							</p>
							<Button className="w-full" onClick={handleSignOut} variant="outline">
								{t('account.signOut')}
							</Button>
						</>
					) : (
						<>
							<Input
								onChange={(e) => setEmail(e.target.value)}
								placeholder={t('account.email')}
								type="email"
								value={email}
							/>
							<Button className="w-full" onClick={handleEmail}>
								{t('account.signIn')}
							</Button>
							<Button className="w-full" onClick={() => handleProvider('github')} variant="outline">
								{t('account.signInWithGithub')}
							</Button>
							<Button className="w-full" onClick={() => handleProvider('google')} variant="outline">
								{t('account.signInWithGoogle')}
							</Button>
							{!isSupabaseConfigured && (
								<p className="text-muted-foreground text-sm">{t('account.localMode')}</p>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</div>
	)
}

export default AccountPage
