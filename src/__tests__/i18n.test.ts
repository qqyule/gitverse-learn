import { describe, it, expect, beforeEach } from 'vitest'
import i18n from '@/i18n'

describe('i18n 国际化', () => {
	beforeEach(async () => {
		await i18n.changeLanguage('en')
	})

	describe('语言切换', () => {
		it('应该能切换到中文', async () => {
			await i18n.changeLanguage('zh-CN')
			expect(i18n.language).toBe('zh-CN')
		})

		it('应该能切换到英文', async () => {
			await i18n.changeLanguage('en')
			expect(i18n.language).toBe('en')
		})
	})

	describe('翻译 key 完整性', () => {
		it('英文翻译应包含首页标题', () => {
			const title = i18n.t('home.title')
			expect(title).toBe('GitMaster')
		})

		it('英文翻译应包含开始学习按钮', () => {
			const btn = i18n.t('home.startButton')
			expect(btn).toBe('Start Learning')
		})

		it('中文翻译应包含首页标题', async () => {
			await i18n.changeLanguage('zh-CN')
			const title = i18n.t('home.title')
			expect(title).toBe('GitMaster')
		})

		it('中文翻译应包含开始学习按钮', async () => {
			await i18n.changeLanguage('zh-CN')
			const btn = i18n.t('home.startButton')
			expect(btn).toBe('开始学习')
		})
	})

	describe('关卡翻译', () => {
		it('应该能获取 level-1 的英文标题', () => {
			const title = i18n.t('levels.level-1.title')
			expect(title).toBe('First Snapshot')
		})

		it('应该能获取 level-1 的中文标题', async () => {
			await i18n.changeLanguage('zh-CN')
			const title = i18n.t('levels.level-1.title')
			expect(title).toBe('第一次快照')
		})
	})
})
