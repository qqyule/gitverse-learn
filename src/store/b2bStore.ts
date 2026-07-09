/**
 * M6 — B2B education edition store (local mock + multi-tenant skeleton).
 *
 * Persists classrooms / assignments / student progress to localStorage so the
 * education UI is fully exercisable without a backend. Every entity is scoped
 * by `orgId`, modelling the multi-tenant isolation a future server would
 * enforce. When `VITE_API_BASE_URL` is configured, `services/b2b.ts` would
 * mirror these mutations to the server; here we keep them local only.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isApiConfigured } from '@/lib/apiClient'
import type { B2BAssignment, B2BClassroom, B2BOrg, B2BStudentProgress } from '@/types/api'

const STORAGE_KEY = 'gitmaster-b2b' as const

export interface B2BState {
	addAssignment: (input: Omit<B2BAssignment, 'createdAt' | 'id'>) => B2BAssignment
	addClassroom: (input: Omit<B2BClassroom, 'createdAt' | 'id'>) => B2BClassroom
	addOrg: (input: Omit<B2BOrg, 'createdAt' | 'id'>) => B2BOrg
	assignments: B2BAssignment[]
	classrooms: B2BClassroom[]
	/** Currently active tenant. "personal" means no org selected. */
	currentOrgId: string
	/** Whether the platform is running in multi-tenant mode (API configured). */
	isMultiTenant: () => boolean
	orgs: B2BOrg[]
	progress: B2BStudentProgress[]
	removeAssignment: (id: string) => void
	removeClassroom: (id: string) => void
	setCurrentOrg: (orgId: string) => void
	/** Upsert a student's progress for an assignment (keeps the latest). */
	setStudentProgress: (input: Omit<B2BStudentProgress, 'updatedAt'>) => void
}

const uid = (prefix: string): string => `${prefix}_${Math.random().toString(36).slice(2, 10)}`

export const useB2BStore = create<B2BState>()(
	persist(
		(set) => ({
			addAssignment: (input) => {
				const assignment: B2BAssignment = {
					...input,
					createdAt: new Date().toISOString(),
					id: uid('asn'),
				}
				set((s) => ({ assignments: [...s.assignments, assignment] }))
				return assignment
			},

			addClassroom: (input) => {
				const classroom: B2BClassroom = {
					...input,
					createdAt: new Date().toISOString(),
					id: uid('cls'),
				}
				set((s) => ({ classrooms: [...s.classrooms, classroom] }))
				return classroom
			},

			addOrg: (input) => {
				const org: B2BOrg = {
					...input,
					createdAt: new Date().toISOString(),
					id: uid('org'),
				}
				set((s) => ({ orgs: [...s.orgs, org] }))
				return org
			},
			assignments: [],
			classrooms: [],
			currentOrgId: 'personal',

			isMultiTenant: () => isApiConfigured(),
			orgs: [],
			progress: [],

			removeAssignment: (id) =>
				set((s) => ({ assignments: s.assignments.filter((a) => a.id !== id) })),

			removeClassroom: (id) =>
				set((s) => ({ classrooms: s.classrooms.filter((c) => c.id !== id) })),

			setCurrentOrg: (orgId) => set({ currentOrgId: orgId }),

			setStudentProgress: (input) =>
				set((s) => {
					const updatedAt = new Date().toISOString()
					const existing = s.progress.find(
						(p) => p.assignmentId === input.assignmentId && p.studentId === input.studentId
					)
					if (existing) {
						return {
							progress: s.progress.map((p) => (p === existing ? { ...p, ...input, updatedAt } : p)),
						}
					}
					return { progress: [...s.progress, { ...input, updatedAt }] }
				}),
		}),
		{ name: STORAGE_KEY }
	)
)

/** Selector: classrooms scoped to the active tenant. */
export const selectOrgClassrooms = (s: B2BState): B2BClassroom[] =>
	s.classrooms.filter((c) => c.orgId === s.currentOrgId)

/** Selector: assignments scoped to the active tenant. */
export const selectOrgAssignments = (s: B2BState): B2BAssignment[] =>
	s.assignments.filter((a) => a.orgId === s.currentOrgId)
