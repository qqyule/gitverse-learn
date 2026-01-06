import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const languages = [
	{ code: 'en', label: 'English', flag: '🇺🇸' },
	{ code: 'zh-CN', label: '中文', flag: '🇨🇳' },
]

/**
 * 语言切换下拉菜单组件
 * 支持中英文切换
 */
export const LanguageSwitch = () => {
	const { i18n } = useTranslation()
	const currentLang = languages.find((l) => l.code === i18n.language) || languages[0]

	const handleLanguageChange = (langCode: string) => {
		i18n.changeLanguage(langCode)
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Switch language">
					<Languages className="h-5 w-5" />
					<span className="sr-only">Switch language</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{languages.map((lang) => (
					<DropdownMenuItem
						key={lang.code}
						onClick={() => handleLanguageChange(lang.code)}
						className={i18n.language === lang.code ? 'bg-accent' : ''}
					>
						<span className="mr-2">{lang.flag}</span>
						{lang.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
