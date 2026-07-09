/**
 * M6 — B2B education edition (local mock). Manage classrooms, assignments and
 * view student progress — all persisted locally via store/b2bStore.ts and
 * scoped by the active tenant. A live backend (services/b2b.ts) takes over
 * once VITE_API_BASE_URL is configured.
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { levels } from '@/data/levels'
import { selectOrgAssignments, selectOrgClassrooms, useB2BStore } from '@/store/b2bStore'

const EducationPage = () => {
	const { t } = useTranslation()
	const orgId = useB2BStore((s) => s.currentOrgId)
	const orgs = useB2BStore((s) => s.orgs)
	const classrooms = useB2BStore(selectOrgClassrooms)
	const assignments = useB2BStore(selectOrgAssignments)
	const addOrg = useB2BStore((s) => s.addOrg)
	const addClassroom = useB2BStore((s) => s.addClassroom)
	const addAssignment = useB2BStore((s) => s.addAssignment)
	const setCurrentOrg = useB2BStore((s) => s.setCurrentOrg)
	const isMultiTenant = useB2BStore((s) => s.isMultiTenant)

	const [orgName, setOrgName] = useState('')
	const [classroomName, setClassroomName] = useState('')
	const [assignmentTitle, setAssignmentTitle] = useState('')
	const [assignmentLesson, setAssignmentLesson] = useState(levels[0]?.id ?? 'level-1')

	const handleAddOrg = () => {
		if (!orgName.trim()) return
		const slug = orgName.trim().toLowerCase().replace(/\s+/g, '-')
		const org = addOrg({ name: orgName.trim(), slug })
		setCurrentOrg(org.id)
		setOrgName('')
	}

	const handleAddClassroom = () => {
		if (!classroomName.trim()) return
		addClassroom({ name: classroomName.trim(), orgId, studentIds: [] })
		setClassroomName('')
	}

	const handleAddAssignment = () => {
		if (!assignmentTitle.trim()) return
		addAssignment({
			classroomId: classrooms[0]?.id ?? 'unassigned',
			dueAt: null,
			lessonId: assignmentLesson,
			orgId,
			title: assignmentTitle.trim(),
		})
		setAssignmentTitle('')
	}

	return (
		<div className="container mx-auto max-w-4xl space-y-6 py-12">
			<div className="space-y-2">
				<h1 className="font-bold text-3xl">{t('education.title')}</h1>
				<p className="text-muted-foreground">{t('education.description')}</p>
			</div>

			{isMultiTenant() && <Badge variant="outline">{t('education.multiTenantOn')}</Badge>}

			<Card>
				<CardHeader>
					<CardTitle>{t('education.orgTitle')}</CardTitle>
					<CardDescription>{t('education.orgDescription')}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-2">
						<Input
							onChange={(e) => setOrgName(e.target.value)}
							placeholder={t('education.orgNamePlaceholder')}
							value={orgName}
						/>
						<Button onClick={handleAddOrg}>{t('education.createOrg')}</Button>
					</div>
					{orgs.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{orgs.map((org) => (
								<Button
									key={org.id}
									onClick={() => setCurrentOrg(org.id)}
									variant={org.id === orgId ? 'default' : 'outline'}
								>
									{org.name}
								</Button>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t('education.classroomsTitle')}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-2">
						<Input
							onChange={(e) => setClassroomName(e.target.value)}
							placeholder={t('education.classroomPlaceholder')}
							value={classroomName}
						/>
						<Button onClick={handleAddClassroom}>{t('education.addClassroom')}</Button>
					</div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t('education.classroom')}</TableHead>
								<TableHead>{t('education.students')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{classrooms.length === 0 ? (
								<TableRow>
									<TableCell className="text-muted-foreground" colSpan={2}>
										{t('education.noClassrooms')}
									</TableCell>
								</TableRow>
							) : (
								classrooms.map((c) => (
									<TableRow key={c.id}>
										<TableCell>{c.name}</TableCell>
										<TableCell>{c.studentIds.length}</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t('education.assignmentsTitle')}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-2 md:grid-cols-3">
						<Input
							onChange={(e) => setAssignmentTitle(e.target.value)}
							placeholder={t('education.assignmentTitlePlaceholder')}
							value={assignmentTitle}
						/>
						<select
							className="rounded-md border px-2 py-1 text-sm"
							onChange={(e) => setAssignmentLesson(e.target.value)}
							value={assignmentLesson}
						>
							{levels.map((lv) => (
								<option key={lv.id} value={lv.id}>
									{lv.title}
								</option>
							))}
						</select>
						<Button onClick={handleAddAssignment}>{t('education.addAssignment')}</Button>
					</div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t('education.assignment')}</TableHead>
								<TableHead>{t('education.lesson')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{assignments.length === 0 ? (
								<TableRow>
									<TableCell className="text-muted-foreground" colSpan={2}>
										{t('education.noAssignments')}
									</TableCell>
								</TableRow>
							) : (
								assignments.map((a) => (
									<TableRow key={a.id}>
										<TableCell>{a.title}</TableCell>
										<TableCell>
											{levels.find((l) => l.id === a.lessonId)?.title ?? a.lessonId}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}

export default EducationPage
