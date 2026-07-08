import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabaseClient'
import type { AuthProvider, Tier, UserProfile } from '@/types/account'

interface AccountState {
	isAuthed: boolean
	profile: UserProfile | null
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

/**
 * M3 — Account store (local-first).
 *
 * In local mode (no Supabase env) sign-in just persists a profile so the
 * freemium UI / feature flags are fully exercisable. When `VITE_SUPABASE_*`
 * are set, provider sign-in delegates to Supabase OAuth and the real session
 * drives `profile`.
 */
export const useAccountStore = create<AccountState>()(
	persist(
		(set, get) => ({
			isAuthed: false,
			profile: null,
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
				set({ isAuthed: false, profile: null })
			},
		}),
		{
			name: 'gitmaster-account',
			partialize: (state) => ({ isAuthed: state.isAuthed, profile: state.profile }),
		}
	)
)
