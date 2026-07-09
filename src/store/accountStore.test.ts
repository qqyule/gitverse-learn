import { beforeEach, describe, expect, it } from 'vitest'
import { PAYMENT_KEYS_PENDING } from '@/services/payments'
import { useAccountStore } from '@/store/accountStore'

const reset = () =>
	useAccountStore.setState({
		aiTutorDate: '2000-01-01',
		aiTutorUsedToday: 0,
		isAuthed: false,
		profile: null,
	})

describe('accountStore — quota + upgrade (skeleton)', () => {
	beforeEach(reset)

	it('recordAiTutorUse requires a signed-in profile', () => {
		expect(useAccountStore.getState().recordAiTutorUse()).toBe(false)
	})

	it('allows AI tutor uses up to the free daily quota, then blocks', async () => {
		await useAccountStore.getState().signInWithEmail('a@b.com')
		const limit = 5
		for (let i = 0; i < limit; i += 1) {
			expect(useAccountStore.getState().recordAiTutorUse()).toBe(true)
		}
		expect(useAccountStore.getState().aiTutorUsedToday).toBe(limit)
		expect(useAccountStore.getState().recordAiTutorUse()).toBe(false)
	})

	it('resets the daily counter when the date rolls over', async () => {
		await useAccountStore.getState().signInWithEmail('c@d.com')
		// Simulate yesterday's exhausted counter.
		useAccountStore.setState({ aiTutorDate: '2000-01-01', aiTutorUsedToday: 5 })
		const ok = useAccountStore.getState().recordAiTutorUse()
		expect(ok).toBe(true)
		expect(useAccountStore.getState().aiTutorUsedToday).toBe(1)
		expect(useAccountStore.getState().aiTutorDate).not.toBe('2000-01-01')
	})

	it('beginCheckout returns PAYMENT_KEYS_PENDING in skeleton mode', async () => {
		const result = await useAccountStore.getState().beginCheckout('pro')
		expect(result).toEqual({ ok: false, reason: PAYMENT_KEYS_PENDING })
	})

	it('setTier / downgradeToFree mutate the profile tier', async () => {
		await useAccountStore.getState().signInWithEmail('e@f.com')
		useAccountStore.getState().setTier('team')
		expect(useAccountStore.getState().profile?.tier).toBe('team')
		useAccountStore.getState().downgradeToFree()
		expect(useAccountStore.getState().profile?.tier).toBe('free')
	})
})
