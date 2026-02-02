import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
	children: ReactNode
	fallback?: ReactNode
}

interface State {
	hasError: boolean
	error: Error | null
	errorInfo: ReactNode
}

export class ErrorBoundary extends Component<Props, State> {
	state: State = {
		hasError: false,
		error: null,
		errorInfo: null,
	}

	static getDerivedStateFromError(error: Error): State {
		return {
			hasError: true,
			error,
			errorInfo: null,
		}
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Error caught by ErrorBoundary:', error)
		console.error('Component stack:', errorInfo.componentStack)

		this.setState({
			error,
			errorInfo: errorInfo.componentStack,
		})
	}

	handleReload = () => {
		if (typeof window !== 'undefined') {
			window.location.reload()
		}
	}

	handleReset = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		})
	}

	render() {
		if (this.state.hasError) {
			// Custom fallback UI
			if (this.props.fallback) {
				return this.props.fallback
			}

			return (
				<div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
					<div className="max-w-md space-y-4">
						<h2 className="text-2xl font-bold text-destructive">Something went wrong</h2>
						<p className="text-muted-foreground">
							An unexpected error occurred. Please try again or reload the page.
						</p>
						{this.state.error && (
							<details className="text-left p-4 bg-muted rounded-lg text-sm">
								<summary className="cursor-pointer font-medium">
									Error: {this.state.error.message}
								</summary>
								<pre className="mt-2 overflow-auto text-xs text-muted-foreground">
									{this.state.error.stack}
								</pre>
							</details>
						)}
						<div className="flex gap-4 justify-center pt-4">
							<Button onClick={this.handleReload} variant="default">
								Reload Page
							</Button>
							<Button onClick={this.handleReset} variant="outline">
								Try Again
							</Button>
						</div>
					</div>
				</div>
			)
		}

		return this.props.children
	}
}

// Simple hook-based error boundary for functional components
export function useErrorBoundary() {
	const [error, setError] = React.useState<Error | null>(null)

	const resetError = () => setError(null)

	if (error) {
		throw error
	}

	return { resetError }
}
