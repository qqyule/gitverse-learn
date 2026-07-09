import { motion } from 'framer-motion'
import {
	BookOpen,
	GitBranch,
	GitCommit,
	GitMerge,
	Play,
	Sparkles,
	Terminal,
	Zap,
} from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { SyllabusModal } from '@/components/home/SyllabusModal'
import { PageTransition } from '@/components/layout/PageTransition'
import { Button } from '@/components/ui/button'
import { LanguageSwitch } from '@/components/ui/language-switch'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { communityLevels } from '@/data/community-levels'
import { useUgcStore } from '@/store/ugcStore'

export default function Index() {
	const navigate = useNavigate()
	const { t } = useTranslation()
	const encodeShare = useUgcStore((s) => s.encodeShare)
	const [showSyllabus, setShowSyllabus] = React.useState(false)

	const features = [
		{
			description: t('home.features.commits.description'),
			icon: GitCommit,
			title: t('home.features.commits.title'),
		},
		{
			description: t('home.features.branches.description'),
			icon: GitBranch,
			title: t('home.features.branches.title'),
		},
		{
			description: t('home.features.merges.description'),
			icon: GitMerge,
			title: t('home.features.merges.title'),
		},
		{
			description: t('home.features.terminal.description'),
			icon: Terminal,
			title: t('home.features.terminal.title'),
		},
	]

	const handleStart = () => {
		navigate('/learn/level-1')
	}

	return (
		<PageTransition className="min-h-screen overflow-hidden bg-background">
			{/* Header with theme/language toggle */}
			<header className="fixed top-0 right-0 left-0 z-50 flex items-center justify-end gap-2 p-4">
				<Button onClick={() => navigate('/api')} size="sm" variant="ghost">
					{t('home.api')}
				</Button>
				<Button onClick={() => navigate('/education')} size="sm" variant="ghost">
					{t('home.education')}
				</Button>
				<Button onClick={() => navigate('/pricing')} size="sm" variant="ghost">
					{t('home.pricing')}
				</Button>
				<LanguageSwitch />
				<ThemeToggle />
			</header>

			{/* Hero Section */}
			<div
				className="relative flex min-h-screen items-center justify-center"
				style={{
					background:
						'radial-gradient(ellipse at 50% 30%, hsl(var(--primary) / 0.15), transparent 60%)',
				}}
			>
				{/* Animated background elements */}
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					{[...Array(5)].map((_, i) => (
						<motion.div
							animate={{
								opacity: [0.3, 0.6, 0.3],
								y: [0, -20, 0],
							}}
							className="absolute h-2 w-2 rounded-full bg-primary/30"
							key={i}
							style={{
								left: `${20 + i * 15}%`,
								top: `${30 + (i % 3) * 20}%`,
							}}
							transition={{
								delay: i * 0.2,
								duration: 3 + i * 0.5,
								repeat: Number.POSITIVE_INFINITY,
							}}
						/>
					))}

					{/* Decorative git graph lines */}
					<svg className="absolute inset-0 h-full w-full opacity-20" role="img">
						<title>Decorative animated git graph</title>
						<motion.path
							animate={{ pathLength: 1 }}
							d="M 100 200 Q 200 100 300 200 T 500 200"
							fill="none"
							initial={{ pathLength: 0 }}
							stroke="hsl(var(--primary))"
							strokeWidth="2"
							transition={{ duration: 2, ease: 'easeInOut' }}
						/>
						<motion.path
							animate={{ pathLength: 1 }}
							d="M 600 300 Q 700 200 800 300 T 1000 300"
							fill="none"
							initial={{ pathLength: 0 }}
							stroke="hsl(var(--accent))"
							strokeWidth="2"
							transition={{ delay: 0.5, duration: 2, ease: 'easeInOut' }}
						/>
					</svg>
				</div>

				<div className="container relative z-10 mx-auto px-6">
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="mx-auto max-w-4xl text-center"
						initial={{ opacity: 0, y: 30 }}
						transition={{ duration: 0.8 }}
					>
						{/* Badge */}
						<motion.div
							animate={{ opacity: 1, scale: 1 }}
							className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2"
							initial={{ opacity: 0, scale: 0.8 }}
							transition={{ delay: 0.2 }}
						>
							<Sparkles className="h-4 w-4 text-primary" />
							<span className="font-medium text-primary text-sm">{t('home.badge')}</span>
						</motion.div>

						{/* Title */}
						<h1 className="mb-6 font-bold text-5xl md:text-7xl">
							<span className="gradient-text">{t('home.title')}</span>
							<br />
							<span className="text-foreground">{t('home.subtitle')}</span>
						</h1>

						<p className="mx-auto mb-8 max-w-2xl text-muted-foreground text-xl leading-relaxed">
							{t('home.description')}
						</p>

						{/* CTA Buttons */}
						<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Button
								className="gap-2 px-8 py-6 text-lg shadow-lg transition-shadow hover:shadow-primary/25"
								onClick={handleStart}
								size="lg"
							>
								<Play className="h-5 w-5" />
								{t('home.startButton')}
							</Button>
							<Button
								className="gap-2 px-8 py-6 text-lg"
								onClick={() => setShowSyllabus(true)}
								size="lg"
								variant="outline"
							>
								<BookOpen className="h-5 w-5" />
								{t('home.syllabusButton')}
							</Button>
						</div>

						{/* Stats */}
						<motion.div
							animate={{ opacity: 1 }}
							className="mt-12 flex items-center justify-center gap-8 text-muted-foreground text-sm"
							initial={{ opacity: 0 }}
							transition={{ delay: 0.8 }}
						>
							<div className="flex items-center gap-2">
								<Zap className="h-4 w-4 text-warning" />
								<span>{t('home.stats.levels')}</span>
							</div>
							<div className="flex items-center gap-2">
								<GitCommit className="h-4 w-4 text-primary" />
								<span>{t('home.stats.commands')}</span>
							</div>
							<div className="flex items-center gap-2">
								<Terminal className="h-4 w-4 text-success" />
								<span>{t('home.stats.cli')}</span>
							</div>
						</motion.div>
					</motion.div>
				</div>

				{/* Scroll indicator */}
				<motion.div
					animate={{ y: [0, 10, 0] }}
					className="absolute bottom-8 left-1/2 -translate-x-1/2"
					transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
				>
					<div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-muted-foreground/30 p-2">
						<motion.div
							animate={{ y: [0, 12, 0] }}
							className="h-1.5 w-1.5 rounded-full bg-primary"
							transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
						/>
					</div>
				</motion.div>
			</div>

			{/* Features Section */}
			<section className="bg-card/50 py-24">
				<div className="container mx-auto px-6">
					<motion.div
						className="mb-16 text-center"
						initial={{ opacity: 0, y: 20 }}
						viewport={{ once: true }}
						whileInView={{ opacity: 1, y: 0 }}
					>
						<h2 className="mb-4 font-bold text-3xl md:text-4xl">
							{t('home.features.title').split(' ').slice(0, -1).join(' ')}{' '}
							<span className="gradient-text">{t('home.features.title').split(' ').slice(-1)}</span>
						</h2>
						<p className="mx-auto max-w-xl text-muted-foreground">{t('home.features.subtitle')}</p>
					</motion.div>

					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{features.map((feature, index) => (
							<motion.div
								className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
								initial={{ opacity: 0, y: 20 }}
								key={feature.title}
								transition={{ delay: index * 0.1 }}
								viewport={{ once: true }}
								whileInView={{ opacity: 1, y: 0 }}
							>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
									<feature.icon className="h-6 w-6 text-primary" />
								</div>
								<h3 className="mb-2 font-semibold text-lg">{feature.title}</h3>
								<p className="text-muted-foreground text-sm">{feature.description}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Community Levels Section */}
			<section className="bg-card/50 py-24">
				<div className="container mx-auto px-6">
					<motion.div
						className="mb-16 text-center"
						initial={{ opacity: 0, y: 20 }}
						viewport={{ once: true }}
						whileInView={{ opacity: 1, y: 0 }}
					>
						<h2 className="mb-4 font-bold text-3xl md:text-4xl">{t('home.community.title')}</h2>
						<p className="mx-auto max-w-xl text-muted-foreground">{t('home.community.subtitle')}</p>
					</motion.div>

					<div className="grid gap-6 md:grid-cols-2">
						{communityLevels.map((level) => (
							<Link
								className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
								key={level.id}
								to={`/shared?l=${encodeShare(level)}`}
							>
								<div className="mb-2 flex items-center justify-between">
									<h3 className="font-semibold text-lg">{level.title}</h3>
									<span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
										UGC
									</span>
								</div>
								<p className="text-muted-foreground text-sm">{level.description}</p>
								<p className="mt-3 text-muted-foreground text-xs">
									@{level.author} · {t('home.community.play')}
								</p>
							</Link>
						))}
					</div>

					<div className="mt-8 text-center">
						<Button onClick={() => navigate('/editor')} variant="outline">
							{t('home.community.create')}
						</Button>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-24">
				<div className="container mx-auto px-6">
					<motion.div
						className="relative overflow-hidden rounded-2xl p-12 text-center"
						initial={{ opacity: 0, scale: 0.95 }}
						style={{
							background:
								'linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1))',
						}}
						viewport={{ once: true }}
						whileInView={{ opacity: 1, scale: 1 }}
					>
						<div className="relative z-10">
							<h2 className="mb-4 font-bold text-3xl md:text-4xl">{t('home.cta.title')}</h2>
							<p className="mx-auto mb-8 max-w-xl text-muted-foreground">
								{t('home.cta.description')}
							</p>
							<Button className="gap-2 px-8" onClick={handleStart} size="lg">
								<Play className="h-5 w-5" />
								{t('home.cta.button')}
							</Button>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-border border-t py-8">
				<div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
					<p>{t('home.footer')}</p>
				</div>
			</footer>

			<SyllabusModal isOpen={showSyllabus} onClose={() => setShowSyllabus(false)} />
		</PageTransition>
	)
}
