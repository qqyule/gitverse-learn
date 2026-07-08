import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import enTranslation from './locales/en.json'
import zhCNTranslation from './locales/zh-CN.json'

/**
 * i18n 国际化配置
 * 支持中英双语，自动检测浏览器语言
 */
i18n
	.use(LanguageDetector)
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
