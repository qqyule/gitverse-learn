/**
 * M3 — Feature flags / freemium gating.
 *
 * Single source of truth for which capabilities a given subscription `Tier`
 * unlocks. UI and services call `isFeatureEnabled` rather than checking the
 * tier directly, so pricing changes only touch this map.
 */

import type { Tier } from '@/types/account'

export type Feature =
	| 'apiAccess'
	| 'aiTutor'
	| 'cloudSync'
	| 'leaderboard'
	| 'masterLevels'
	| 'teamSeats'
	| 'ugcEditor'
	| 'unlimitedSync'

const TIER_FEATURES: Record<Tier, Feature[]> = {
	free: ['cloudSync', 'leaderboard', 'ugcEditor'],
	pro: ['cloudSync', 'unlimitedSync', 'aiTutor', 'masterLevels', 'leaderboard', 'ugcEditor'],
	team: [
		'cloudSync',
		'unlimitedSync',
		'aiTutor',
		'masterLevels',
		'leaderboard',
		'ugcEditor',
		'apiAccess',
		'teamSeats',
	],
}

export const isFeatureEnabled = (feature: Feature, tier: Tier): boolean =>
	TIER_FEATURES[tier].includes(feature)

export const TIER_LABEL: Record<Tier, string> = {
	free: 'Free',
	pro: 'Pro',
	team: 'Team',
}
