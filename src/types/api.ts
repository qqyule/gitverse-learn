/**
 * M6 — Platform & scale domain types.
 *
 * Covers three scale-out surfaces that are intentionally *architectural
 * skeletons* in this milestone (the user mandated "architecture complete +
 * locally runnable" for M3–M6, with no live backend yet):
 *
 *  1. Open API / SDK — programmatic access + embeddable lessons.
 *  2. B2B education edition — classrooms, assignments, student progress.
 *  3. Multi-tenant — every org-scoped entity carries an `orgId` so a future
 *     backend can isolate data per tenant.
 *
 * All of these degrade gracefully when `VITE_API_BASE_URL` is absent: the UI
 * still renders (driven by local mock stores), and network calls short-circuit
 * with `{ ok: false, reason: 'API_NOT_CONFIGURED' }` instead of throwing.
 */

/** Scopes a generated API key may request. */
export type ApiScope = 'read:progress' | 'write:progress' | 'read:lessons' | 'embed:lessons'

/** A programmatic access credential (server-side secret is never returned). */
export interface ApiKey {
	/** ISO timestamp the key was created. */
	createdAt: string
	/** Masked representation safe to show in the UI, e.g. "gm_live_••••a3f1". */
	display: string
	/** Free-form label chosen by the owner. */
	label: string
	/** Owning tenant; "personal" for single-user keys. */
	orgId: string
	/** Granted scopes. */
	scopes: ApiScope[]
}

/** Options for embedding a lesson into a third-party site. */
export interface EmbedOptions {
	/** Optional height override in px (width is always fluid/responsive). */
	height?: number
	/** Hide the chrome (header / nav) for an inline widget feel. */
	hideChrome?: boolean
	/** Lesson / level id to embed. */
	lessonId: string
	/** Locale for the embedded UI. */
	locale?: 'en' | 'zh-CN'
	/** Embedding surface. */
	theme?: 'light' | 'dark' | 'auto'
}

/** Result of generating an embed snippet. */
export interface LessonEmbed {
	/** Full `<iframe>` HTML safe to paste into any CMS / LMS. */
	html: string
	/** Source URL the iframe points at. */
	src: string
}

/** A tenant (org) in the multi-tenant model. */
export interface B2BOrg {
	/** ISO timestamp the org was created. */
	createdAt: string
	id: string
	name: string
	/** Slug used in subdomains / api paths. */
	slug: string
}

/** A classroom inside an org. */
export interface B2BClassroom {
	createdAt: string
	id: string
	name: string
	/** Owning tenant. */
	orgId: string
	/** Student display identifiers enrolled in the classroom. */
	studentIds: string[]
}

/** An assignment: a lesson (level) given to a classroom. */
export interface B2BAssignment {
	classroomId: string
	createdAt: string
	/** ISO due date, or null for open-ended. */
	dueAt: string | null
	id: string
	/** Target lesson / level id. */
	lessonId: string
	orgId: string
	/** Human title shown to students. */
	title: string
}

/** Per-student progress on an assignment. */
export interface B2BStudentProgress {
	assignmentId: string
	/** Lesson completion ratio in [0, 1]. */
	completion: number
	orgId: string
	/** True once the student passed the lesson's validation. */
	passed: boolean
	studentId: string
	updatedAt: string
}
