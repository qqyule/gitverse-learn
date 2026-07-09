import { describe, expect, it } from 'vitest'
import {
	EMPTY_USAGE,
	getQuota,
	isWithinQuota,
	QUOTA_BY_TIER,
	QUOTA_KEYS,
	quotaStatus,
} from '@/lib/quota'
import type { QuotaUsage, Tier } from '@/types/account'

describe('quota model', () => {
	it('defines a quota for every tier', () => {
		const tiers: Tier[] = ['free', 'pro', 'team']
		for (const tier of tiers) {
			expect(QUOTA_BY_TIER[tier]).toBeDefined()
		}
	})

	it('exposes every quota key in status', () => {
		const status = quotaStatus(EMPTY_USAGE, 'free')
		expect(Object.keys(status).sort()).toEqual([...QUOTA_KEYS].sort())
	})

	it('free tier is the most constrained', () => {
		expect(getQuota('free').drafts).toBeLessThan(getQuota('pro').drafts)
		expect(getQuota('pro').drafts).toBeLessThan(getQuota('team').drafts)
		expect(getQuota('free').aiTutorPerDay).toBeLessThan(getQuota('team').aiTutorPerDay)
	})

	it('reports remaining = limit - used', () => {
		const usage: QuotaUsage = { aiTutorPerDay: 2, cloudDevices: 0, drafts: 1, sharedLevels: 0 }
		const status = quotaStatus(usage, 'free')
		expect(status.drafts.remaining).toBe(getQuota('free').drafts - 1)
		expect(status.aiTutorPerDay.remaining).toBe(getQuota('free').aiTutorPerDay - 2)
	})

	it('flags exceeded only at/above the limit', () => {
		const limit = getQuota('free').drafts
		const under: QuotaUsage = { ...EMPTY_USAGE, drafts: limit - 1 }
		const at: QuotaUsage = { ...EMPTY_USAGE, drafts: limit }
		const over: QuotaUsage = { ...EMPTY_USAGE, drafts: limit + 1 }

		expect(quotaStatus(under, 'free').drafts.exceeded).toBe(false)
		expect(quotaStatus(at, 'free').drafts.exceeded).toBe(true)
		expect(quotaStatus(over, 'free').drafts.exceeded).toBe(true)
		expect(isWithinQuota(under, 'free', 'drafts')).toBe(true)
		expect(isWithinQuota(at, 'free', 'drafts')).toBe(false)
	})

	it('floors remaining at zero', () => {
		const over: QuotaUsage = { ...EMPTY_USAGE, drafts: 999 }
		expect(quotaStatus(over, 'free').drafts.remaining).toBe(0)
	})
})
