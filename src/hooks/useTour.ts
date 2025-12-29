import { useCallback, useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { driver, Driver, DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'
import { tourSteps, TOUR_STORAGE_KEY } from '@/lib/tourSteps'

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
	/** 开始引导 */
	startTour: () => void
	/** 停止引导 */
	stopTour: () => void
	/** 引导是否正在进行 */
	isActive: boolean
	/** 是否为首次访问 */
	isFirstVisit: boolean
}

/**
 * 用户引导 Hook
 * 封装 driver.js 引导逻辑，支持国际化和首次访问检测
 */
export const useTour = (options: UseTourOptions = {}): UseTourReturn => {
	const { autoStart = true, autoStartDelay = 800 } = options
	const { t, i18n } = useTranslation()
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
					title: t('tour.welcome.title'),
					description: t('tour.welcome.description'),
				},
			},
			// 功能区域步骤
			...tourSteps.map((step) => ({
				element: step.element,
				popover: {
					title: t(`${step.i18nKey}.title`),
					description: t(`${step.i18nKey}.description`),
					side: step.popoverPosition as 'top' | 'bottom' | 'left' | 'right',
				},
			})),
		]
	}, [t])

	/**
	 * 创建 driver 实例
	 */
	const createDriver = useCallback((): Driver => {
		return driver({
			showProgress: true,
			animate: true,
			smoothScroll: true,
			allowClose: true,
			overlayColor: 'rgba(0, 0, 0, 0.75)',
			stagePadding: 8,
			stageRadius: 8,
			popoverClass: 'gitmaster-tour-popover',
			progressText: '{{current}} / {{total}}',
			nextBtnText: t('tour.buttons.next'),
			prevBtnText: t('tour.buttons.prev'),
			doneBtnText: t('tour.buttons.done'),
			onDestroyed: () => {
				setIsActive(false)
				markTourCompleted()
				setFirstVisit(false)
			},
			steps: generateSteps(),
		})
	}, [generateSteps, t])

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
	}, [i18n.language, createDriver, isActive])

	// 清理
	useEffect(() => {
		return () => {
			if (driverRef.current) {
				driverRef.current.destroy()
			}
		}
	}, [])

	return {
		startTour,
		stopTour,
		isActive,
		isFirstVisit: firstVisit,
	}
}

/**
 * 重置引导状态，允许用户重新体验引导
 */
export const restartTour = (): void => {
	resetTourStatus()
}
