import { describe, expect, it } from 'vitest'
import { API_NOT_CONFIGURED, isApiConfigured } from '@/lib/apiClient'

describe('apiClient skeleton', () => {
	it('is not configured in skeleton mode (no VITE_API_BASE_URL)', () => {
		expect(isApiConfigured()).toBe(false)
	})

	it('listApiKeys short-circuits to API_NOT_CONFIGURED when unconfigured', async () => {
		const result = await import('@/lib/apiClient').then((m) => m.apiClient.listApiKeys())
		expect(result).toEqual({ ok: false, reason: API_NOT_CONFIGURED })
	})

	it('createApiKey short-circuits to API_NOT_CONFIGURED when unconfigured', async () => {
		const result = await import('@/lib/apiClient').then((m) =>
			m.apiClient.createApiKey('test', ['read:lessons'])
		)
		expect(result).toEqual({ ok: false, reason: API_NOT_CONFIGURED })
	})

	it('revokeApiKey short-circuits to API_NOT_CONFIGURED when unconfigured', async () => {
		const result = await import('@/lib/apiClient').then((m) =>
			m.apiClient.revokeApiKey('gm_live_xxxx')
		)
		expect(result).toEqual({ ok: false, reason: API_NOT_CONFIGURED })
	})
})
