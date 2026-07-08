import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
	children: ReactNode
	fallback?: ReactNode
}

interface State {
	error: Error | null
	errorInfo: ReactNode
	hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
	state: State = {
		error: null,
		errorInfo: null,
		hasError: false,
	}

	static getDerivedStateFromError(error: Error): State {
		return {
			error,
			errorInfo: null,
			hasError: true,
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
			error: null,
			errorInfo: null,
			hasError: false,
		})
	}

	render() {
		if (this.state.hasError) {
			// Custom fallback UI
			if (this.props.fallback) {
				return this.props.fallback
			}

			return (
				<div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
					<div className="max-w-md space-y-4">
						<h2 className="font-bold text-2xl text-destructive">Something went wrong</h2>
						<p className="text-muted-foreground">
							An unexpected error occurred. Please try again or reload the page.
						</p>
						{this.state.error && (
							<details className="rounded-lg bg-muted p-4 text-left text-sm">
								<summary className="cursor-pointer font-medium">
									Error: {this.state.error.message}
								</summary>
								<pre className="mt-2 overflow-auto text-muted-foreground text-xs">
									{this.state.error.stack}
								</pre>
							</details>
						)}
						<div className="flex justify-center gap-4 pt-4">
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
