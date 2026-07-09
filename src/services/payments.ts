/**
 * M5 — Payment provider abstraction (SKELETON).
 *
 * This module defines a provider-agnostic contract for initiating paid
 * upgrades. In skeleton mode (the default) none of the providers have their
 * env keys configured, so every `createCheckout` returns
 * `{ ok: false, reason: 'PAYMENT_KEYS_PENDING' }`. The UI then offers a local
 * demo upgrade (see store/accountStore.ts `applyDemoUpgrade`) so the freemium
 * flow is fully exercisable without real money movement.
 *
 * To go live later: set the matching `VITE_*` keys, implement `createCheckout`
 * to call your backend (which talks to Stripe/WeChat/Alipay), and redirect to
 * the returned `session.url`. Charges stay OFF until that backend exists.
 *
 * Mirrors the graceful-degradation pattern of lib/supabaseClient.ts.
 */

import type { CheckoutResult, PaymentProviderKind, Tier } from '@/types/account'

export type PaymentProvider = {
	readonly kind: PaymentProviderKind
	/** True only when the provider's required env keys are present. */
	isConfigured: () => boolean
	/** Begin a checkout for `tier`. Returns PAYMENT_KEYS_PENDING in skeleton mode. */
	createCheckout: (tier: Tier) => Promise<CheckoutResult>
	/** Billing-management portal URL, or null when unavailable. */
	getPortalUrl: () => Promise<string | null>
}

const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined
const WECHAT_MCH_ID = import.meta.env.VITE_WECHAT_MCH_ID as string | undefined
const ALIPAY_APP_ID = import.meta.env.VITE_ALIPAY_APP_ID as string | undefined

export const PAYMENT_KEYS_PENDING = 'PAYMENT_KEYS_PENDING' as const

const pending = (): CheckoutResult => ({ ok: false, reason: PAYMENT_KEYS_PENDING })

export class StripePaymentProvider implements PaymentProvider {
	readonly kind = 'stripe' as const

	isConfigured = (): boolean => Boolean(STRIPE_KEY)

	// SKELETON: a real build would call the backend to create a Stripe Checkout
	// Session and return its URL. Intentionally returns PENDING until keys +
	// backend exist.
	createCheckout = (_tier: Tier): Promise<CheckoutResult> => Promise.resolve(pending())

	getPortalUrl = (): Promise<string | null> => Promise.resolve(null)
}

export class WechatPaymentProvider implements PaymentProvider {
	readonly kind = 'wechat' as const

	isConfigured = (): boolean => Boolean(WECHAT_MCH_ID)

	createCheckout = (_tier: Tier): Promise<CheckoutResult> => Promise.resolve(pending())

	getPortalUrl = (): Promise<string | null> => Promise.resolve(null)
}

export class AlipayPaymentProvider implements PaymentProvider {
	readonly kind = 'alipay' as const

	isConfigured = (): boolean => Boolean(ALIPAY_APP_ID)

	createCheckout = (_tier: Tier): Promise<CheckoutResult> => Promise.resolve(pending())

	getPortalUrl = (): Promise<string | null> => Promise.resolve(null)
}

export const PAYMENT_PROVIDERS: Record<PaymentProviderKind, PaymentProvider> = {
	alipay: new AlipayPaymentProvider(),
	stripe: new StripePaymentProvider(),
	wechat: new WechatPaymentProvider(),
}

const DEFAULT_PROVIDER: PaymentProviderKind = 'stripe'

export const getPaymentProvider = (kind: PaymentProviderKind = DEFAULT_PROVIDER): PaymentProvider =>
	PAYMENT_PROVIDERS[kind]

/** Convenience: is *any* payment provider configured? (false in skeleton mode) */
export const isPaymentsConfigured = (): boolean =>
	Object.values(PAYMENT_PROVIDERS).some((p) => p.isConfigured())
