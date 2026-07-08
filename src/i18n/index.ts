import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enTranslation from './locales/en.json'
import zhCNTranslation from './locales/zh-CN.json'

// Simple language detector without external dependency
const supportedLanguages = ['en', 'zh-CN', 'zh']

const getInitialLanguage = (): string => {
	if (typeof window === 'undefined') return 'en'

	// 1. Check localStorage
	const savedLang = localStorage.getItem('i18n-language')
	if (savedLang && supportedLanguages.includes(savedLang)) {
		return savedLang
	}

	// 2. Check navigator.language
	const browserLang = navigator.language || navigator.languages?.[0]
	if (browserLang) {
		// Handle variants like 'zh-CN', 'zh-TW', 'en-US'
		const langPart = browserLang.split('-')[0].toLowerCase()
		const langVariant = supportedLanguages.find(
			(l) => l.toLowerCase() === browserLang.toLowerCase() || l.toLowerCase().startsWith(langPart)
		)
		if (langVariant) return langVariant
	}

	// 3. Default to English
	return 'en'
}

const languageDetector = {
	cacheUserLanguage: (lng: string) => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('i18n-language', lng)
		}
	},
	detect: () => getInitialLanguage(),
	type: 'languageDetector' as const,
}

/**
 * i18n 国际化配置
 * 支持中英双语，自动检测浏览器语言
 */
i18n
	.use(languageDetector)
	.use(initReactI18next)
	.init({
		debug: import.meta.env.DEV,
		detection: {
			caches: ['localStorage'],
			lookupLocalStorage: 'i18n-language',
			// 语言检测顺序：localStorage > navigator
			order: ['localStorage', 'navigator'],
		},
		fallbackLng: 'en',
		interpolation: {
			escapeValue: false, // React 已经处理 XSS
		},
		resources: {
			en: {
				translation: enTranslation,
			},
			'zh-CN': {
				translation: zhCNTranslation,
			},
		},
	})

export default i18n
