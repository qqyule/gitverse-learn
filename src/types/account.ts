/**
 * M3 — Account & subscription domain types.
 *
 * These are provider-agnostic so the same UI / store code works whether the
 * backend is Supabase (chosen for M3) or a future alternative. Cloud sync is
 * inert until `VITE_SUPABASE_*` env vars are provided (see lib/supabaseClient.ts).
 */

export type Tier = 'free' | 'pro' | 'team'

export type AuthProvider = 'local' | 'email' | 'github' | 'google'

export interface UserProfile {
	avatarUrl: string | null
	/** ISO timestamp of account creation. */
	createdAt: string
	displayName: string | null
	email: string | null
	id: string
	provider: AuthProvider
	tier: Tier
}

export interface Subscription {
	/** ISO timestamp of next renewal, or null when not subscribed. */
	renewsAt: string | null
	status: 'active' | 'canceled' | 'none'
	tier: Tier
}
