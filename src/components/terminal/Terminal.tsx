import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Terminal as TerminalIcon } from 'lucide-react'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useGitStore } from '@/store/gitStore'

interface TerminalProps {
	className?: string
	externalInput?: string
	isExpanded?: boolean
	onInputChange?: (value: string) => void
	onToggle?: () => void
}

export function Terminal({
	className,
	isExpanded = true,
	onToggle,
	externalInput,
	onInputChange,
}: TerminalProps) {
	const [input, setInput] = useState('')
	const [history, setHistory] = useState<{ command: string; output: string }[]>([])
	const [historyIndex, setHistoryIndex] = useState(-1)
	const inputRef = useRef<HTMLInputElement>(null)
	const outputRef = useRef<HTMLButtonElement>(null)

	const { executeCommand } = useGitStore()
	const { t } = useTranslation()

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!input.trim()) return

		const output = executeCommand(input.trim())
		setHistory((prev) => [...prev, { command: input, output }])
		setInput('')
		setHistoryIndex(-1)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowUp') {
			e.preventDefault()
			const commands = history.map((h) => h.command)
			if (commands.length > 0) {
				const newIndex = historyIndex < commands.length - 1 ? historyIndex + 1 : historyIndex
				setHistoryIndex(newIndex)
				setInput(commands[commands.length - 1 - newIndex] || '')
			}
		} else if (e.key === 'ArrowDown') {
			e.preventDefault()
			if (historyIndex > 0) {
				const newIndex = historyIndex - 1
				setHistoryIndex(newIndex)
				const commands = history.map((h) => h.command)
				setInput(commands[commands.length - 1 - newIndex] || '')
			} else {
				setHistoryIndex(-1)
				setInput('')
			}
		}
	}

	useEffect(() => {
		if (outputRef.current) {
			outputRef.current.scrollTop = outputRef.current.scrollHeight
		}
	}, [])

	useEffect(() => {
		if (isExpanded && inputRef.current) {
			inputRef.current.focus()
		}
	}, [isExpanded])

	useEffect(() => {
		if (externalInput !== undefined) {
			setInput(externalInput)
			if (inputRef.current) {
				inputRef.current.focus()
			}
		}
	}, [externalInput])

	return (
		<div
			className={cn(
				'flex flex-col overflow-hidden rounded-lg border border-border bg-card',
				className
			)}
		>
			{/* Header */}
			<button
				className="flex items-center justify-between border-border border-b bg-secondary/50 px-4 py-2 transition-colors hover:bg-secondary/70"
				onClick={onToggle}
				type="button"
			>
				<div className="flex items-center gap-2">
					<TerminalIcon className="h-4 w-4 text-primary" />
					<span className="font-medium text-sm">{t('terminal.title')}</span>
				</div>
				{isExpanded ? (
					<ChevronDown className="h-4 w-4 text-muted-foreground" />
				) : (
					<ChevronUp className="h-4 w-4 text-muted-foreground" />
				)}
			</button>

			{/* Terminal content */}
			<AnimatePresence>
				{isExpanded && (
					<motion.div
						animate={{ height: 'auto' }}
						className="overflow-hidden"
						exit={{ height: 0 }}
						initial={{ height: 0 }}
						transition={{ duration: 0.2 }}
					>
						{/* Output */}
						<button
							aria-label={t('terminal.focusLabel')}
							className="h-48 space-y-2 overflow-y-auto p-4 text-left font-mono text-sm"
							onClick={() => {
								if (!window.getSelection()?.toString()) {
									inputRef.current?.focus()
								}
							}}
							ref={outputRef}
							type="button"
						>
							{history.length === 0 && (
								<div className="text-muted-foreground">
									<p>{t('terminal.welcome')}</p>
									<p className="mt-1">
										{t('terminal.tryLabel')} <span className="text-primary">git init</span>
									</p>
								</div>
							)}
							{history.map((entry, i) => (
								<div className="space-y-1" key={i}>
									<div className="flex items-center gap-2">
										<span className="text-success">$</span>
										<span className="text-foreground">{entry.command}</span>
									</div>
									{entry.output && (
										<pre className="whitespace-pre-wrap pl-4 text-muted-foreground">
											{entry.output}
										</pre>
									)}
								</div>
							))}
						</button>

						{/* Input */}
						<form className="border-border border-t" onSubmit={handleSubmit}>
							<div className="flex items-center gap-2 px-4 py-2">
								<span className="font-mono text-success">$</span>
								<input
									autoComplete="off"
									className="terminal-input text-foreground placeholder:text-muted-foreground"
									onChange={(e) => {
										setInput(e.target.value)
										onInputChange?.(e.target.value)
									}}
									onKeyDown={handleKeyDown}
									placeholder={t('terminal.placeholder')}
									ref={inputRef}
									spellCheck={false}
									type="text"
									value={input}
								/>
							</div>
						</form>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
