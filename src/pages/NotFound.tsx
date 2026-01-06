import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PageTransition } from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'

const NotFound = () => {
	const location = useLocation()

	useEffect(() => {
		console.error('404 Error: User attempted to access non-existent route:', location.pathname)
	}, [location.pathname])

	return (
		<PageTransition className="flex min-h-screen items-center justify-center bg-muted">
			<div className="text-center">
				<h1 className="mb-4 text-4xl font-bold">404</h1>
				<p className="mb-8 text-xl text-muted-foreground">Oops! Page not found</p>
				<Button asChild>
					<Link to="/">Return to Home</Link>
				</Button>
			</div>
		</PageTransition>
	)
}

export default NotFound
