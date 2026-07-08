import { type Driver, type DriveStep, driver } from 'driver.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import 'driver.js/dist/driver.css'
import { TOUR_STORAGE_KEY, tourSteps } from '@/lib/tourSteps'

/**
 * 检查是否为首次访问（未完成过引导）
 */
const isFirstVisit = (): boolean => {
	if (typeof window === 'undefined') return false
	return localStorage.getItem(TOUR_STORAGE_KEY) !== 'true'
}

/**
 * 标记引导已完成
 */
const markTourCompleted = (): void => {
	localStorage.setItem(TOUR_STORAGE_KEY, 'true')
}

/**
 * 重置引导状态（用于重新开始引导）
 */
const resetTourStatus = (): void => {
	localStorage.removeItem(TOUR_STORAGE_KEY)
}

interface UseTourOptions {
	/** 是否在首次访问时自动开始引导 */
	autoStart?: boolean
	/** 自动开始的延迟时间（毫秒） */
	autoStartDelay?: number
}

interface UseTourReturn {
	/** 引导是否正在进行 */
	isActive: boolean
	/** 是否为首次访问 */
	isFirstVisit: boolean
	/** 开始引导 */
	startTour: () => void
	/** 停止引导 */
	stopTour: () => void
}

/**
 * 用户引导 Hook
 * 封装 driver.js 引导逻辑，支持国际化和首次访问检测
 */
export const useTour = (options: UseTourOptions = {}): UseTourReturn => {
	const { autoStart = true, autoStartDelay = 800 } = options
	const { t } = useTranslation()
	const [isActive, setIsActive] = useState(false)
	const [firstVisit, setFirstVisit] = useState(false)
	const driverRef = useRef<Driver | null>(null)

	/**
	 * 根据当前语言生成引导步骤
	 */
	const generateSteps = useCallback((): DriveStep[] => {
		return [
			// 欢迎步骤（无元素高亮）
			{
				popover: {
					description: t('tour.welcome.description'),
					title: t('tour.welcome.title'),
				},
			},
			// 功能区域步骤
			...tourSteps.map((step) => ({
				element: step.element,
				popover: {
					description: t(`${step.i18nKey}.description`),
					side: step.popoverPosition as 'top' | 'bottom' | 'left' | 'right',
					title: t(`${step.i18nKey}.title`),
				},
			})),
		]
	}, [t])

	/**
	 * 创建 driver 实例
	 */
	const createDriver = useCallback(
		(): Driver =>
			driver({
				allowClose: true,
				animate: true,
				doneBtnText: t('tour.buttons.done'),
				nextBtnText: t('tour.buttons.next'),
				onDestroyed: () => {
					setIsActive(false)
					markTourCompleted()
					setFirstVisit(false)
				},
				overlayColor: 'rgba(0, 0, 0, 0.75)',
				popoverClass: 'gitmaster-tour-popover',
				prevBtnText: t('tour.buttons.prev'),
				progressText: '{{current}} / {{total}}',
				showProgress: true,
				smoothScroll: true,
				stagePadding: 8,
				stageRadius: 8,
				steps: generateSteps(),
			}),
		[generateSteps, t]
	)

	/**
	 * 开始引导
	 */
	const startTour = useCallback(() => {
		// 确保销毁之前的实例
		if (driverRef.current) {
			driverRef.current.destroy()
		}

		const driverInstance = createDriver()
		driverRef.current = driverInstance
		setIsActive(true)
		driverInstance.drive()
	}, [createDriver])

	/**
	 * 停止引导
	 */
	const stopTour = useCallback(() => {
		if (driverRef.current) {
			driverRef.current.destroy()
			driverRef.current = null
		}
		setIsActive(false)
	}, [])

	// 检测首次访问
	useEffect(() => {
		const first = isFirstVisit()
		setFirstVisit(first)
	}, [])

	// 自动开始引导（首次访问时）
	useEffect(() => {
		if (autoStart && firstVisit && !isActive) {
			const timer = setTimeout(() => {
				startTour()
			}, autoStartDelay)

			return () => clearTimeout(timer)
		}
	}, [autoStart, firstVisit, isActive, autoStartDelay, startTour])

	// 语言切换时更新 driver 配置
	useEffect(() => {
		if (driverRef.current && isActive) {
			// 语言切换时重新创建引导
			driverRef.current.destroy()
			const newDriver = createDriver()
			driverRef.current = newDriver
			newDriver.drive()
		}
	}, [createDriver, isActive])

	// 清理
	useEffect(
		() => () => {
			if (driverRef.current) {
				driverRef.current.destroy()
			}
		},
		[]
	)

	return {
		isActive,
		isFirstVisit: firstVisit,
		startTour,
		stopTour,
	}
}

/**
 * 重置引导状态，允许用户重新体验引导
 */
export const restartTour = (): void => {
	resetTourStatus()
}
