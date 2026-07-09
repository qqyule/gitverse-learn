import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getQuota } from '@/lib/quota'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'
import { getPaymentProvider } from '@/services/payments'
import type { AuthProvider, CheckoutResult, Tier, UserProfile } from '@/types/account'

interface AccountState {
	aiTutorDate: string
	aiTutorUsedToday: number
	beginCheckout: (tier: Tier) => Promise<CheckoutResult>
	downgradeToFree: () => void
	isAuthed: boolean
	profile: UserProfile | null
	recordAiTutorUse: () => boolean
	setTier: (tier: Tier) => void
	signInWithEmail: (email: string) => Promise<void>
	signInWithProvider: (provider: 'github' | 'google') => Promise<void>
	signOut: () => Promise<void>
}

const makeLocalProfile = (email: string, provider: AuthProvider): UserProfile => ({
	avatarUrl: null,
	createdAt: new Date().toISOString(),
	displayName: email.split('@')[0] || 'Learner',
	email,
	id: `local_${email}`,
	provider,
	tier: 'free',
})

const todayKey = (): string => new Date().toISOString().slice(0, 10)

/**
 * M3/M5 — Account store (local-first) with M5 quota + upgrade skeleton.
 *
 * In local mode (no Supabase env / no payment keys) sign-in just persists a
 * profile, and `beginCheckout` returns PAYMENT_KEYS_PENDING so the UI can hand
 * back a local demo upgrade. When `VITE_SUPABASE_*` are set, provider sign-in
 * delegates to Supabase OAuth. Real charges only happen once a payment backend
 * exists (see services/payments.ts).
 */
export const useAccountStore = create<AccountState>()(
	persist(
		(set, get) => ({
			aiTutorDate: todayKey(),
			aiTutorUsedToday: 0,
			beginCheckout: (tier) => getPaymentProvider('stripe').createCheckout(tier),
			downgradeToFree: () => get().setTier('free'),
			isAuthed: false,
			profile: null,
			recordAiTutorUse: () => {
				const { profile, aiTutorDate, aiTutorUsedToday } = get()
				if (!profile) return false
				const quota = getQuota(profile.tier).aiTutorPerDay
				const date = todayKey()
				// New calendar day → reset the daily counter.
				if (aiTutorDate !== date) {
					set({ aiTutorDate: date, aiTutorUsedToday: 1 })
					return true
				}
				if (aiTutorUsedToday >= quota) return false
				set({ aiTutorUsedToday: aiTutorUsedToday + 1 })
				return true
			},
			setTier: (tier) => {
				const profile = get().profile
				if (profile) set({ profile: { ...profile, tier } })
			},
			signInWithEmail: (email) => {
				set({ isAuthed: true, profile: makeLocalProfile(email, 'email') })
				return Promise.resolve()
			},
			signInWithProvider: async (provider) => {
				if (isSupabaseConfigured) {
					const sb = await getSupabaseClient()
					if (sb) {
						await sb.auth.signInWithOAuth({ provider, redirectTo: window.location.origin })
						return
					}
				}
				// Local fallback so the flow is demonstrable without a backend.
				set({ isAuthed: true, profile: makeLocalProfile(`you@${provider}.dev`, provider) })
			},
			signOut: async () => {
				if (isSupabaseConfigured) {
					const sb = await getSupabaseClient()
					if (sb) await sb.auth.signOut()
				}
				set({ aiTutorDate: todayKey(), aiTutorUsedToday: 0, isAuthed: false, profile: null })
			},
		}),
		{
			name: 'gitmaster-account',
			partialize: (state) => ({
				aiTutorDate: state.aiTutorDate,
				aiTutorUsedToday: state.aiTutorUsedToday,
				isAuthed: state.isAuthed,
				profile: state.profile,
			}),
		}
	)
)
