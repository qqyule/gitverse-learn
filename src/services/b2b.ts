/**
 * M6 — B2B education service layer (SKELETON).
 *
 * Mirror of store/b2bStore.ts that a live backend would fulfil. Today every
 * method short-circuits to `B2B_NOT_CONFIGURED` when `VITE_API_BASE_URL` is
 * absent, signalling the UI to rely on the local mock store. Mirrors the
 * degradation pattern of lib/apiClient.ts and services/payments.ts.
 */

import { type API_NOT_CONFIGURED, isApiConfigured } from '@/lib/apiClient'
import type { B2BAssignment, B2BClassroom, B2BOrg } from '@/types/api'

export const B2B_NOT_CONFIGURED = 'B2B_NOT_CONFIGURED' as const

export type B2BResult<T> =
	| { ok: true; data: T }
	| { ok: false; reason: typeof B2B_NOT_CONFIGURED | typeof API_NOT_CONFIGURED }

const notConfigured = <T>(): B2BResult<T> => ({ ok: false, reason: B2B_NOT_CONFIGURED })

export const b2bService = {
	assignLesson(_input: Omit<B2BAssignment, 'createdAt' | 'id'>): B2BResult<B2BAssignment> {
		if (!isApiConfigured()) return notConfigured<B2BAssignment>()
		// SKELETON: POST /assignments with the assignment payload.
		return notConfigured<B2BAssignment>()
	},
	createOrg(_input: Omit<B2BOrg, 'createdAt' | 'id'>): B2BResult<B2BOrg> {
		if (!isApiConfigured()) return notConfigured<B2BOrg>()
		// SKELETON: POST /orgs with the tenant payload.
		return notConfigured<B2BOrg>()
	},

	joinClassroom(_code: string): B2BResult<B2BClassroom> {
		if (!isApiConfigured()) return notConfigured<B2BClassroom>()
		// SKELETON: POST /classrooms/join { code }.
		return notConfigured<B2BClassroom>()
	},
}
