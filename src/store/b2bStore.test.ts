import { beforeEach, describe, expect, it } from 'vitest'
import { selectOrgAssignments, selectOrgClassrooms, useB2BStore } from '@/store/b2bStore'

const reset = () =>
	useB2BStore.setState({
		assignments: [],
		classrooms: [],
		currentOrgId: 'personal',
		orgs: [],
		progress: [],
	})

describe('b2bStore (multi-tenant skeleton)', () => {
	beforeEach(reset)

	it('creates an org and scopes it by id', () => {
		const org = useB2BStore.getState().addOrg({ name: 'Acme', slug: 'acme' })
		expect(useB2BStore.getState().orgs).toContain(org)
		expect(org.id).toMatch(/^org_/)
	})

	it('adds classrooms and assignments scoped to the current org', () => {
		const org = useB2BStore.getState().addOrg({ name: 'Acme', slug: 'acme' })
		useB2BStore.getState().setCurrentOrg(org.id)
		const cls = useB2BStore.getState().addClassroom({ name: 'S1', orgId: org.id, studentIds: [] })
		useB2BStore.getState().addAssignment({
			classroomId: cls.id,
			dueAt: null,
			lessonId: 'level-1',
			orgId: org.id,
			title: 'HW',
		})

		const state = useB2BStore.getState()
		expect(selectOrgClassrooms(state)).toHaveLength(1)
		expect(selectOrgAssignments(state)).toHaveLength(1)
	})

	it('isMultiTenant reflects API configuration (false in skeleton mode)', () => {
		expect(useB2BStore.getState().isMultiTenant()).toBe(false)
	})

	it('upserts student progress, keeping only the latest per student', () => {
		const org = useB2BStore.getState().addOrg({ name: 'Acme', slug: 'acme' })
		const cls = useB2BStore.getState().addClassroom({ name: 'S1', orgId: org.id, studentIds: [] })
		const asn = useB2BStore.getState().addAssignment({
			classroomId: cls.id,
			dueAt: null,
			lessonId: 'level-1',
			orgId: org.id,
			title: 'HW',
		})

		useB2BStore.getState().setStudentProgress({
			assignmentId: asn.id,
			completion: 0.5,
			orgId: org.id,
			passed: false,
			studentId: 'u1',
		})
		useB2BStore.getState().setStudentProgress({
			assignmentId: asn.id,
			completion: 1,
			orgId: org.id,
			passed: true,
			studentId: 'u1',
		})

		const progress = useB2BStore.getState().progress
		expect(progress).toHaveLength(1)
		expect(progress[0].completion).toBe(1)
		expect(progress[0].passed).toBe(true)
	})
})
