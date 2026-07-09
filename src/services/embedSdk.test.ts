import { describe, expect, it } from 'vitest'
import { getEmbedHtml, getEmbedSrc, validateEmbedOptions } from '@/services/embedSdk'

describe('embedSdk', () => {
	it('builds an embed src with no extra params by default', () => {
		expect(getEmbedSrc('level-1', { lessonId: 'level-1' })).toBe('/embed/level-1')
	})

	it('encodes theme, chrome, locale and height into the src', () => {
		const src = getEmbedSrc('level-2', {
			height: 640,
			hideChrome: true,
			lessonId: 'level-2',
			locale: 'zh-CN',
			theme: 'dark',
		})
		expect(src).toContain('/embed/level-2')
		expect(src).toContain('theme=dark')
		expect(src).toContain('chrome=0')
		expect(src).toContain('locale=zh-CN')
		expect(src).toContain('h=640')
	})

	it('produces an iframe snippet containing the src and a numeric height', () => {
		const { html, src } = getEmbedHtml('level-3', { height: 480, lessonId: 'level-3' })
		expect(html).toContain('<iframe')
		expect(html).toContain(src)
		expect(html).toContain('height:480px')
		expect(html).toContain('loading="lazy"')
	})

	it('encodes unsafe lesson ids so the html cannot break out', () => {
		const { html } = getEmbedHtml('a"b', { lessonId: 'a"b' })
		// The raw quote must never reach the markup; encodeURIComponent escapes it.
		expect(html).not.toContain('a"b')
		expect(html).toContain('a%22b')
	})

	it('validates embed options', () => {
		expect(validateEmbedOptions({ lessonId: '' }).ok).toBe(false)
		expect(validateEmbedOptions({ height: 50, lessonId: 'x' }).ok).toBe(false)
		expect(validateEmbedOptions({ lessonId: 'x' }).ok).toBe(true)
	})
})
