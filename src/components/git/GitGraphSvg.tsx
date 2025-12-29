import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGitStore } from '@/store/gitStore'
import { useGraphLayout, generateEdgePath } from '@/hooks/useGraphLayout'
import { cn } from '@/lib/utils'

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
			<div className={cn('flex items-center justify-center h-full', className)}>
				<div className="text-center text-muted-foreground">
					<p className="text-lg">No commits yet</p>
					<p className="text-sm mt-2">
						Run <code className="text-primary font-mono">git init</code> to
						start
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className={cn('overflow-auto', className)}>
			<svg
				ref={svgRef}
				width={layout.width}
				height={layout.height}
				className="min-w-full"
			>
				{/* Glow filter for nodes */}
				<defs>
					<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="4" result="coloredBlur" />
						<feMerge>
							<feMergeNode in="coloredBlur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
					<filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
						<feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
					</filter>
				</defs>

				{/* Render edges first (behind nodes) */}
				<g className="edges">
					<AnimatePresence>
						{layout.edges.map((edge) => (
							<motion.path
								key={edge.id}
								d={generateEdgePath(
									edge.sourceX,
									edge.sourceY,
									edge.targetX,
									edge.targetY,
									edge.isMerge
								)}
								className="git-edge"
								stroke={edge.color}
								strokeWidth={edge.isMerge ? 2 : 2.5}
								strokeDasharray={edge.isMerge ? '6,4' : 'none'}
								initial={{ pathLength: 0, opacity: 0 }}
								animate={{ pathLength: 1, opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.5, ease: 'easeOut' }}
							/>
						))}
					</AnimatePresence>
				</g>

				{/* Render nodes */}
				<g className="nodes">
					<AnimatePresence>
						{layout.nodes.map((node) => (
							<motion.g
								key={node.id}
								className="cursor-pointer"
								initial={{ scale: 0, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0, opacity: 0 }}
								transition={{
									type: 'spring',
									stiffness: 500,
									damping: 25,
									delay: 0.1,
								}}
								onClick={() => onNodeClick?.(node.id)}
							>
								{/* Node circle */}
								<motion.circle
									cx={node.x}
									cy={node.y}
									r={node.isHead ? 20 : 16}
									fill={node.color}
									filter={node.isHead ? 'url(#glow)' : 'url(#shadow)'}
									className="transition-all duration-200"
									whileHover={{ scale: 1.2 }}
									whileTap={{ scale: 0.95 }}
								/>

								{/* Inner highlight */}
								<circle
									cx={node.x - 5}
									cy={node.y - 5}
									r={5}
									fill="white"
									opacity={0.3}
								/>

								{/* HEAD indicator */}
								{node.isHead && (
									<motion.g
										initial={{ y: -10, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										transition={{ delay: 0.3 }}
									>
										<rect
											x={node.x - 25}
											y={node.y - 45}
											width={50}
											height={22}
											rx={11}
											fill="hsl(172, 66%, 50%)"
											filter="url(#shadow)"
										/>
										<text
											x={node.x}
											y={node.y - 30}
											textAnchor="middle"
											className="text-[12px] font-bold fill-background uppercase tracking-wider"
										>
											HEAD
										</text>
									</motion.g>
								)}

								{/* Branch labels */}
								{node.branches.length > 0 && (
									<g>
										{node.branches.slice(0, 2).map((branchName, i) => {
											const branch = branches[branchName]
											const yOffset = node.isHead ? 45 + i * 40 : 40 + i * 40

											return (
												<motion.g
													key={branchName}
													initial={{ y: 10, opacity: 0 }}
													animate={{ y: 0, opacity: 1 }}
													transition={{ delay: 0.2 + i * 0.1 }}
												>
													<rect
														x={node.x - 60}
														y={node.y + yOffset - 17}
														width={120}
														height={34}
														rx={6}
														fill="hsl(var(--secondary))"
														stroke={branch?.color || node.color}
														strokeWidth={1.5}
													/>
													<text
														x={node.x}
														y={node.y + yOffset - 4}
														textAnchor="middle"
														className="text-[12px] font-bold fill-foreground"
													>
														{branchName.length > 15
															? branchName.slice(0, 14) + '…'
															: branchName}
													</text>
													<text
														x={node.x}
														y={node.y + yOffset + 10}
														textAnchor="middle"
														className="text-[10px] font-mono fill-muted-foreground"
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
			</svg>
		</div>
	)
}
