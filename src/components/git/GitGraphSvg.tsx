import { AnimatePresence, motion } from 'framer-motion'
import React, { useRef } from 'react'
import { generateEdgePath, useGraphLayout } from '@/hooks/useGraphLayout'
import { cn, sanitizeSvgId } from '@/lib/utils'
import { useGitStore } from '@/store/gitStore'

// Memoized static SVG filters to prevent re-render
const GraphFilters = React.memo(function GraphFilters() {
	return (
		<defs>
			<filter height="200%" id={sanitizeSvgId('glow')} width="200%" x="-50%" y="-50%">
				<feGaussianBlur result="coloredBlur" stdDeviation="4" />
				<feMerge>
					<feMergeNode in="coloredBlur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
			<filter height="200%" id={sanitizeSvgId('shadow')} width="200%" x="-50%" y="-50%">
				<feDropShadow dx="0" dy="2" floodOpacity="0.3" stdDeviation="3" />
			</filter>
		</defs>
	)
})

// Memoized edge component for better performance
const GraphEdge = React.memo(function GraphEdge({
	edge,
	onAnimationComplete,
}: {
	edge: import('@/types/git').GraphEdge
	onAnimationComplete?: () => void
}) {
	return (
		<motion.path
			animate={{ opacity: 1, pathLength: 1 }}
			className="git-edge"
			d={generateEdgePath(edge.sourceX, edge.sourceY, edge.targetX, edge.targetY, edge.isMerge)}
			exit={{ opacity: 0 }}
			initial={{ opacity: 0, pathLength: 0 }}
			onAnimationComplete={onAnimationComplete}
			stroke={edge.color}
			strokeDasharray={edge.isMerge ? '6,4' : 'none'}
			strokeWidth={edge.isMerge ? 2 : 2.5}
			transition={{ duration: 0.5, ease: 'easeOut' }}
		/>
	)
})

interface GitGraphSvgProps {
	className?: string
	onNodeClick?: (hash: string) => void
	onNodeDragEnd?: (hash: string, targetHash: string) => void
}

export function GitGraphSvg({ className, onNodeClick }: GitGraphSvgProps) {
	const { commits, branches, HEAD } = useGitStore()
	const svgRef = useRef<SVGSVGElement>(null)

	const layout = useGraphLayout(commits, branches, HEAD.ref, HEAD.type)

	if (layout.nodes.length === 0) {
		return (
			<div className={cn('flex h-full items-center justify-center', className)}>
				<div className="text-center text-muted-foreground">
					<p className="text-lg">No commits yet</p>
					<p className="mt-2 text-sm">
						Run <code className="font-mono text-primary">git init</code> to start
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className={cn('overflow-auto', className)}>
			<svg
				className="min-w-full"
				height={layout.height}
				ref={svgRef}
				style={{ willChange: 'contents' }}
				width={layout.width}
			>
				<GraphFilters />
				{/* Render edges first (behind nodes) */}
				<g className="edges">
					<AnimatePresence>
						{layout.edges.map((edge) => (
							<GraphEdge edge={edge as any} key={edge.id} />
						))}
					</AnimatePresence>
				</g>

				{/* Render nodes */}
				<g className="nodes">
					<AnimatePresence>
						{layout.nodes.map((node) => (
							<motion.g
								animate={{ opacity: 1, scale: 1 }}
								className="cursor-pointer"
								exit={{ opacity: 0, scale: 0 }}
								initial={{ opacity: 0, scale: 0 }}
								key={node.id}
								onClick={() => onNodeClick?.(node.id)}
								transition={{
									damping: 25,
									delay: 0.1,
									stiffness: 500,
									type: 'spring',
								}}
							>
								{/* Node circle */}
								<motion.circle
									className="transition-all duration-200"
									cx={node.x}
									cy={node.y}
									fill={node.color}
									filter={node.isHead ? 'url(#glow)' : 'url(#shadow)'}
									r={node.isHead ? 20 : 16}
									whileHover={{ scale: 1.2 }}
									whileTap={{ scale: 0.95 }}
								/>

								{/* Inner highlight */}
								<circle cx={node.x - 5} cy={node.y - 5} fill="white" opacity={0.3} r={5} />

								{/* Branch labels */}
								{node.branches.length > 0 && (
									<g>
										{node.branches.slice(0, 2).map((branchName, i) => {
											const branch = branches[branchName]
											const yOffset = node.isHead ? 45 + i * 40 : 40 + i * 40

											return (
												<motion.g
													animate={{ opacity: 1, y: 0 }}
													initial={{ opacity: 0, y: 10 }}
													key={branchName}
													transition={{ delay: 0.2 + i * 0.1 }}
												>
													<rect
														fill="hsl(var(--secondary))"
														height={34}
														rx={6}
														stroke={branch?.color || node.color}
														strokeWidth={1.5}
														width={120}
														x={node.x - 60}
														y={node.y + yOffset - 17}
													/>
													<text
														className="fill-foreground font-bold text-[12px]"
														textAnchor="middle"
														x={node.x}
														y={node.y + yOffset - 4}
													>
														{branchName.length > 15 ? `${branchName.slice(0, 14)}…` : branchName}
													</text>
													<text
														className="fill-muted-foreground font-mono text-[10px]"
														textAnchor="middle"
														x={node.x}
														y={node.y + yOffset + 10}
													>
														{node.id.slice(0, 7)}
													</text>
												</motion.g>
											)
										})}
									</g>
								)}

								{/* Commit hash tooltip */}
								<title>
									{node.commit.message} ({node.id.slice(0, 7)})
								</title>
							</motion.g>
						))}
					</AnimatePresence>
				</g>

				{/* HEAD indicator - Rendered separately for smooth animation between nodes */}
				<AnimatePresence>
					{layout.nodes
						.filter((n) => n.isHead)
						.map((headNode) => (
							<motion.g
								animate={{ x: headNode.x, y: headNode.y }}
								initial={false}
								key="HEAD"
								transition={{
									damping: 30,
									stiffness: 500,
									type: 'spring',
								}}
							>
								<motion.g
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									initial={{ opacity: 0, y: -10 }}
								>
									<rect
										fill="hsl(172, 66%, 50%)"
										filter="url(#shadow)"
										height={22}
										rx={11}
										width={50}
										x={-25}
										y={-45}
									/>
									<text
										className="fill-background font-bold text-[12px] uppercase tracking-wider"
										textAnchor="middle"
										x={0}
										y={-30}
									>
										HEAD
									</text>
								</motion.g>
							</motion.g>
						))}
				</AnimatePresence>
			</svg>
		</div>
	)
}
