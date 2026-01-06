import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/ui/button'

describe('Button', () => {
	it('should render correctly', () => {
		render(<Button>Click me</Button>)
		expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
	})

	it('should handle click events', () => {
		const handleClick = vi.fn()
		render(<Button onClick={handleClick}>Click me</Button>)
		fireEvent.click(screen.getByRole('button', { name: /click me/i }))
		expect(handleClick).toHaveBeenCalledTimes(1)
	})

	it('should apply variant classes', () => {
		render(<Button variant="destructive">Destructive</Button>)
		const button = screen.getByRole('button', { name: /destructive/i })
		expect(button).toHaveClass('bg-destructive')
	})

	it('should apply size classes', () => {
		render(<Button size="sm">Small</Button>)
		const button = screen.getByRole('button', { name: /small/i })
		expect(button).toHaveClass('h-9')
	})

	it('should render as a child custom component when asChild is true', () => {
		render(
			<Button asChild>
				<a href="/link">Link Button</a>
			</Button>
		)
		const link = screen.getByRole('link', { name: /link button/i })
		expect(link).toBeInTheDocument()
		expect(link).toHaveClass('inline-flex items-center justify-center')
	})

	it('should be disabled when disabled prop is provided', () => {
		render(<Button disabled>Disabled</Button>)
		expect(screen.getByRole('button', { name: /disabled/i })).toBeDisabled()
	})
})
