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

/**
 * M5 — Payment provider kinds. The UI/service layer is provider-agnostic;
 * real charges only happen once the matching env keys are configured
 * (see services/payments.ts). Until then everything degrades to local demo.
 */
export type PaymentProviderKind = 'stripe' | 'wechat' | 'alipay'

/**
 * M5 — Numeric usage limits per `Tier`. These complement the boolean feature
 * flags in lib/features.ts: flags answer "is this capability available?",
 * quotas answer "how much of it can a tier use?".
 */
export interface Quota {
	/** Max AI tutor prompts per calendar day. */
	aiTutorPerDay: number
	/** Max devices that can hold synced cloud progress. */
	cloudDevices: number
	/** Max saved UGC level drafts. */
	drafts: number
	/** Max published / shared community levels. */
	sharedLevels: number
}

export type QuotaKey = keyof Quota

/** Live counters consumed against a `Quota`. */
export interface QuotaUsage {
	aiTutorPerDay: number
	cloudDevices: number
	drafts: number
	sharedLevels: number
}

export interface CheckoutSession {
	provider: PaymentProviderKind
	tier: Tier
	/** Where the browser should redirect to complete payment. */
	url: string
}

/**
 * Result of initiating a checkout. `PAYMENT_KEYS_PENDING` is the expected
 * outcome in skeleton mode (no provider keys) — the UI then offers a local
 * demo upgrade instead of a real charge.
 */
export type CheckoutResult =
	| { ok: true; session: CheckoutSession }
	| { ok: false; reason: 'PAYMENT_KEYS_PENDING' | 'UNSUPPORTED_TIER' }
