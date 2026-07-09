/**
 * M5 — Quota model (pure, framework-free).
 *
 * Numeric usage limits per `Tier`, computed against live `QuotaUsage`.
 * Mirrors the philosophy of lib/features.ts (single source of truth for
 * gating) but for metered resources rather than boolean capabilities.
 */

import type { Quota, QuotaKey, QuotaUsage, Tier } from '@/types/account'

export const QUOTA_BY_TIER: Record<Tier, Quota> = {
	free: { aiTutorPerDay: 5, cloudDevices: 1, drafts: 3, sharedLevels: 5 },
	pro: { aiTutorPerDay: 100, cloudDevices: 5, drafts: 50, sharedLevels: 200 },
	team: { aiTutorPerDay: 1000, cloudDevices: 50, drafts: 1000, sharedLevels: 5000 },
}

export const QUOTA_KEYS: QuotaKey[] = ['drafts', 'aiTutorPerDay', 'cloudDevices', 'sharedLevels']

export const getQuota = (tier: Tier): Quota => QUOTA_BY_TIER[tier]

export interface QuotaResourceStatus {
	/** True once used >= limit. */
	exceeded: boolean
	key: QuotaKey
	/** Configured ceiling for the current tier. */
	limit: number
	/** limit - used, floored at 0. */
	remaining: number
	/** Consumed amount for this resource. */
	used: number
}

export type QuotaStatusMap = Record<QuotaKey, QuotaResourceStatus>

const statusFor = (key: QuotaKey, usage: QuotaUsage, quota: Quota): QuotaResourceStatus => {
	const used = usage[key]
	const limit = quota[key]
	const remaining = limit - used
	return {
		exceeded: used >= limit,
		key,
		limit,
		remaining: remaining > 0 ? remaining : 0,
		used,
	}
}

/** Per-resource status for every quota key at the given tier. */
export const quotaStatus = (usage: QuotaUsage, tier: Tier): QuotaStatusMap => {
	const quota = getQuota(tier)
	const map = {} as QuotaStatusMap
	for (const key of QUOTA_KEYS) {
		map[key] = statusFor(key, usage, quota)
	}
	return map
}

/** True when `usage` has not yet hit the ceiling for `key` at `tier`. */
export const isWithinQuota = (usage: QuotaUsage, tier: Tier, key: QuotaKey): boolean =>
	!quotaStatus(usage, tier)[key].exceeded

export const EMPTY_USAGE: QuotaUsage = {
	aiTutorPerDay: 0,
	cloudDevices: 0,
	drafts: 0,
	sharedLevels: 0,
}
