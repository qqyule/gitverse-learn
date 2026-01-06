import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { NavLink } from '@/components/NavLink'

describe('NavLink', () => {
	it('should render children correctly', () => {
		render(
			<MemoryRouter>
				<NavLink to="/test">Test Link</NavLink>
			</MemoryRouter>
		)
		expect(screen.getByText('Test Link')).toBeInTheDocument()
	})

	it('should apply custom class names', () => {
		render(
			<MemoryRouter>
				<NavLink to="/test" className="custom-class">
					Test Link
				</NavLink>
			</MemoryRouter>
		)
		const link = screen.getByText('Test Link')
		expect(link).toHaveClass('custom-class')
	})

	it('should apply active class when link is active', () => {
		render(
			<MemoryRouter initialEntries={['/test']}>
				<NavLink to="/test" activeClassName="active-class">
					Test Link
				</NavLink>
			</MemoryRouter>
		)
		const link = screen.getByText('Test Link')
		expect(link).toHaveClass('active-class')
	})

	it('should not apply active class when link is inactive', () => {
		render(
			<MemoryRouter initialEntries={['/other']}>
				<NavLink to="/test" activeClassName="active-class">
					Test Link
				</NavLink>
			</MemoryRouter>
		)
		const link = screen.getByText('Test Link')
		expect(link).not.toHaveClass('active-class')
	})
})
