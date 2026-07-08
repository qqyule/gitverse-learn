import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { PageTransition } from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'

const NotFound = () => {
	const { t } = useTranslation()
	const location = useLocation()

	useEffect(() => {
		console.error('404 Error: User attempted to access non-existent route:', location.pathname)
	}, [location.pathname])

	return (
		<PageTransition className="flex min-h-screen items-center justify-center bg-muted">
			<div className="text-center">
				<h1 className="mb-4 font-bold text-4xl">404</h1>
				<p className="mb-8 text-muted-foreground text-xl">{t('notFound.message')}</p>
				<Button asChild>
					<Link to="/">{t('notFound.home')}</Link>
				</Button>
			</div>
		</PageTransition>
	)
}

export default NotFound
