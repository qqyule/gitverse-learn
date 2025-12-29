/**
 * 用户引导步骤配置
 * 定义引导功能的各个步骤和对应的翻译 key
 */

export interface TourStep {
	/** 目标元素选择器（使用 data-tour 属性） */
	element: string
	/** 国际化翻译 key 前缀 */
	i18nKey: string
	/** 弹窗位置 */
	popoverPosition?: 'top' | 'bottom' | 'left' | 'right'
}

/**
 * 引导步骤列表
 * 按照用户浏览顺序排列
 */
export const tourSteps: TourStep[] = [
	{
		element: '[data-tour="sidebar-header"]',
		i18nKey: 'tour.steps.sidebarHeader',
		popoverPosition: 'right',
	},
	{
		element: '[data-tour="level-info"]',
		i18nKey: 'tour.steps.levelInfo',
		popoverPosition: 'right',
	},
	{
		element: '[data-tour="level-list"]',
		i18nKey: 'tour.steps.levelList',
		popoverPosition: 'right',
	},
	{
		element: '[data-tour="git-graph"]',
		i18nKey: 'tour.steps.gitGraph',
		popoverPosition: 'bottom',
	},
	{
		element: '[data-tour="terminal"]',
		i18nKey: 'tour.steps.terminal',
		popoverPosition: 'top',
	},
	{
		element: '[data-tour="files"]',
		i18nKey: 'tour.steps.files',
		popoverPosition: 'top',
	},
]

/** LocalStorage key 用于存储引导完成状态 */
export const TOUR_STORAGE_KEY = 'gitmaster-tour-completed'
