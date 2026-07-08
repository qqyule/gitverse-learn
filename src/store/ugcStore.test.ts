import { beforeEach, describe, expect, it } from 'vitest'
import type { UgcLevel } from '@/types/level'
import { useUgcStore } from './ugcStore'

const sample: UgcLevel = {
	commands: ['git init'],
	description: 'desc',
	goal: 'goal',
	hints: ['h'],
	id: 'my-level',
	phase: 1,
	subtitle: 'sub',
	title: 'My Level',
	titleZh: '我的关卡',
	validationRules: [{ type: 'minCommits', value: 1 }],
}

describe('ugcStore', () => {
	beforeEach(() => {
		useUgcStore.setState({ activeShared: null, drafts: [] })
	})

	it('saveDraft then getDraft round-trips', () => {
		useUgcStore.getState().saveDraft(sample)
		expect(useUgcStore.getState().getDraft('my-level')?.title).toBe('My Level')
	})

	it('saveDraft overwrites by id (no duplicates)', () => {
		const store = useUgcStore.getState()
		store.saveDraft(sample)
		store.saveDraft({ ...sample, title: 'Updated' })
		const drafts = useUgcStore.getState().drafts
		expect(drafts).toHaveLength(1)
		expect(drafts[0].title).toBe('Updated')
	})

	it('deleteDraft removes the entry', () => {
		useUgcStore.getState().saveDraft(sample)
		useUgcStore.getState().deleteDraft('my-level')
		expect(useUgcStore.getState().drafts).toHaveLength(0)
	})

	it('encodeShare / decodeShare round-trips with Chinese content', () => {
		const encoded = useUgcStore.getState().encodeShare(sample)
		const decoded = useUgcStore.getState().decodeShare(encoded)
		expect(decoded.ok).toBe(true)
		if (decoded.ok) {
			expect(decoded.level.titleZh).toBe('我的关卡')
			expect(decoded.level.validationRules).toHaveLength(1)
		}
	})

	it('importFromText accepts valid JSON and rejects invalid', () => {
		const ok = useUgcStore.getState().importFromText(JSON.stringify(sample))
		expect(ok.ok).toBe(true)
		const bad = useUgcStore.getState().importFromText('{ not json')
		expect(bad.ok).toBe(false)
	})

	it('decodeShare rejects garbage', () => {
		const result = useUgcStore.getState().decodeShare('!!!not-base64!!!')
		expect(result.ok).toBe(false)
	})
})
