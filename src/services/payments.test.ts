import { describe, expect, it } from 'vitest'
import {
	getPaymentProvider,
	isPaymentsConfigured,
	PAYMENT_KEYS_PENDING,
	PAYMENT_PROVIDERS,
} from '@/services/payments'
import type { PaymentProviderKind, Tier } from '@/types/account'

describe('payments skeleton', () => {
	const kinds: PaymentProviderKind[] = ['stripe', 'wechat', 'alipay']

	it('provides a provider for every kind', () => {
		for (const kind of kinds) {
			expect(PAYMENT_PROVIDERS[kind].kind).toBe(kind)
		}
	})

	it('getPaymentProvider defaults to stripe', () => {
		expect(getPaymentProvider().kind).toBe('stripe')
		expect(getPaymentProvider('wechat').kind).toBe('wechat')
	})

	it('is not configured in skeleton mode (no env keys)', () => {
		expect(isPaymentsConfigured()).toBe(false)
		for (const kind of kinds) {
			expect(PAYMENT_PROVIDERS[kind].isConfigured()).toBe(false)
		}
	})

	it('createCheckout returns PAYMENT_KEYS_PENDING when keys are absent', async () => {
		const tiers: Tier[] = ['free', 'pro', 'team']
		const results = await Promise.all(
			kinds.flatMap((kind) => tiers.map((tier) => PAYMENT_PROVIDERS[kind].createCheckout(tier)))
		)
		for (const result of results) {
			expect(result).toEqual({ ok: false, reason: PAYMENT_KEYS_PENDING })
		}
	})

	it('getPortalUrl returns null when not configured', async () => {
		const urls = await Promise.all(kinds.map((kind) => PAYMENT_PROVIDERS[kind].getPortalUrl()))
		for (const url of urls) {
			expect(url).toBeNull()
		}
	})
})
