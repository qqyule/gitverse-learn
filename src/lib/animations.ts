import anime from 'animejs'

/**
 * 动画配置选项接口
 */
interface AnimationOptions {
	duration?: number
	easing?: string
	delay?: number
	complete?: () => void
}

/**
 * 通用进场动画 (淡入 + 上浮)
 */
export const animateIn = (target: string | HTMLElement | null, options?: AnimationOptions) => {
	if (!target) return
	anime({
		targets: target,
		opacity: [0, 1],
		translateY: [20, 0],
		duration: options?.duration || 800,
		easing: options?.easing || 'easeOutExpo',
		delay: options?.delay || 0,
		complete: options?.complete,
	})
}

/**
 * 通用出场动画 (淡出 + 下沉)
 */
export const animateOut = (target: string | HTMLElement | null, options?: AnimationOptions) => {
	if (!target) return
	anime({
		targets: target,
		opacity: [1, 0],
		translateY: [0, 20],
		duration: options?.duration || 600,
		easing: options?.easing || 'easeInExpo',
		delay: options?.delay || 0,
		complete: options?.complete,
	})
}

/**
 * 点击脉冲反馈效果
 * 快速缩小再恢复，模拟弹簧效果
 */
export const pulse = (target: string | HTMLElement | null) => {
	if (!target) return
	anime({
		targets: target,
		scale: [1, 0.95, 1],
		duration: 300,
		easing: 'easeInOutQuad',
	})
}

/**
 * 子元素列表交错进场
 * 适用于列表、网格布局的子项依次出现
 */
export const staggerChildren = (
	targets: string | HTMLElement | NodeList | HTMLCollection | HTMLElement[] | null,
	options?: AnimationOptions
) => {
	if (!targets) return
	anime({
		targets: targets,
		opacity: [0, 1],
		translateY: [20, 0],
		delay: anime.stagger(100, { start: options?.delay || 0 }), // 每个元素延迟 100ms
		duration: options?.duration || 800,
		easing: options?.easing || 'easeOutExpo',
		complete: options?.complete,
	})
}

/**
 * 页面整体进场动画
 * 稍微显著一点的滑入效果
 */
export const pageEnter = (target: string | HTMLElement | null, options?: AnimationOptions) => {
	if (!target) return
	anime({
		targets: target,
		opacity: [0, 1],
		translateY: [30, 0],
		duration: options?.duration || 1000,
		easing: 'easeOutCubic',
		delay: options?.delay || 0,
		complete: options?.complete,
	})
}

/**
 * 强调动画 (晃动)
 * 用于错误提示或引起注意
 */
export const shake = (target: string | HTMLElement | null) => {
	if (!target) return
	anime({
		targets: target,
		translateX: [
			{ value: -10, duration: 100 },
			{ value: 10, duration: 100 },
			{ value: -10, duration: 100 },
			{ value: 10, duration: 100 },
			{ value: 0, duration: 100 },
		],
		easing: 'easeInOutQuad',
	})
}
