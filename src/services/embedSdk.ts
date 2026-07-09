/**
 * M6 — Embeddable lesson SDK (pure functions, no backend required).
 *
 * Lets any third-party site embed a GitMaster lesson as an `<iframe>`. The
 * generated `src` resolves to the app's own `/embed` route (which we also
 * wire up), so the lesson runs fully client-side. This is the "open SDK"
 * surface of the platform: it is usable immediately, before any API backend
 * exists, by pointing at a deployed instance of the SPA.
 */

import type { EmbedOptions, LessonEmbed } from '@/types/api'

/** Build the embed source URL for a lesson. */
export const getEmbedSrc = (lessonId: string, options: EmbedOptions): string => {
	const params = new URLSearchParams()
	if (options.theme && options.theme !== 'auto') params.set('theme', options.theme)
	if (options.hideChrome) params.set('chrome', '0')
	if (options.locale) params.set('locale', options.locale)
	if (options.height) params.set('h', String(options.height))
	const query = params.toString()
	return `/embed/${encodeURIComponent(lessonId)}${query ? `?${query}` : ''}`
}

const escapeHtml = (value: string): string =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Generate a copy-paste `<iframe>` snippet for a lesson. Pure — safe to call
 * in the browser without any network. `height` defaults to 520px.
 */
export const getEmbedHtml = (
	lessonId: string,
	options: EmbedOptions = { lessonId }
): LessonEmbed => {
	const src = getEmbedSrc(lessonId, options)
	const height = options.height ?? 520
	const html =
		`<iframe src="${escapeHtml(src)}" ` +
		'title="GitMaster Lesson" ' +
		'style="width:100%;height:' +
		`${height}px;border:0;border-radius:12px;" ` +
		'loading="lazy" ' +
		'allow="clipboard-write" ' +
		'referrerpolicy="strict-origin-when-cross-origin"></iframe>'
	return { html, src }
}

/** Validate that an embed request is well-formed before generating code. */
export const validateEmbedOptions = (
	options: EmbedOptions
): { ok: true } | { error: string; ok: false } => {
	if (!options.lessonId || typeof options.lessonId !== 'string') {
		return { error: 'lessonId is required', ok: false }
	}
	if (
		options.height !== undefined &&
		(typeof options.height !== 'number' || options.height < 120)
	) {
		return { error: 'height must be a number >= 120', ok: false }
	}
	// `theme` is constrained by the EmbedOptions type, so no runtime check needed.
	return { ok: true }
}
