/**
 * M6 — Platform API client (SKELETON).
 *
 * Thin wrapper over `VITE_API_BASE_URL`. In skeleton mode (default, no base
 * URL) every method returns `{ ok: false, reason: 'API_NOT_CONFIGURED' }` so
 * the calling UI can fall back to local mock stores. Mirrors the
 * graceful-degradation pattern already established by lib/supabaseClient.ts
 * (M3) and services/payments.ts (M5).
 *
 * To go live later: set `VITE_API_BASE_URL`, implement the fetch bodies
 * (auth via the API key header), and have the B2B / SDK stores call these
 * methods instead of their local mocks.
 */

import type { ApiKey, ApiScope } from '@/types/api'

export const API_NOT_CONFIGURED = 'API_NOT_CONFIGURED' as const

export type ApiResult<T> =
	| { ok: true; data: T }
	| { ok: false; reason: typeof API_NOT_CONFIGURED | 'NETWORK_ERROR' }

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined

/** True only when a platform API base URL is configured. */
export const isApiConfigured = (): boolean => Boolean(API_BASE_URL)

const baseHeaders = (): Record<string, string> => ({
	'Content-Type': 'application/json',
})

/**
 * Issue an authenticated request. Short-circuits to API_NOT_CONFIGURED when
 * the client is unconfigured, and to NETWORK_ERROR on failure — never throws.
 */
const request = async <T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> => {
	if (!API_BASE_URL) return { ok: false, reason: API_NOT_CONFIGURED }
	try {
		const res = await fetch(`${API_BASE_URL}${path}`, {
			...init,
			headers: { ...baseHeaders(), ...(init.headers ?? {}) },
		})
		if (!res.ok) return { ok: false, reason: 'NETWORK_ERROR' }
		const data = (await res.json()) as T
		return { data, ok: true }
	} catch {
		return { ok: false, reason: 'NETWORK_ERROR' }
	}
}

export const apiClient = {
	createApiKey(label: string, scopes: ApiScope[], orgId = 'personal'): Promise<ApiResult<ApiKey>> {
		return request<ApiKey>('/api-keys', {
			body: JSON.stringify({ label, orgId, scopes }),
			method: 'POST',
		})
	},

	listApiKeys(orgId = 'personal'): Promise<ApiResult<ApiKey[]>> {
		return request<ApiKey[]>(`/api-keys?orgId=${encodeURIComponent(orgId)}`)
	},

	revokeApiKey(display: string): Promise<ApiResult<{ revoked: true }>> {
		return request<{ revoked: true }>(`/api-keys/${encodeURIComponent(display)}`, {
			method: 'DELETE',
		})
	},
}
